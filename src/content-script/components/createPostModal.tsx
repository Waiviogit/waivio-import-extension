import React, { useState, useEffect } from 'react';
import {
  ConfigProvider, Input, Popover, Button, Tooltip, Progress,
} from 'antd';
import { ReloadOutlined, VideoCameraAddOutlined } from '@ant-design/icons';
import WaivioTags from './WaivioTags';
import { postImportWaivio } from '../helpers/downloadWaivioHelper';
import { copyContent } from '../helpers/commonHelper';
import { SOURCE_TYPES } from '../../common/constants';
import { createObjectForPost } from '../helpers/objectHelper';
import { getDraftBodyTitleTags, initialDeepAnalysis } from '../helpers/draftHelper';
import { extractPostInfo } from '../helpers/postHelper';
import { createAnalysisVideoPromptBySource } from '../helpers/promptHelper';
import { videoAnalysesByLink } from '../helpers/gptHelper';
import { DraggableModal } from './DraggableModal';
import loadingEmitter from '../emiters/loadingEmitter';

interface CreatePostProps {
    author: string;
    body: string;
    title?: string;
    host: string;
    tags: string[];
    source: string;
    commandType?: string;
}

const MAX_TITLE_LENGTH = 255;

const RECIPE_SOURCES = [
  SOURCE_TYPES.RECIPE_DRAFT,
  SOURCE_TYPES.RECIPE_DRAFT_TIKTOK,
  SOURCE_TYPES.RECIPE_DRAFT_INSTAGRAM,
];

