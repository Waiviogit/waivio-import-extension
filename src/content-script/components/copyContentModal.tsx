import React, { useState } from 'react';
import { ConfigProvider, Modal, Button } from 'antd';

export type fieldToCopyType = {
    title: string
    textToCopy: string
    buttonName: string
}

interface copyContentModalProps {
    fields: fieldToCopyType[],
    modalTitle: string
}
const CopyContentModal = ({ fields, modalTitle }: copyContentModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Text copied to clipboard!');
    }).catch((err) => {
      console.error('Could not copy text: ', err);
    });
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
                    bodyStyle={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}
                    title={modalTitle}
                    open={isModalOpen}
                    // onOk={handleOk}
                    onCancel={handleCancel}
                    // okText="Copy"
                    // cancelText="Cancel"
                    footer={null}
                >
                    {
                        fields.map((el) => (
                            <div style={{ marginBottom: '20px', marginTop: '20px' }}>
                                <div>
                                    <h2 style={{ fontWeight: '600' }}>{el.title}</h2>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p>{el.textToCopy}</p>
                                    </div>

                                    <div>
                                        <Button
                                            onClick={() => copyToClipboard(el.textToCopy)} style={{ backgroundColor: 'rgb(248, 112, 7)', color: 'white' }}>
                                            {el.buttonName}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </Modal>
            </ConfigProvider>
        </>
  );
};

export default CopyContentModal;
