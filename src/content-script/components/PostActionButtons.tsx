import React from 'react';
import { Button, Tooltip } from 'antd';
import { ReloadOutlined, VideoCameraAddOutlined } from '@ant-design/icons';
import { RECIPE_SOURCE_TYPES } from '../../common/constants';
import { Z_INDEX } from '../constants';

interface PostActionButtonsProps {
  source: string;
  isRecipeLoading: boolean;
  isRefreshLoading: boolean;
  isAnalysisLoading: boolean;
  onCreateObject: () => void;
  onRefreshGpt: () => void;
  onAnalysis: () => void;
  onCopy: () => void;
  host?: string;
  container?: HTMLElement;
}

export const PostActionButtons: React.FC<PostActionButtonsProps> = ({
  source,
  isRecipeLoading,
  isRefreshLoading,
  isAnalysisLoading,
  onCreateObject,
  onRefreshGpt,
  onAnalysis,
  onCopy,
  host,
  container,
}) => {
  const isRecipeSource = RECIPE_SOURCE_TYPES.includes(source || '');
  const isWaivioHost = (host || '').includes('waivio.com');
  const isWaivioPage = typeof window !== 'undefined' && window.location.hostname.includes('waivio.com');

  return (
    <>
      {isRecipeSource && (
        <>

          <Button
            onClick={onCreateObject}
            loading={isRecipeLoading}
          >
            Create object
          </Button>
        </>
      )}

      {!(isWaivioHost || isWaivioPage) && (
        <Tooltip 
          title="Analyze video content with AI" 
          zIndex={Z_INDEX.TOOLTIP}
          getPopupContainer={() => container || document.body}
        >
          <Button
            icon={<VideoCameraAddOutlined />}
            onClick={onAnalysis}
            loading={isAnalysisLoading}
          />
        </Tooltip>
      )}

              <Tooltip 
                title="Regenerate draft" 
                zIndex={Z_INDEX.TOOLTIP}
                getPopupContainer={() => container || document.body}
              >
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
