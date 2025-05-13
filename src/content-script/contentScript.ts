import {
  downloadObjectAsJson, downloadXLSX, copyToClipboard, downloadASIN,
} from './helpers/downloadHelper';
import { downloadProductToWaivio, validateWaivioImport } from './helpers/downloadWaivioHelper';
import { urlValidation } from './validation';
import { EXTENSION_COMMANDS, PARSE_COMMANDS } from '../common/constants';
import { createDraft } from './helpers/draftHelper';
import uploadBusinessToWaivio from './openstreetmap/uploadBusinessToWaivio';
import uploadGooglePlaceToWaivio from './googleMaps/uploadGooglePlaceToWaivio';
import { checkWaivioObjects, getId } from './helpers/idHelper';
import { createLink } from './objectLink/createLink';
import { createPost } from './helpers/postHelper';
import { editWithAi } from './editAi/editWithAi';

const actionScript = {
  [PARSE_COMMANDS.TO_JSON]: downloadObjectAsJson,
  [PARSE_COMMANDS.TO_CSV]: downloadXLSX,
  [PARSE_COMMANDS.TO_CLIPBOARD]: copyToClipboard,
  [PARSE_COMMANDS.IMPORT_WAIVIO]: downloadProductToWaivio,
  [PARSE_COMMANDS.IMPORT_WAIVIO_OPENSTREETMAP]: uploadBusinessToWaivio,
  [PARSE_COMMANDS.IMPORT_WAIVIO_GOOGLE]: uploadGooglePlaceToWaivio,
  [PARSE_COMMANDS.SCAN_ASINS]: downloadASIN,
  [PARSE_COMMANDS.CREATE_DRAFT]: createDraft,
  [PARSE_COMMANDS.CREATE_POST]: createPost,
  [PARSE_COMMANDS.GET_ID]: getId,
  [PARSE_COMMANDS.CREATE_LINK]: createLink,
  [PARSE_COMMANDS.EDIT_WITH_AI]: editWithAi,
  default: () => {},
};

const IMPORT_WAIVIO_COMMANDS = [
  PARSE_COMMANDS.IMPORT_WAIVIO,
  PARSE_COMMANDS.IMPORT_WAIVIO_OPENSTREETMAP,
  PARSE_COMMANDS.IMPORT_WAIVIO_GOOGLE,
  PARSE_COMMANDS.CREATE_LINK,
];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message.action || typeof message.action !== 'string') {
    chrome.runtime.sendMessage({
      action: EXTENSION_COMMANDS.ENABLE, id: message.buttonId, buttonText: message.buttonText,
    });
    return true;
  }

  if (message.action === PARSE_COMMANDS.ALERT_OBJECT_MODAL) {
    checkWaivioObjects(message.payload);
    return true;
  }

  if (IMPORT_WAIVIO_COMMANDS.includes(message.action)) {
    validateWaivioImport().then(({ valid, message: errorMessage }) => {
      if (!valid) {
        alert(errorMessage);
        chrome.runtime.sendMessage({
          action: EXTENSION_COMMANDS.ENABLE, id: message.buttonId, buttonText: message.buttonText,
        });
      }
    });
    return true;
  }

  const downLoadType = message.action as keyof typeof actionScript;

  if (!urlValidation(message.payload, message.action, message.source)) {
    chrome.runtime.sendMessage({
      action: EXTENSION_COMMANDS.ENABLE, id: message.buttonId, buttonText: message.buttonText,
    });
    return true;
  }

  const action = actionScript[downLoadType] || actionScript.default;
  Promise.resolve(action(message.source)).then(() => {
    chrome.runtime.sendMessage({
      action: EXTENSION_COMMANDS.ENABLE, id: message.buttonId, buttonText: message.buttonText,
    });
  });

  return true;
});

export {};
