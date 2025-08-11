import React from 'react';
import { Button, Tooltip } from 'antd';
import { ReloadOutlined, VideoCameraAddOutlined, PlusOutlined } from '@ant-design/icons';
import { SOURCE_TYPES } from '../../common/constants';
import { Z_INDEX } from '../constants/styles';

interface PostActionButtonsProps {
  source: string;
  isRecipeLoading: boolean;
  isRefreshLoading: boolean;
  isAnalysisLoading: boolean;
  onCreateObject: () => void;
  onRefreshGpt: () => void;
  onAnalysis: () => void;
  onCopy: () => void;
  onImageUpload: () => void;
}

const RECIPE_SOURCES = [
  SOURCE_TYPES.RECIPE_DRAFT,
  SOURCE_TYPES.RECIPE_DRAFT_TIKTOK,
  SOURCE_TYPES.RECIPE_DRAFT_INSTAGRAM,
];

export const PostActionButtons: React.FC<PostActionButtonsProps> = ({
  source,
  isRecipeLoading,
  isRefreshLoading,
  isAnalysisLoading,
  onCreateObject,
  onRefreshGpt,
  onAnalysis,
  onCopy,
  onImageUpload,
}) => {
  const isRecipeSource = RECIPE_SOURCES.includes(source || '');

  return (
    <>
      {isRecipeSource && (
        <>
          <Tooltip title="Upload image from disk or clipboard" zIndex={Z_INDEX.TOOLTIP}>
            <Button
              icon={<PlusOutlined />}
              onClick={onImageUpload}
              style={{ marginRight: '8px' }}
            />
          </Tooltip>
          <Button
            onClick={onCreateObject}
            loading={isRecipeLoading}
          >
            Create object
          </Button>
        </>
      )}

              <Tooltip title="Analyze video content with AI" zIndex={Z_INDEX.TOOLTIP}>
        <Button
          icon={<VideoCameraAddOutlined />}
          onClick={onAnalysis}
          loading={isAnalysisLoading}
        />
      </Tooltip>

              <Tooltip title="Regenerate draft" zIndex={Z_INDEX.TOOLTIP}>
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefreshGpt}
          loading={isRefreshLoading}
        />
      </Tooltip>

      <Button onClick={onCopy}>Copy</Button>
    </>
  );
};
