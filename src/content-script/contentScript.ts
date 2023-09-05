import {
  downloadObjectAsJson, downloadXLSX, copyToClipboard, downloadASIN,
} from './helpers/downloadHelper';
import { downloadToWaivio } from './helpers/downloadWaivioHelper';
import { urlValidation } from './validation';
import { EXTENSION_COMMANDS, PARSE_COMMANDS } from '../common/constants';
import { createDraft } from './helpers/draftHelper';

const downloadFileScript = {
  [PARSE_COMMANDS.TO_JSON]: downloadObjectAsJson,
  [PARSE_COMMANDS.TO_CSV]: downloadXLSX,
  [PARSE_COMMANDS.TO_CLIPBOARD]: copyToClipboard,
  [PARSE_COMMANDS.IMPORT_WAIVIO]: downloadToWaivio,
  [PARSE_COMMANDS.SCAN_ASINS]: downloadASIN,
  [PARSE_COMMANDS.CREATE_DRAFT]: createDraft,
  default: () => {},
};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (!message.action || typeof message.action !== 'string') return;

  const downLoadType = message.action as keyof typeof downloadFileScript;
  if (!urlValidation(message.payload, message.action, message.source)) return;

  await (downloadFileScript[downLoadType] || downloadFileScript.default)(message.source);

  await chrome.runtime.sendMessage({
    action: EXTENSION_COMMANDS.ENABLE, id: message.buttonId, buttonText: message.buttonText,
  });
});

export {};
