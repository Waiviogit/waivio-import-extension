import { useState, useEffect } from 'react';
import { initialDeepAnalysis } from '../helpers/draftHelper';
import { extractPostInfo } from '../helpers/postHelper';
import loadingEmitter from '../emiters/loadingEmitter';
import { getRecipeUrl } from '../helpers/objectHelper';
import { RECIPE_SOURCE_TYPES } from '../../common/constants';

interface PostData {
  title: string;
  body: string;
  tags: string[];
  uploadedImage?: string;
}

interface AnalysisState {
  progress: number;
  step: string;
  message: string;
}

export const usePostData = (
  initialData: PostData,
  source: string,
  commandType?: string,
) => {
  const [data, setData] = useState<PostData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    progress: 0,
    step: '',
    message: '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!commandType) return;

      const handleDeepAnalysisEvent = (e: Event) => {
        const customEvent = e as CustomEvent;
        const {
          step, message, progress, data: eventData,
        } = customEvent.detail || {};

        setAnalysisState({
          step: step || '',
          message: message || '',
          progress: progress || 0,
        });

        if (eventData && typeof eventData === 'string') {
          setData((prev) => ({ ...prev, body: eventData }));
        } else if (eventData && eventData.body) {
          setData((prev) => ({ ...prev, body: eventData.body }));
        }
      };

      const handlePostLoading = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail?.data) {
          setData((prev) => ({ ...prev, body: customEvent.detail.data || '' }));
        }
      };

      const eventTypes = [
        'deep-analysis-start',
        'deep-analysis-step',
        'deep-analysis-complete',
        'deep-analysis-error',
        'draft-refresh-start',
        'draft-refresh-step',
        'draft-refresh-complete',
        'draft-refresh-error',
      ];

      eventTypes.forEach((eventType) => {
        loadingEmitter.addEventListener(eventType, handleDeepAnalysisEvent);
      });
      loadingEmitter.addEventListener('post-loading', handlePostLoading);

      setIsLoading(true);

      try {
        if (commandType === 'CREATE_DRAFT') {
          if (RECIPE_SOURCE_TYPES.includes(source)) {
            const uploadedImage = await getRecipeUrl();
            if (uploadedImage) setData((prev) => ({ ...prev, uploadedImage }));
          }

          const draftData = await initialDeepAnalysis(source);
          if (draftData) {
            setData((prev) => ({
              ...prev,
              title: draftData.title,
              body: draftData.body,
              tags: draftData.tags,
            }));
          }
        } else if (commandType === 'CREATE_POST') {
          const postData = await extractPostInfo(source);
          if (postData) {
            setData((prev) => ({
              ...prev,
              title: postData.title,
              body: postData.body,
              tags: postData.tags,
            }));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
        setAnalysisState({ progress: 0, step: '', message: '' });
      }

      return () => {
        eventTypes.forEach((eventType) => {
          loadingEmitter.removeEventListener(eventType, handleDeepAnalysisEvent);
        });
        loadingEmitter.removeEventListener('post-loading', handlePostLoading);
      };
    };

    loadData();
  }, [commandType, source]);

  const updateData = (updates: Partial<PostData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  return {
    data,
    isLoading,
    analysisState,
    updateData,
  };
};
