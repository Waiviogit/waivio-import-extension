import { sendMessageToContentScript } from '../../services/pageParser';
import { BUTTON_TEXT, PARSE_COMMANDS, SOURCE_TYPES } from '../constants';
import { generateUniqueId } from './commonHelper';
import { getCurrentTab } from '../../services/chromeHelper';
import { extractVideoId } from '../../content-script/helpers/youtubeHelper';
import { showAlertObjectModal } from '../../content-script/components/AlertObjectModal';

export const editAiButtons = [
  {
    text: BUTTON_TEXT.EDIT_WITH_AI_PRODUCT,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.EDIT_WITH_AI,
        SOURCE_TYPES.EDIT_AI_PRODUCT,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.EDIT_WITH_AI_BUSINESS,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.EDIT_WITH_AI,
        SOURCE_TYPES.EDIT_AI_BUSINESS,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.EDIT_WITH_AI_PERSON,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.EDIT_WITH_AI,
        SOURCE_TYPES.EDIT_AI_PERSON,
      )),
    id: generateUniqueId(),
  },
];

export const mainButtonsConfig = [
  {
    text: BUTTON_TEXT.CREATE_JSON,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.TO_JSON,
        SOURCE_TYPES.AMAZON,
      )),
    id: generateUniqueId(),

  },
  {
    text: BUTTON_TEXT.CREATE_XLSX,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.TO_CSV,
        SOURCE_TYPES.AMAZON,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.COPY_TO_CLIPBOARD,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.TO_CLIPBOARD,
        SOURCE_TYPES.AMAZON,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.SCAN_FOR_ASINS,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.SCAN_ASINS,
        SOURCE_TYPES.AMAZON,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.UPLOAD_TO_WAIVIO,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.IMPORT_WAIVIO,
        SOURCE_TYPES.AMAZON,
      )
    ),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_LINK_ALL,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_LINK,
        SOURCE_TYPES.LINK_ALL,
      )
    ),
    id: generateUniqueId(),
  },
  ...editAiButtons,
];

export const aliexpressButtonsConfig = [
  {
    text: BUTTON_TEXT.CREATE_JSON,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.TO_JSON,
        SOURCE_TYPES.ALIEXPRESS,
      )),
    id: generateUniqueId(),

  },
  {
    text: BUTTON_TEXT.CREATE_XLSX,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.TO_CSV,
        SOURCE_TYPES.ALIEXPRESS,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.COPY_TO_CLIPBOARD,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.TO_CLIPBOARD,
        SOURCE_TYPES.ALIEXPRESS,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.UPLOAD_TO_WAIVIO,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.IMPORT_WAIVIO,
        SOURCE_TYPES.ALIEXPRESS,
      )
    ),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_LINK_ALL,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_LINK,
        SOURCE_TYPES.LINK_ALL,
      )
    ),
    id: generateUniqueId(),
  },
  ...editAiButtons,
];

export const instacartButtonsConfig = [
  {
    text: BUTTON_TEXT.CREATE_LINK_ALL,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_LINK,
        SOURCE_TYPES.LINK_ALL,
      )
    ),
    id: generateUniqueId(),
  },
  ...editAiButtons,
];

export const sephoraButtonsConfig = [
  {
    text: BUTTON_TEXT.CREATE_JSON,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.TO_JSON,
        SOURCE_TYPES.SEPHORA,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_XLSX,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.TO_CSV,
        SOURCE_TYPES.SEPHORA,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.COPY_TO_CLIPBOARD,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.TO_CLIPBOARD,
        SOURCE_TYPES.SEPHORA,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.UPLOAD_TO_WAIVIO,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.IMPORT_WAIVIO,
        SOURCE_TYPES.SEPHORA,
      )
    ),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_LINK_ALL,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_LINK,
        SOURCE_TYPES.LINK_ALL,
      )
    ),
    id: generateUniqueId(),
  },
  ...editAiButtons,
];

export const walmartButtonsConfig = [
  {
    text: BUTTON_TEXT.CREATE_JSON,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.TO_JSON,
        SOURCE_TYPES.WALMART,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_XLSX,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.TO_CSV,
        SOURCE_TYPES.WALMART,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.COPY_TO_CLIPBOARD,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.TO_CLIPBOARD,
        SOURCE_TYPES.WALMART,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.UPLOAD_TO_WAIVIO,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.IMPORT_WAIVIO,
        SOURCE_TYPES.WALMART,
      )
    ),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_LINK_ALL,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_LINK,
        SOURCE_TYPES.LINK_ALL,
      )
    ),
    id: generateUniqueId(),
  },
  ...editAiButtons,
];

interface EmbeddableResult {
  playable: boolean;
  reason: string;
}

const getEmbedConfirmMessage = (reason: string): string => `Video cannot be embedded: ${reason}. Do you want to proceed?`;