const CreatePostModal = ({
  author, body: initialBody, title: initialTitle = 'Post draft', tags, host, source, commandType,
}: CreatePostProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [isRefreshLoading, setIsRefreshLoading] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [postTags, setTags] = useState<string[]>(tags);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisMessage, setAnalysisMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!commandType) return;

      // Listen for deep analysis events
      const handleDeepAnalysisEvent = (e: Event) => {
        const customEvent = e as CustomEvent;
        const {
          step, message, progress, data,
        } = customEvent.detail || {};

        setAnalysisStep(step || '');
        setAnalysisMessage(message || '');
        setAnalysisProgress(progress || 0);

        // Update body with intermediate results
        if (data && typeof data === 'string') {
          setBody(data);
        } else if (data && data.body) {
          setBody(data.body);
        }
      };

      const handlePostLoading = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail?.data) {
          setBody(customEvent.detail.data || '');
        }
      };

      loadingEmitter.addEventListener('deep-analysis-start', handleDeepAnalysisEvent);
      loadingEmitter.addEventListener('deep-analysis-step', handleDeepAnalysisEvent);
      loadingEmitter.addEventListener('deep-analysis-complete', handleDeepAnalysisEvent);
      loadingEmitter.addEventListener('deep-analysis-error', handleDeepAnalysisEvent);
      loadingEmitter.addEventListener('draft-refresh-start', handleDeepAnalysisEvent);
      loadingEmitter.addEventListener('draft-refresh-step', handleDeepAnalysisEvent);
      loadingEmitter.addEventListener('draft-refresh-complete', handleDeepAnalysisEvent);
      loadingEmitter.addEventListener('draft-refresh-error', handleDeepAnalysisEvent);
      loadingEmitter.addEventListener('post-loading', handlePostLoading);

      setIsLoading(true);

      try {
        if (commandType === 'CREATE_DRAFT') {
          const draftData = await initialDeepAnalysis(source);
          if (draftData) {
            setTitle(draftData.title);
            setBody(draftData.body);
            setTags(draftData.tags);
          }
        } else if (commandType === 'CREATE_POST') {
          const postData = await extractPostInfo(source);
          if (postData) {
            setTitle(postData.title);
            setBody(postData.body);
            setTags(postData.tags);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
        setAnalysisProgress(0);
        setAnalysisStep('');
        setAnalysisMessage('');
      }

      // Cleanup event listeners
      return () => {
        loadingEmitter.removeEventListener('deep-analysis-start', handleDeepAnalysisEvent);
        loadingEmitter.removeEventListener('deep-analysis-step', handleDeepAnalysisEvent);
        loadingEmitter.removeEventListener('deep-analysis-complete', handleDeepAnalysisEvent);
        loadingEmitter.removeEventListener('deep-analysis-error', handleDeepAnalysisEvent);
        loadingEmitter.removeEventListener('draft-refresh-start', handleDeepAnalysisEvent);
        loadingEmitter.removeEventListener('draft-refresh-step', handleDeepAnalysisEvent);
        loadingEmitter.removeEventListener('draft-refresh-complete', handleDeepAnalysisEvent);
        loadingEmitter.removeEventListener('draft-refresh-error', handleDeepAnalysisEvent);
        loadingEmitter.removeEventListener('post-loading', handlePostLoading);
      };
    };

    loadData();
  }, [commandType, source]);

  const handleSubmit = async () => {
    const nested = document.getElementById('react-chrome-modal');
    if (!nested) return;

    await postImportWaivio({
      title, body, host, tags: postTags,
    });
    setIsModalOpen(false);
    document.body.removeChild(nested);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    const nested = document.getElementById('react-chrome-modal');
    if (!nested) return;
    document.body.removeChild(nested);
  };

  const handleCopy = async () => {
    await copyContent(body);
  };

  const handleCreateObject = async () => {
    setIsRecipeLoading(true);
    const objectForPost = await createObjectForPost(body);
    if (objectForPost) {
      setBody(`${body}\n[${objectForPost.name}](https://${host}/object/${objectForPost.permlink})`);
    }
    setIsRecipeLoading(false);
  };

  const handleRefreshGpt = async () => {
    setIsRefreshLoading(true);
    let bodyFromEditor = body;
    const videoData = await extractPostInfo(source || '');
    if (videoData) {
      bodyFromEditor = `${videoData.title}${videoData.body} ${bodyFromEditor}`;
    }

    const draftData = await getDraftBodyTitleTags(source, bodyFromEditor);
    setIsRefreshLoading(false);
    if (!draftData) return;
    const { body: reBody, tags: reTags } = draftData;

    setBody(reBody);
    setTags(reTags);
  };

  const handleAnalysis = async () => {
    setIsAnalysisLoading(true);
    const prompt = createAnalysisVideoPromptBySource(source, '');
    const response = await videoAnalysesByLink(prompt, document.URL);
    if (!response.result) {
      alert('Failed to upload the video. Please try again.');
      setIsAnalysisLoading(false);
      return;
    }

    setBody(response.result);
    setIsAnalysisLoading(false);
  };

  const recipeButtonExist = RECIPE_SOURCES.includes(source || '');

  const recipeButtons = <>
      <Button
      onClick={handleCreateObject}
      loading={isRecipeLoading}
  >
      Create object
  </Button>
      </>;

  const draftButtons = <>
          <Tooltip title="Analyze video content with AI" zIndex={9999}>
            <Button
                icon={<VideoCameraAddOutlined />}
                onClick={handleAnalysis}
                loading={isAnalysisLoading}
            />
          </Tooltip>
          <Tooltip title="Regenerate draft" zIndex={9999}>
              <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefreshGpt}
                  loading={isRefreshLoading}
              />
          </Tooltip>
      </>;

  const footerComponents = (
    <>
      {recipeButtonExist && recipeButtons}
      {draftButtons}
      <Button onClick={handleCopy}>Copy</Button>
    </>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#f87007',
        },
      }}
    >
      <DraggableModal
        title="Create post"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="Publish"
        cancelText="Cancel"
        footerComponents={footerComponents}
        width={500}
      >
        <Popover
          content={'Author of the post. Change by signing in to Waivio with different account.'}
          styles={{ root: { zIndex: 9999 } }}
        >
          <Input
            value={author}
            disabled={true}
          />
        </Popover>
        <Popover
          content={'Domain associated with a post, establishing it as its canonical source. Can be changed on Waivio.'}
          styles={{ root: { zIndex: 9999 } }}
        >
          <Input
            value={host}
            disabled={true}
            style={{ marginTop: '10px' }}
          />
        </Popover>
        <Input
          value={title}
          showCount
          maxLength={MAX_TITLE_LENGTH}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={isLoading ? 'Loading title...' : 'Enter title'}
          disabled={isLoading}
          style={{ marginTop: '10px' }}
        />
        {isLoading && analysisStep && (
          <div style={{ marginTop: '10px', marginBottom: '10px' }}>
            <Progress
              percent={analysisProgress}
              status={analysisProgress === 100 ? 'success' : 'active'}
              format={() => `${analysisStep}`}
            />
            {analysisMessage && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {analysisMessage}
              </div>
            )}
          </div>
        )}
        <Input.TextArea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={isLoading ? 'Loading content...' : 'Enter post content'}
          disabled={isLoading}
          style={{ height: '400px', marginTop: '10px', marginBottom: '10px' }}
        />
        <WaivioTags
          setParentTags={setTags}
          initialTags={tags}
        />
      </DraggableModal>
    </ConfigProvider>
  );
};

export default CreatePostModal;
