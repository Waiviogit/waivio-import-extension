import React from 'react';
import { Input, Popover, Progress } from 'antd';
import { Z_INDEX } from '../constants/styles';

interface PostFormFieldsProps {
  author: string;
  host: string;
  title: string;
  body: string;
  isLoading: boolean;
  analysisState: {
    progress: number;
    step: string;
    message: string;
  };
  onTitleChange: (title: string) => void;
  onBodyChange: (body: string) => void;
}

const MAX_TITLE_LENGTH = 255;

export const PostFormFields: React.FC<PostFormFieldsProps> = ({
  author,
  host,
  title,
  body,
  isLoading,
  analysisState,
  onTitleChange,
  onBodyChange,
}) => (
  <>
    <Popover
      content={'Author of the post. Change by signing in to Waivio with different account.'}
      styles={{ root: { zIndex: Z_INDEX.TOOLTIP } }}
    >
      <Input
        value={author}
        disabled={true}
      />
    </Popover>

    <Popover
      content={'Domain associated with a post, establishing it as its canonical source. Can be changed on Waivio.'}
      styles={{ root: { zIndex: Z_INDEX.TOOLTIP } }}
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
      onChange={(e) => onTitleChange(e.target.value)}
      placeholder={isLoading ? 'Loading title...' : 'Enter title'}
      disabled={isLoading}
      style={{ marginTop: '10px' }}
    />

    {isLoading && analysisState.step && (
      <div style={{ marginTop: '10px', marginBottom: '10px' }}>
        <Progress
          percent={analysisState.progress}
          status={analysisState.progress === 100 ? 'success' : 'active'}
          format={() => `${analysisState.step}`}
          strokeColor="#f87007"
        />
        {analysisState.message && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            {analysisState.message}
          </div>
        )}
      </div>
    )}

    <Input.TextArea
      value={body}
      onChange={(e) => onBodyChange(e.target.value)}
      placeholder={isLoading ? 'Loading content...' : 'Enter post content'}
      disabled={isLoading}
      style={{ height: '400px', marginTop: '10px', marginBottom: '10px' }}
    />
  </>
);
