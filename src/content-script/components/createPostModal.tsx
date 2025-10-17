import React, { useEffect, useState } from 'react';
import {
  Button,
  ConfigProvider,
  Tooltip,
  Switch,
} from 'antd';
// eslint-disable-next-line import/no-extraneous-dependencies
import { StyleProvider } from '@ant-design/cssinjs';
import { PlusOutlined } from '@ant-design/icons';
import WaivioTags from './WaivioTags';
import { DraggableModal } from './DraggableModal';
import { PostFormFields } from './PostFormFields';
import { PostActionButtons } from './PostActionButtons';
import { ImageUploadModal } from './ImageUploadModal';
import { ImagePreview } from './ImagePreview';
import { usePostData, usePostActions } from '../hooks';
import { PostProvider } from '../context/PostContext';
import { PostService } from '../services/PostService';
import { Z_INDEX } from '../constants';
import { RECIPE_SOURCE_TYPES } from '../../common/constants';

interface CreatePostProps {
    author: string;
    body: string;
    title?: string;
    host: string;
    tags: string[];
    source: string;
    commandType?: string;
    container?: HTMLElement;
    shadowRoot?: ShadowRoot;
    modalTitle?: string
}

const CreatePostModalContent: React.FC<CreatePostProps> = ({
  author,
  body: initialBody,
  title: initialTitle = 'Post draft',
  tags: initialTags,
  host,
  source,
  commandType,
  container,
  shadowRoot,
  modalTitle = 'Create review',
}: CreatePostProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isImageUploadModalVisible, setIsImageUploadModalVisible] = useState(false);
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [isCommentGenerating, setIsCommentGenerating] = useState(false);
  const [postBody, setPostBody] = useState(initialBody);
  const [commentBody, setCommentBody] = useState<string | null>(null);

  const {
    data, isLoading, analysisState, updateData,
  } = usePostData(
    { title: initialTitle, body: initialBody, tags: initialTags },
    source,
    commandType,
  );

  const {
    handleSubmit,
    handleCopy,
    handleCreateObject,
    handleRefreshGpt,
    handleAnalysis,
    handleImageUpload,
    createCommentFromBody,
    isRecipeLoading,
    isRefreshLoading,
    isAnalysisLoading,
    isObjectCreated,
  } = usePostActions({
    title: data.title,
    body: data.body,
    host,
    tags: data.tags,
    source,
    uploadedImage: data.uploadedImage,
    onDataUpdate: updateData,
    onClose: () => {
      setIsModalOpen(false);
      PostService.cleanupModal();
    },
    onShowImageUploadModal: () => setIsImageUploadModalVisible(true),
  });

  const handleCancel = () => {
    setIsModalOpen(false);
    PostService.cleanupModal();
  };

  const handleTitleChange = (title: string) => {
    updateData({ title });
  };

  const handleBodyChange = (body: string) => {
    updateData({ body });
    if (isCommentMode) setCommentBody(body);
    else setPostBody(body);
  };

  const handleTagsChange: React.Dispatch<React.SetStateAction<string[]>> = (value) => {
    const newTags = typeof value === 'function' ? value(data.tags) : value;
    updateData({ tags: newTags });
  };

  const handleImageUploadComplete = (imageUrl: string) => {
    updateData({ uploadedImage: imageUrl });
  };

  const handleImageRemove = () => {
    updateData({ uploadedImage: undefined });
  };

  useEffect(() => {
    if (!isCommentMode) setPostBody(data.body);
  }, [data.body, isCommentMode]);

  const onToggleMode = async (checked: boolean) => {
    if (isLoading || isCommentGenerating) return;
    if (checked) {
      // Switch to Comment
      if (commentBody && commentBody.length) {
        setIsCommentMode(true);
        updateData({ body: commentBody });
        return;
      }
      try {
        setIsCommentGenerating(true);
        const generated = await createCommentFromBody(data.body);
        if (generated) {
          setCommentBody(generated);
          setIsCommentMode(true);
          updateData({ body: generated });
        }
      } finally {
        setIsCommentGenerating(false);
      }
    } else {
      // Switch to Post
      setIsCommentMode(false);
      updateData({ body: postBody || data.body });
    }
  };

  const isRecipeSource = RECIPE_SOURCE_TYPES.includes(source || '');
  return (
    <StyleProvider container={shadowRoot}>
        <DraggableModal
            title={modalTitle}
            open={isModalOpen}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText="Publish"
            cancelText="Cancel"
            okButtonProps={{ disabled: isLoading }}
            headerComponents={(
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#666' }}>Post</span>
                <Switch
                  checked={isCommentMode}
                  onChange={onToggleMode}
                  disabled={isLoading || isCommentGenerating}
                  size="small"
                />
                <span style={{ fontSize: 12, color: '#666' }}>Comment</span>
              </div>
            )}
            footerComponents={
                <PostActionButtons
                    source={source}
                    isLoading={isLoading}
                    isRecipeLoading={isRecipeLoading}
                    isRefreshLoading={isRefreshLoading}
                    isAnalysisLoading={isAnalysisLoading}
                    isObjectCreated={isObjectCreated}
                    onCreateObject={handleCreateObject}
                    onRefreshGpt={handleRefreshGpt}
                    onAnalysis={handleAnalysis}
                    onCopy={handleCopy}
                    container={container}
                />
            }
            width={500}
        >
            <div style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                <PostFormFields
                    author={author}
                    host={host}
                    title={data.title}
                    body={data.body}
                    isLoading={isLoading}
                    analysisState={analysisState}
                    onTitleChange={handleTitleChange}
                    onBodyChange={handleBodyChange}
                />
                {(isRecipeSource || data.uploadedImage) && (
                    <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          margin: '8px 0 12px 0',
                        }}
                    >

                        {isRecipeSource && (
                            <Tooltip
                                title="Upload image from disk or clipboard"
                                zIndex={Z_INDEX.TOOLTIP}
                                getPopupContainer={() => {
                                  if (typeof window !== 'undefined' && container) return container;
                                  return document.body;
                                }}
                            >
                                <Button
                                    icon={<PlusOutlined/>}
                                    onClick={handleImageUpload}
                                    style={{ height: '85px' }}
                                />
                            </Tooltip>
                        )}
                        {data.uploadedImage && (
                            <ImagePreview
                                imageUrl={data.uploadedImage}
                                onRemove={handleImageRemove}
                            />
                        )}
                    </div>
                )}

                <ImageUploadModal
                    visible={isImageUploadModalVisible}
                    onCancel={() => setIsImageUploadModalVisible(false)}
                    onImageUpload={handleImageUploadComplete}
                    container={container}
                />

                <WaivioTags
                    setParentTags={handleTagsChange}
                    initialTags={data.tags}
                    container={container}
                />
            </div>
        </DraggableModal>
    </StyleProvider>
  );
};

const CreatePostModal: React.FC<CreatePostProps> = (props) => (
    <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#f87007',
          },
        }}
        getPopupContainer={() => {
          if (typeof window !== 'undefined' && props.container) return props.container;
          return document.body;
        }}
    >
        <PostProvider
            value={{
              author: props.author,
              host: props.host,
              source: props.source,
              commandType: props.commandType,
            }}
        >
            <CreatePostModalContent {...props} />
        </PostProvider>
    </ConfigProvider>
);

export default CreatePostModal;
