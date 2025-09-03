import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, Modal, Button } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import { Z_INDEX } from '../constants';
import { copyContent } from '../helpers/commonHelper';

interface AlertObjectProps {
    url?: string;
    alertMessage: string;
    confirmText: string;
    onResolve: (result: boolean) => void;
    container?: Element | ShadowRoot;
    shadowMount?: HTMLElement;
}

const AlertObjectModal = ({
  url,
  onResolve,
  alertMessage,
  confirmText,
  container,
  shadowMount,
}: AlertObjectProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const cleanup = () => {
    const nested = document.getElementById('react-chrome-modal-alert-host');
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
    await copyContent(`https://www.waivio.com/object/${url}`);
  };

  // Cleanup on unmount
  useEffect(() => () => cleanup(), []);

  return (
    <StyleProvider container={container}>
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
                getContainer={() => shadowMount || document.body}
            >
                <div>
                    <p style={{ fontWeight: 'bold', marginTop: '15px' }}>
                        {alertMessage}
                    </p>
                </div>

                <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      justifyContent: 'center',
                      marginTop: '20px',
                    }}
                >   {url && (
                    <Button
                        onClick={handleCopyLinkToClipboard}
                        style={{ backgroundColor: 'rgb(248, 112, 7)', color: 'white' }}
                    >
                        Copy
                    </Button>
                )}

                    <Button
                        onClick={handleConfirm}
                        style={{ backgroundColor: 'rgb(248, 112, 7)', color: 'white' }}
                    >
                        {confirmText}
                    </Button>

                </div>
            </Modal>
        </ConfigProvider>
    </StyleProvider>
  );
};

// Helper function to create a confirm-like modal
export const showAlertObjectModal = (alertMessage: string, confirmText: string, url?: string): Promise<boolean> => new Promise((resolve) => {
  // Create isolated Shadow DOM to avoid host page styles
  const shadowHost = document.createElement('div');
  shadowHost.id = 'react-chrome-modal-alert-host';
  document.body.appendChild(shadowHost);
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  // Mount point inside shadow
  const shadowMount = document.createElement('div');
  shadowMount.id = 'react-chrome-modal-alert';
  shadowRoot.appendChild(shadowMount);

  // Basic font normalization for readability (UA styles still apply)
  const styleEl = document.createElement('style');
  styleEl.textContent = `:host{all:initial} *{box-sizing:border-box;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif}`;
  shadowRoot.appendChild(styleEl);

  const handleResolve = (result: boolean) => {
    resolve(result);
  };

  // Render the React component
  const root = createRoot(shadowMount);
  root.render(<AlertObjectModal
        url={url}
        alertMessage={alertMessage}
        confirmText={confirmText}
        onResolve={handleResolve}
        container={shadowRoot}
        shadowMount={shadowMount}/>);
});

export default AlertObjectModal;
