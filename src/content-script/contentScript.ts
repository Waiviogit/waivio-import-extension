import { downloadObjectAsCsv, downloadObjectAsJson } from './helpers/downloadHelper';
import { randomNameGenerator } from './helpers/commonHelper';
import { getProduct } from './getProduct';

const downloadFileScript = {
  to_json: downloadObjectAsJson,
  to_csv: downloadObjectAsCsv,
  default: () => {},
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'string') return;
  const downLoadType = message as keyof typeof downloadFileScript;

  const product = getProduct();
  const fileName = randomNameGenerator(8);

  (downloadFileScript[downLoadType] || downloadFileScript.default)(product, fileName);
});

export {};
