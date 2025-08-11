import React from 'react';
import { Button, Tooltip } from 'antd';
import { ReloadOutlined, VideoCameraAddOutlined } from '@ant-design/icons';
import { SOURCE_TYPES } from '../../common/constants';

interface PostActionButtonsProps {
  source: string;
  isRecipeLoading: boolean;
  isRefreshLoading: boolean;
  isAnalysisLoading: boolean;
  onCreateObject: () => void;
  onRefreshGpt: () => void;
  onAnalysis: () => void;
  onCopy: () => void;
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
}) => {
  const isRecipeSource = RECIPE_SOURCES.includes(source || '');

  return (
    <>
      {isRecipeSource && (
        <Button
          onClick={onCreateObject}
          loading={isRecipeLoading}
        >
          Create object
        </Button>
      )}

      <Tooltip title="Analyze video content with AI" zIndex={9999}>
        <Button
          icon={<VideoCameraAddOutlined />}
          onClick={onAnalysis}
          loading={isAnalysisLoading}
        />
      </Tooltip>

      <Tooltip title="Regenerate draft" zIndex={9999}>
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
