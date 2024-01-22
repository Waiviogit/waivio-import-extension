import { sendMessageToContentScript } from '../../services/pageParser';
import { BUTTON_TEXT, PARSE_COMMANDS, SOURCE_TYPES } from '../constants';
import { generateUniqueId } from './commonHelper';

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
];

export const youtubeButtonConfig = [
  {
    text: BUTTON_TEXT.CREATE_POST_DRAFT,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(event, PARSE_COMMANDS.CREATE_DRAFT)),
    id: generateUniqueId(),
  },
];

export const openstreetmapButtonConfig = [
  {
    text: BUTTON_TEXT.UPLOAD_TO_WAIVIO,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(event, PARSE_COMMANDS.IMPORT_WAIVIO_OPENSTREETMAP)),
    id: generateUniqueId(),
  },
  {
    text: BUTTON_TEXT.CREATE_JSON,
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(
        event,
        PARSE_COMMANDS.TO_JSON,
        SOURCE_TYPES.OPENSTREETMAP,
      )),
    id: generateUniqueId(),
  },
];
