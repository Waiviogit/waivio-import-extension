import {
  downloadObjectAsJson, downloadXLSX, copyToClipboard, downloadASIN,
} from './helpers/downloadHelper';
import { downloadProductToWaivio, validateWaivioImport } from './helpers/downloadWaivioHelper';
import { urlValidation } from './validation';
import { EXTENSION_COMMANDS, PARSE_COMMANDS } from '../common/constants';
import { createDraft } from './helpers/draftHelper';
import uploadBusinessToWaivio from './openstreetmap/uploadBusinessToWaivio';
import uploadGooglePlaceToWaivio from './googleMaps/uploadGooglePlaceToWaivio';
import { getId } from './helpers/idHelper';

const actionScript = {
  [PARSE_COMMANDS.TO_JSON]: downloadObjectAsJson,
  [PARSE_COMMANDS.TO_CSV]: downloadXLSX,
  [PARSE_COMMANDS.TO_CLIPBOARD]: copyToClipboard,
  [PARSE_COMMANDS.IMPORT_WAIVIO]: downloadProductToWaivio,
  [PARSE_COMMANDS.IMPORT_WAIVIO_OPENSTREETMAP]: uploadBusinessToWaivio,
  [PARSE_COMMANDS.IMPORT_WAIVIO_GOOGLE]: uploadGooglePlaceToWaivio,
  [PARSE_COMMANDS.SCAN_ASINS]: downloadASIN,
  [PARSE_COMMANDS.CREATE_DRAFT]: createDraft,
  [PARSE_COMMANDS.GET_ID]: getId,
  default: () => {},
};

const IMPORT_WAIVIO_COMMANDS = [
  PARSE_COMMANDS.IMPORT_WAIVIO,
  PARSE_COMMANDS.IMPORT_WAIVIO_OPENSTREETMAP,
  PARSE_COMMANDS.IMPORT_WAIVIO_GOOGLE,
];

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (!message.action || typeof message.action !== 'string') {
    await chrome.runtime.sendMessage({
      action: EXTENSION_COMMANDS.ENABLE, id: message.buttonId, buttonText: message.buttonText,
    });
    return;
  }

  if (IMPORT_WAIVIO_COMMANDS.includes(message.action)) {
    const { valid, message: errorMessage } = await validateWaivioImport();
    if (!valid) {
      alert(errorMessage);
      await chrome.runtime.sendMessage({
        action: EXTENSION_COMMANDS.ENABLE, id: message.buttonId, buttonText: message.buttonText,
      });
      return;
    }
  }

  const downLoadType = message.action as keyof typeof actionScript;

  if (!urlValidation(message.payload, message.action, message.source)) {
    await chrome.runtime.sendMessage({
      action: EXTENSION_COMMANDS.ENABLE, id: message.buttonId, buttonText: message.buttonText,
    });
    return;
  }

  await (actionScript[downLoadType]
      || actionScript.default)(message.source);

  await chrome.runtime.sendMessage({
    action: EXTENSION_COMMANDS.ENABLE, id: message.buttonId, buttonText: message.buttonText,
  });
});

export {};
