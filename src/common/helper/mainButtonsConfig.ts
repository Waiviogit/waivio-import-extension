import { sendMessageToContentScript } from '../../services/pageParser';
import { PARSE_COMMANDS } from '../constants';

export const mainButtonsConfig = [
  {
    text: 'Create JSON',
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(event, PARSE_COMMANDS.TO_JSON)),
    id: 'btn1',
  },
  {
    text: 'Create XLSX',
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(event, PARSE_COMMANDS.TO_CSV)),
    id: 'btn2',
  },
  {
    text: 'Copy to clipboard',
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(event, PARSE_COMMANDS.TO_CLIPBOARD)),
    id: 'btn3',
  },
  {
    text: 'Scan for ASINs',
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(event, PARSE_COMMANDS.SCAN_ASINS)),
    id: 'btn4',
  },
  {
    text: 'Upload to Waivio',
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(event, PARSE_COMMANDS.IMPORT_WAIVIO)),
    id: 'btn5',
  },
];

export const youtubeButtonConfig = [
  {
    text: 'Create post draft',
    onClick: async (event:Event): Promise<void> => (
      sendMessageToContentScript(event, PARSE_COMMANDS.CREATE_DRAFT)),
    id: 'btn6',
  },
];
