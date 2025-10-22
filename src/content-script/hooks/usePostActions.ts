import { useState } from 'react';
import removeMd from 'remove-markdown';
import { postImportWaivio } from '../helpers/downloadWaivioHelper';
import { copyContent } from '../helpers/commonHelper';
import { createObjectForPost } from '../helpers/objectHelper';
import { getDraftBodyTitleTags } from '../helpers/draftHelper';
import { extractPostInfo } from '../helpers/postHelper';
import { createAnalysisVideoPromptBySource } from '../helpers/promptHelper';
import { videoAnalysesByLink, getGptAnswer } from '../helpers/gptHelper';
import { MODAL_IDS } from '../constants';
import { RECIPE_SOURCE_TYPES, SOURCE_TYPES } from '../../common/constants';

interface PostActionsProps {
  title: string;
  body: string;
  host: string;
  tags: string[];
  source: string;
  uploadedImage?: string;
  onDataUpdate: (updates: {
    title?: string;
    body?: string;
    tags?: string[];
    uploadedImage?: string;
  }) => void;
  onClose: () => void;
  onShowImageUploadModal: () => void;
}

export const usePostActions = ({
  title,
  body,
  host,
  tags,
  source,
  uploadedImage,
  onDataUpdate,
  onClose,
  onShowImageUploadModal,
}: PostActionsProps) => {
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [isRefreshLoading, setIsRefreshLoading] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isObjectCreated, setIsObjectCreated] = useState(false);

  const handleSubmit = async () => {
    const nested = document.getElementById(MODAL_IDS.MAIN_MODAL_HOST);
    if (!nested) return;

    await postImportWaivio({
      title,
      body,
      host,
      tags,
    });
    onClose();
    document.body.removeChild(nested);
  };

  const handleCopy = async () => {
    await copyContent(body);
  };

  const handleCreateObject = async () => {
    setIsRecipeLoading(true);
    try {
      const objectForPost = await createObjectForPost(body, uploadedImage);
      if (objectForPost) {
        const updatedBody = `${body}\n[${objectForPost.name}](https://${host}/object/${objectForPost.permlink})`;
        onDataUpdate({ body: updatedBody });
        setIsObjectCreated(true);
      }
    } finally {
      setIsRecipeLoading(false);
    }
  };

  const handleRefreshGpt = async () => {
    setIsRefreshLoading(true);
    try {
      let bodyFromEditor = body;
      const videoData = await extractPostInfo(source || '');
      if (videoData) {
        bodyFromEditor = `${videoData.title}${videoData.body} ${bodyFromEditor}`;
      }

      const draftData = await getDraftBodyTitleTags(source, bodyFromEditor);
      if (draftData) {
        const { body: reBody, tags: reTags } = draftData;
        onDataUpdate({ body: reBody, tags: reTags });
      }
    } finally {
      setIsRefreshLoading(false);
    }
  };

  const handleAnalysis = async () => {
    setIsAnalysisLoading(true);
    try {
      const prompt = createAnalysisVideoPromptBySource(source, '');
      const response = await videoAnalysesByLink(prompt, document.URL);
      if (!response.result) {
        alert('Failed to upload the video. Please try again.');
        return;
      }
      onDataUpdate({ body: response.result });
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const handleImageUpload = () => {
    onShowImageUploadModal();
  };

  const createCommentFromBody = async (input: string): Promise<string | null> => {
    const cleanText = removeMd(input);
    console.log('cleanText', cleanText);

    const isRecipeSource = RECIPE_SOURCE_TYPES.includes(source || '');
    const maxChars = [SOURCE_TYPES.TUTORIAL_TIKTOK, SOURCE_TYPES.RECIPE_DRAFT_TIKTOK, SOURCE_TYPES.DRAFT_TIKTOK].includes(source)
      ? 150
      : 2200;
    let prompt = 'Remove author attribution and any links from text. Return plain text only, do not remove emoji.';
    if (isRecipeSource) {
      prompt += 'remove first introduction paragraph, remove any hashtags';
    }
    prompt += `max output length should not exceed ${maxChars} characters including whitespaces, 
shorten the post if needed, do not remove logical newlines`;

    const query = `${prompt}\n\nText:\n${cleanText}`;
    const response = await getGptAnswer(query);
    return response.result || null;
  };

  return {
    handleSubmit,
    handleCopy,
    handleCreateObject,
    handleRefreshGpt,
    handleAnalysis,
    handleImageUpload,
    isRecipeLoading,
    isRefreshLoading,
    isAnalysisLoading,
    isObjectCreated,
    uploadedImage,
    createCommentFromBody,
  };
};
