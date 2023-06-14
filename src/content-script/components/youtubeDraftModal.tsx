import React, { useState } from 'react';
import { ConfigProvider, Modal } from 'antd';
import { copyContent } from '../helpers/commonHelper';

interface youtubeModalProps {
    text: string
}
const YoutubeDraftModal = ({ text }: youtubeModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleOk = async () => {
    const nested = document.getElementById('react-chrome-modal');
    if (!nested) return;
    await copyContent(text);
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
                    title="Post draft"
                    open={isModalOpen}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okText="Copy"
                    cancelText="Cancel"
                >
                    {
                        text.split('\n\n')
                          .map((el) => <span><p>{el}</p><br/></span>)
                    }

                </Modal>
            </ConfigProvider>
        </>
  );
};

export default YoutubeDraftModal;
