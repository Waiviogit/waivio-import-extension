import React, { useState } from 'react';
import { ConfigProvider, Modal, Button } from 'antd';

interface alertObjectProps {
    url: string,
}
const AlertObjectModal = ({ url }: alertObjectProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const goTo = (link: string) => {
    window.open(`https://www.waivio.com/object/${link}`, '_blank');
  };
  const handleOk = async () => {
    const nested = document.getElementById('react-chrome-modal');
    if (!nested) return;
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
                    width={'450px'}
                    bodyStyle={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}
                    open={isModalOpen}
                    // onOk={handleOk}
                    onCancel={handleCancel}
                    // okText="Copy"
                    // cancelText="Cancel"
                    footer={null}
                    style={{ textAlign: 'center' }}
                    zIndex={9999999}
                >
                    <div>
                        <p style={{ fontWeight: 'bold', marginTop: '15px' }}>
                            The object already exists on Waivio. Here is the link:
                        </p>
                    </div>

                    <div>
                        <Button
                            onClick={() => goTo(url)}
                            style={{ backgroundColor: 'rgb(248, 112, 7)', color: 'white', marginTop: '10px' }}>
                            {'Go to object'}
                        </Button>
                    </div>
                </Modal>
            </ConfigProvider>
        </>
  );
};

export default AlertObjectModal;
