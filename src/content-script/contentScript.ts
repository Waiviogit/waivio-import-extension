import {
  downloadObjectAsJson, downloadXLSX, copyToClipboard,
} from './helpers/downloadHelper';
import { randomNameGenerator } from './helpers/commonHelper';
import { getProduct } from './getProduct';

const downloadFileScript = {
  to_json: downloadObjectAsJson,
  to_csv: downloadXLSX,
  to_clipboard: copyToClipboard,
  default: () => {},
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'string') return;
  const downLoadType = message as keyof typeof downloadFileScript;

  const { product, error } = getProduct();
  if (!product || error) return;

  const fileName = randomNameGenerator(8);

  (downloadFileScript[downLoadType] || downloadFileScript.default)(product, fileName);
});

export {};
