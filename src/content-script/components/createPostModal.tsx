import React, { useState } from 'react';
import {
  ConfigProvider, Modal, Input, Popover, Button, Tooltip,
} from 'antd';
import { ReloadOutlined, VideoCameraAddOutlined } from '@ant-design/icons';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import WaivioTags from './WaivioTags';
import { postImportWaivio } from '../helpers/downloadWaivioHelper';
import { copyContent } from '../helpers/commonHelper';
import { SOURCE_TYPES } from '../../common/constants';
import { createObjectForPost } from '../helpers/objectHelper';
import { getDraftBodyTitleTags } from '../helpers/draftHelper';
import { extractPostInfo } from '../helpers/postHelper';
import { createAnalysisVideoPromptBySource } from '../helpers/promptHelper';
import { videoAnalysesByLink } from '../helpers/gptHelper';

interface CreatePostProps {
    author: string;
    body: string;
    title?: string;
    host: string;
    tags: string[];
    source: string
}

const MAX_TITLE_LENGTH = 255;

const RECIPE_SOURCES = [
  SOURCE_TYPES.RECIPE_DRAFT,
  SOURCE_TYPES.RECIPE_DRAFT_TIKTOK,
  SOURCE_TYPES.RECIPE_DRAFT_INSTAGRAM,
];

const POST_SOURCES = [
  SOURCE_TYPES.YOUTUBE,
  SOURCE_TYPES.INSTAGRAM,
  SOURCE_TYPES.TIKTOK,
];

const CreatePostModal = ({
  author, body: initialBody, title: initialTitle = 'Post draft', tags, host, source,
}: CreatePostProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [isRefreshLoading, setIsRefreshLoading] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0, top: 0, bottom: 0, right: 0,
  });
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [postTags, setTags] = useState<string[]>([]);

  const draggleRef = React.useRef<HTMLDivElement>(null);

  const onStart = (event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) return;

    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

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
    const prompt = createAnalysisVideoPromptBySource(source);
    const response = await videoAnalysesByLink(prompt, document.URL);
    console.log(response);
    if (!response.result) {
      alert('Error while video processing');
      setIsAnalysisLoading(false);
      return;
    }

    setBody(response.result);
    setIsAnalysisLoading(false);
  };

  const recipeButtonExist = RECIPE_SOURCES.includes(source || '');
  const isDraft = !POST_SOURCES.includes(source || '');

  const submitDisabled = !title || !body || title?.length > MAX_TITLE_LENGTH;

  const recipeButtons = <>
      <Button
      onClick={handleCreateObject}
      loading={isRecipeLoading}
  >
      Create object
  </Button>

      </>;

  const draftButtons = <>
          <Tooltip title="Analyze video content with AI">
            <Button
                icon={<VideoCameraAddOutlined />}
                onClick={handleAnalysis}
                loading={isAnalysisLoading}
            />
          </Tooltip>
          <Tooltip title="Regenerate draft">
              <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefreshGpt}
                  loading={isRefreshLoading}
              />
          </Tooltip>
      </>;

  return (
        <>
            <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: '#f87007',
                  },
                }}
            >
                <Modal
                    title={
                      <div
                        style={{
                          width: '100%',
                          cursor: 'move',
                        }}
                        onMouseOver={() => {
                          if (disabled) {
                            setDisabled(false);
                          }
                        }}
                        onMouseOut={() => {
                          setDisabled(true);
                        }}
                        onFocus={() => undefined}
                        onBlur={() => undefined}
                      >
                        Create Post
                      </div>
                    }
                    modalRender={(modal) => (
                      <Draggable
                        disabled={disabled}
                        bounds={bounds}
                        onStart={(event, uiData) => onStart(event, uiData)}
                      >
                        <div ref={draggleRef}>{modal}</div>
                      </Draggable>
                    )}
                    bodyStyle={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}
                    open={isModalOpen}
                    onOk={handleSubmit}
                    onCancel={handleCancel}
                    okText="Publish"
                    cancelText="Cancel"
                    okButtonProps={{ disabled: submitDisabled }}
                    zIndex={9999999}
                    maskClosable={false}
                    footer={(_, { OkBtn, CancelBtn }) => (
                        <>
                            {recipeButtonExist && recipeButtons}
                            {draftButtons}
                            <Button
                                onClick={handleCopy}
                            >
                                Copy
                            </Button>
                            <CancelBtn />
                            <OkBtn />
                        </>
                    )}
                >
                    <Popover
                        content={'Author of the post. Change by signing in to Waivio with different account.'}
                    >
                        <Input
                            style={{ marginTop: '30px' }}
                            value={author}
                            disabled={true}
                        />
                    </Popover>
                    <Popover
                        content={'Domain associated with a post, establishing it as its canonical source. Can be changed on Waivio.'}
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
                        placeholder="Enter title"
                        style={{ marginTop: '10px' }}
                    />
                    <Input.TextArea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Enter post content"
                        style={{ height: '400px', marginTop: '10px', marginBottom: '10px' }}
                    />
                    <WaivioTags
                        setParentTags={setTags}
                        initialTags={tags}
                    />
                </Modal>
            </ConfigProvider>
        </>
  );
};

export default CreatePostModal;
