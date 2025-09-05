import React, { useState } from 'react';
import { Button, ConfigProvider, Tooltip } from 'antd';
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
}: CreatePostProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isImageUploadModalVisible, setIsImageUploadModalVisible] = useState(false);

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
    isRecipeLoading,
    isRefreshLoading,
    isAnalysisLoading,
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

  const isRecipeSource = RECIPE_SOURCE_TYPES.includes(source || '');

  return (
    <StyleProvider container={shadowRoot}>
        <DraggableModal
            title="Create post"
            open={isModalOpen}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText="Publish"
            cancelText="Cancel"
            okButtonProps={{ disabled: isLoading }}
            footerComponents={
                <PostActionButtons
                    source={source}
                    isLoading={isLoading}
                    isRecipeLoading={isRecipeLoading}
                    isRefreshLoading={isRefreshLoading}
                    isAnalysisLoading={isAnalysisLoading}
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
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>

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
                                style={{ margin: '0 8px 0 0', height: '85px' }}
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
