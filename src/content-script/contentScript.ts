import {
  downloadObjectAsJson, downloadXLSX, copyToClipboard, downloadASIN,
} from './helpers/downloadHelper';
import { randomNameGenerator } from './helpers/commonHelper';
import { getProduct } from './getProduct';

const downloadFileScript = {
  to_json: downloadObjectAsJson,
  to_csv: downloadXLSX,
  to_clipboard: copyToClipboard,
  scan_asins: () => {},
  default: () => {},
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'string') return;
  const downLoadType = message as keyof typeof downloadFileScript;
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
