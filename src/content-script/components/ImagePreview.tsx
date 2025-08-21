import React from 'react';
import { Card, Button, Image } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Z_INDEX } from '../constants/styles';

interface ImagePreviewProps {
  // New interface for single image with remove functionality
  imageUrl?: string;
  onRemove?: () => void;
  // Legacy interface for multiple images
  value?: string[];
  style?: React.CSSProperties;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl, onRemove, value, style,
}) => {
  // Legacy support for array of images
  if (value && Array.isArray(value)) {
    if (!value.length) return null;

    if (value.length === 1) {
      return (
        <Image
          src={value[0]}
          style={{ maxWidth: 200, marginTop: 8, ...style }}
          preview={false}
        />
      );
    }

    return (
      <div style={{ marginTop: 8 }}>
        {value.map((url: string) => (
          <Image
            key={url}
            src={url}
            style={{ maxWidth: 200, marginTop: 8, ...style }}
            preview={false}
          />
        ))}
      </div>
    );
  }

  // New interface for single image with remove functionality
  if (imageUrl && onRemove) {
    return (
      <Card
        size="small"
        style={{
          marginTop: '10px',
          marginBottom: '10px',
          border: '1px solid #d9d9d9',
          borderRadius: '8px',
          flex: 1,
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image
            src={imageUrl}
            alt="Uploaded image"
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: '4px' }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            preview={{
              mask: <div>Click to preview</div>,
              zIndex: Z_INDEX.IMAGE_PREVIEW,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Image uploaded
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Ready to use in object creation
            </div>
          </div>
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={onRemove}
            danger
            size="small"
          />
        </div>
      </Card>
    );
  }

  return null;
};
