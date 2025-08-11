import React, { useState, useRef, useEffect } from 'react';
import {
  Modal, Button, Input, message, Tabs,
} from 'antd';
import { UploadOutlined, LinkOutlined, CopyOutlined } from '@ant-design/icons';
import { Z_INDEX } from '../constants/styles';

const { TabPane } = Tabs;

interface ImageUploadModalProps {
  visible: boolean;
  onCancel: () => void;
  onImageUpload: (imageUrl: string) => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  visible,
  onCancel,
  onImageUpload,
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const { loadImageBase64 } = await import('../helpers/downloadWaivioHelper');
      const { result, error } = await loadImageBase64(file);
      if (error) {
        message.error('Failed to upload image. Please try again.');
        return;
      }
      if (result) {
        onImageUpload(result);
        onCancel();
        message.success('Image uploaded successfully!');
      }
    } catch (error) {
      message.error('Failed to upload image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) {
      message.error('Please enter a valid image URL');
      return;
    }

    // Basic URL validation
    try {
      const url = new URL(imageUrl);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        // Convert URL to File object and use handleFileUpload
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: blob.type });
        await handleFileUpload(file);
      } else {
        message.error('Please enter a valid HTTP/HTTPS URL');
      }
    } catch {
      message.error('Please enter a valid URL');
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Add global paste listener when modal is visible
  useEffect(() => {
    if (!visible) return;

    const handleGlobalPaste = async (e: ClipboardEvent) => {
      const { clipboardData } = e;
      if (!clipboardData) return;

      const { items } = clipboardData;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            await handleFileUpload(file);
            break;
          }
        }
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [visible]);

  return (
    <Modal
      title="Upload Image"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
      destroyOnClose
      zIndex={Z_INDEX.UPLOAD_MODAL}
    >
      <Tabs defaultActiveKey="file">
        <TabPane tab="Upload File" key="file">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Button
              type="dashed"
              icon={<UploadOutlined />}
              size="large"
              onClick={handleFileSelect}
              loading={isProcessing}
              style={{ width: '200px', height: '100px' }}
            >
              Click to Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <p style={{ marginTop: '10px', color: '#666' }}>
              Support for JPG, PNG, GIF up to 10MB
            </p>
          </div>
        </TabPane>

        <TabPane tab="Paste from Clipboard" key="paste">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                border: '2px dashed #d9d9d9',
                borderRadius: '8px',
                padding: '40px',
                margin: '20px 0',
                cursor: 'pointer',
              }}
              onClick={() => message.info('Press Ctrl+V anywhere to paste an image')}
            >
              <CopyOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
              <p style={{ marginTop: '10px', color: '#666' }}>
                Press Ctrl+V anywhere to paste an image from clipboard
              </p>
            </div>
          </div>
        </TabPane>

        <TabPane tab="Image URL" key="url">
          <div style={{ padding: '20px 0' }}>
            <Input
              placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onPressEnter={handleUrlSubmit}
              prefix={<LinkOutlined />}
              style={{ marginBottom: '10px' }}
            />
            <Button
              type="primary"
              onClick={handleUrlSubmit}
              block
            >
              Add Image URL
            </Button>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};
