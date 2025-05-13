import React from 'react';
import { Image } from 'antd';
import { ImagePreviewProps } from '../types/form';

export const ImagePreview: React.FC<ImagePreviewProps> = ({ value, style }) => {
  if (!value?.length) return null;

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
};
