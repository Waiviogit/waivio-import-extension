import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, Modal, Button } from 'antd';
import { Z_INDEX } from '../constants';
import { copyContent } from '../helpers/commonHelper';

interface AlertObjectProps {
    url: string;
    onResolve: (result: boolean) => void;
}

const AlertObjectModal = ({ url, onResolve }: AlertObjectProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const cleanup = () => {
    const nested = document.getElementById('react-chrome-modal');
    if (nested) {
      document.body.removeChild(nested);
    }
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    onResolve(true);
    cleanup();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    onResolve(false);
    cleanup();
  };

  const handleCopyLinkToClipboard = async () => {
    await copyContent(` https://www.waivio.com/object/${url}`);
  };

  // Cleanup on unmount
  useEffect(() => () => cleanup(), []);

  return (
        <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#f87007',
              },
            }}
        >
            <Modal
                width={'450px'}
                bodyStyle={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                style={{ textAlign: 'center' }}
                zIndex={Z_INDEX.IMAGE_PREVIEW}
            >
                <div>
                    <p style={{ fontWeight: 'bold', marginTop: '15px' }}>
                        The object already exists on Waivio. Here is the link: https://www.waivio.com/object/{url}
                    </p>
                </div>

                <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      justifyContent: 'center',
                      marginTop: '20px',
                    }}
                >
                    <Button onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCopyLinkToClipboard}
                        style={{ backgroundColor: 'rgb(248, 112, 7)', color: 'white' }}
                    >
                        Copy link to clipboard
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        style={{ backgroundColor: 'rgb(248, 112, 7)', color: 'white' }}
                    >
                        Import
                    </Button>

                </div>
            </Modal>
        </ConfigProvider>
  );
};

// Helper function to create a confirm-like modal
export const showAlertObjectModal = (url: string): Promise<boolean> => new Promise((resolve) => {
  const modalContainer = document.createElement('div');
  modalContainer.id = 'react-chrome-modal';
  document.body.appendChild(modalContainer);

  const handleResolve = (result: boolean) => {
    resolve(result);
  };

  // Render the React component
  const root = createRoot(modalContainer);
  root.render(<AlertObjectModal url={url} onResolve={handleResolve}/>);
});

export default AlertObjectModal;
