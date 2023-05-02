import { downloadObjectAsCsv, downloadObjectAsJson } from './helpers/downloadHelper';
import { randomNameGenerator } from './helpers/commonHelper';
import { getOptions } from './parser/options';

const downloadFileScript = {
  to_json: downloadObjectAsJson,
  to_csv: downloadObjectAsCsv,
  default: () => {},
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'string') return;
  const downLoadType = message as keyof typeof downloadFileScript;

  console.log(message);
  console.log(sender);
  getOptions();

  const exportObject = { test: 'test' };
  const fileName = randomNameGenerator(8);

  (downloadFileScript[downLoadType] || downloadFileScript.default)(exportObject, fileName);
});

export {};
