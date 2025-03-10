import React, { useState } from 'react';
import {
  ConfigProvider, Modal, Input, Popover, Button,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import WaivioTags from './WaivioTags';
import { postImportWaivio } from '../helpers/downloadWaivioHelper';
import { copyContent } from '../helpers/commonHelper';
import { SOURCE_TYPES } from '../../common/constants';
import { createObjectForPost } from '../helpers/objectHelper';
import { getDraftBodyTitleTags } from '../helpers/draftHelper';

interface CreatePostProps {
    author: string;
    body: string;
    title?: string;
    host: string;
    tags: string[];
    source?: string
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
  const [isRecipeDisabled, setIsRecipeDisabled] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [postTags, setTags] = useState<string[]>([]);

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
    setIsRecipeDisabled(true);
    const objectForPost = await createObjectForPost(body);
    if (objectForPost) {
      setBody(`${body}\n[${objectForPost.name}](https://${host}/object/${objectForPost.permlink})`);
    }
    setIsRecipeLoading(false);
  };

  const handleRefreshGpt = async () => {
    setIsRefreshLoading(true);
    const draftData = await getDraftBodyTitleTags(source);
    setIsRefreshLoading(false);
    if (!draftData) return;
    const { body: reBody, title: reTitle, tags: reTags } = draftData;

    setBody(reBody);
    setTitle(reTitle);
    setTags(reTags);
  };

  const recipeButtonExist = RECIPE_SOURCES.includes(source || '');
  const isDraft = !POST_SOURCES.includes(source || '');

  const submitDisabled = !title || !body || title?.length > MAX_TITLE_LENGTH;

  const recipeButtons = <>
      <Button
      onClick={handleCreateObject}
      loading={isRecipeLoading}
      disabled={isRecipeDisabled}
  >
      Create object
  </Button>

      </>;

  const draftButtons = <>
          <Button
              icon={<ReloadOutlined />}
              onClick={handleRefreshGpt}
              loading={isRefreshLoading}
          />
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
                    bodyStyle={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}
                    open={isModalOpen}
                    onOk={handleSubmit}
                    onCancel={handleCancel}
                    okText="Publish"
                    cancelText="Cancel"
                    okButtonProps={{ disabled: submitDisabled }}
                    zIndex={9999999}
                    footer={(_, { OkBtn, CancelBtn }) => (
                        <>
                            {recipeButtonExist && recipeButtons}
                            {isDraft && draftButtons}
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
