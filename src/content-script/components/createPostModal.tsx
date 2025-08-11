import React, { useState } from 'react';
import { ConfigProvider } from 'antd';
import WaivioTags from './WaivioTags';
import { DraggableModal } from './DraggableModal';
import { PostFormFields } from './PostFormFields';
import { PostActionButtons } from './PostActionButtons';
import { usePostData, usePostActions } from '../hooks';
import { PostProvider } from '../context/PostContext';
import { PostService } from '../services/PostService';

interface CreatePostProps {
  author: string;
  body: string;
  title?: string;
  host: string;
  tags: string[];
  source: string;
  commandType?: string;
}

const CreatePostModalContent: React.FC<CreatePostProps> = ({
  author,
  body: initialBody,
  title: initialTitle = 'Post draft',
  tags: initialTags,
  host,
  source,
  commandType,
}: CreatePostProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

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
    isRecipeLoading,
    isRefreshLoading,
    isAnalysisLoading,
  } = usePostActions({
    title: data.title,
    body: data.body,
    host,
    tags: data.tags,
    source,
    onDataUpdate: updateData,
    onClose: () => {
      setIsModalOpen(false);
      PostService.cleanupModal();
    },
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

  return (
    <DraggableModal
      title="Create post"
      open={isModalOpen}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="Publish"
      cancelText="Cancel"
      footerComponents={
        <PostActionButtons
          source={source}
          isRecipeLoading={isRecipeLoading}
          isRefreshLoading={isRefreshLoading}
          isAnalysisLoading={isAnalysisLoading}
          onCreateObject={handleCreateObject}
          onRefreshGpt={handleRefreshGpt}
          onAnalysis={handleAnalysis}
          onCopy={handleCopy}
        />
      }
      width={500}
    >
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
      <WaivioTags
        setParentTags={handleTagsChange}
        initialTags={data.tags}
      />
    </DraggableModal>
  );
};

const CreatePostModal: React.FC<CreatePostProps> = (props) => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#f87007',
      },
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
