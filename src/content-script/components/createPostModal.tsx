import React, { useState } from 'react';
import {
  ConfigProvider, Modal, Input,
} from 'antd';
import WaivioTags from './WaivioTags';
import { postImportWaivio } from '../helpers/downloadWaivioHelper';

interface CreatePostProps {
    author: string;
    body: string;
    title?: string;
    host: string;
    tags: string[];
}

const CreatePostModal = ({
  author, body: initialBody, title: initialTitle = 'Post draft', tags, host,
}: CreatePostProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
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
                    okButtonProps={{ disabled: !title || !body }}
                >
                    <Input value={author} disabled={true} style={{ marginTop: '30px' }} />
                    <Input value={host} disabled={true} style={{ marginTop: '10px' }} />
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter title"
                        style={{ marginTop: '10px' }}
                    />
                    <Input.TextArea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Enter post content"
                        style={{ height: '500px', marginTop: '10px' }}
                    />
                    <WaivioTags setParentTags={setTags} initialTags={tags}/>
                </Modal>
            </ConfigProvider>
        </>
  );
};

export default CreatePostModal;
