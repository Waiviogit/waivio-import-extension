import React from 'react';
import { sendMessageToContentScript } from '../../services/pageParser';
import { BUTTON_TEXT, PARSE_COMMANDS, SOURCE_TYPES } from '../constants';
import { generateUniqueId } from './commonHelper';
import { DashboardButton } from '../../components/DasboardButton';

const editWithAi = {
  text: BUTTON_TEXT.EDIT_WITH_AI,
  onClick: async (event:Event): Promise<void> => (
    sendMessageToContentScript(
      event,
      PARSE_COMMANDS.EDIT_WITH_AI,
    )),
  id: generateUniqueId(),
};

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
  editWithAi,
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
  editWithAi,
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
  editWithAi,
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
  editWithAi,
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
  editWithAi,
];

export const youtubeButtonConfig = [
  {
    text: BUTTON_TEXT.CREATE_POST_DRAFT,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_DRAFT,
        SOURCE_TYPES.DRAFT_YOUTUBE,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_RECIPE_DRAFT,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_DRAFT,
        SOURCE_TYPES.RECIPE_DRAFT,
      )),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_POST,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.CREATE_POST,
        SOURCE_TYPES.YOUTUBE,
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
