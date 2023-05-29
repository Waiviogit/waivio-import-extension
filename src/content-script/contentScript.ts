import {
  downloadObjectAsJson, downloadXLSX, copyToClipboard, downloadASIN,
} from './helpers/downloadHelper';
import { randomNameGenerator } from './helpers/commonHelper';
import { getProduct } from './getProduct';
import { downloadToWaivio } from './helpers/downloadWaivioHelper';
import { urlValidation } from './validation';

const downloadFileScript = {
  to_json: downloadObjectAsJson,
  to_csv: downloadXLSX,
  to_clipboard: copyToClipboard,
  import_waivio: downloadToWaivio,
  scan_asins: () => {},
  default: () => {},
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message.action || typeof message.action !== 'string') return;

  const downLoadType = message.action as keyof typeof downloadFileScript;
  if (!urlValidation(message.payload, message.action)) return;
  const fileName = randomNameGenerator(8);
  if (downLoadType === 'scan_asins') {
    downloadASIN(fileName);
    return;
  }
  const { product, error } = getProduct();
  if (!product || error) return;

  (downloadFileScript[downLoadType] || downloadFileScript.default)(product, fileName);
});

export {};