const testYouTubeEmbeddable = async (): Promise<EmbeddableResult> => {
  try {
    const tab = await getCurrentTab();
    if (!tab?.url) {
      console.log('No URL detected');
      return { playable: false, reason: 'No URL detected' };
    }

    const videoId = extractVideoId(tab.url);
    if (!videoId) {
      console.log('Could not extract video ID from URL');
      return { playable: false, reason: 'Could not extract video ID' };
    }

    console.log('Checking video via background:', videoId);

    const result = await chrome.runtime.sendMessage({
      action: 'checkYouTubeEmbeddable',
      videoId,
    });

    console.log('Background result:', result);

    if (result.error) {
      console.error('Background error:', result.error);
      return { playable: false, reason: result.error };
    }

    if (result.playable) {
      return { playable: true, reason: '' };
    }
    console.log('Not playable, reason:', result.reason);
    return { playable: false, reason: result.reason || 'Unknown reason' };
  } catch (error) {
    console.error('Error testing embeddability:', error);
    return { playable: false, reason: 'Error checking embeddability' };
  }
};

export const youtubeButtonConfig = [
  {
    text: BUTTON_TEXT.CREATE_POST_DRAFT,
    onClick: async (event:Event): Promise<void> => {
      const { playable, reason } = await testYouTubeEmbeddable();
      if (!playable) {
        const proceed = await showAlertObjectModal(getEmbedConfirmMessage(reason), 'Proceed Anyway');
        if (!proceed) return;
      }
      await sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_DRAFT,
        SOURCE_TYPES.DRAFT_YOUTUBE,
      );
    },
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_RECIPE_DRAFT,
    onClick: async (event:Event): Promise<void> => {
      const { playable, reason } = await testYouTubeEmbeddable();
      if (!playable) {
        const proceed = await showAlertObjectModal(getEmbedConfirmMessage(reason), 'Proceed Anyway');
        if (!proceed) return;
      }
      await sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_DRAFT,
        SOURCE_TYPES.RECIPE_DRAFT,
      );
    },
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.TUTORIAL_DRAFT,
    onClick: async (event:Event): Promise<void> => {
      const { playable, reason } = await testYouTubeEmbeddable();
      if (!playable) {
        const proceed = await showAlertObjectModal(getEmbedConfirmMessage(reason), 'Proceed Anyway');
        if (!proceed) return;
      }
      await sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_DRAFT,
        SOURCE_TYPES.TUTORIAL_YOUTUBE,
      );
    },
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_POST,
    onClick: async (event:Event): Promise<void> => {
      const { playable, reason } = await testYouTubeEmbeddable();
      if (!playable) {
        const proceed = await showAlertObjectModal(getEmbedConfirmMessage(reason), 'Proceed Anyway');
        if (!proceed) return;
      }
      await sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_POST,
        SOURCE_TYPES.YOUTUBE,
      );
    },
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_LINK_ALL,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_LINK,
        SOURCE_TYPES.LINK_ALL,
      )
    ),
    id: generateUniqueId(),
  },
];

export const instagramButtonConfig = [
  {
    text: BUTTON_TEXT.CREATE_POST_DRAFT,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_DRAFT,
        SOURCE_TYPES.DRAFT_INSTAGRAM,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_RECIPE_DRAFT,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_DRAFT,
        SOURCE_TYPES.RECIPE_DRAFT_INSTAGRAM,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.TUTORIAL_DRAFT,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_DRAFT,
        SOURCE_TYPES.TUTORIAL_INSTAGRAM,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_POST,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_POST,
        SOURCE_TYPES.INSTAGRAM,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_LINK_ALL,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_LINK,
        SOURCE_TYPES.LINK_ALL,
      )
    ),
    id: generateUniqueId(),
  },
];

export const tikTokConfig = [
  {
    text: BUTTON_TEXT.CREATE_POST_DRAFT,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_DRAFT,
        SOURCE_TYPES.DRAFT_TIKTOK,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_RECIPE_DRAFT,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_DRAFT,
        SOURCE_TYPES.RECIPE_DRAFT_TIKTOK,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.TUTORIAL_DRAFT,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_DRAFT,
        SOURCE_TYPES.TUTORIAL_TIKTOK,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_POST,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_POST,
        SOURCE_TYPES.TIKTOK,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_LINK_ALL,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_LINK,
        SOURCE_TYPES.LINK_ALL,
      )
    ),
    id: generateUniqueId(),
  },
];

export const hiveConfig = [
  {
    text: BUTTON_TEXT.CREATE_POST_DRAFT,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_DRAFT,
        SOURCE_TYPES.REVIEW_DRAFT_HIVE,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_RECIPE_DRAFT,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_DRAFT,
        SOURCE_TYPES.RECIPE_DRAFT_HIVE,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.TUTORIAL_DRAFT,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_DRAFT,
        SOURCE_TYPES.TUTORIAL_DRAFT_HIVE,
      )),
    id: generateUniqueId(),
  },
];
