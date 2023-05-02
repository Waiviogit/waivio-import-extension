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

  console.log(message);
  console.log(sender);
  getOptions();

  const exportObject = { test: 'test' };
  const fileName = randomNameGenerator(8);

  // @ts-ignore
  (downloadFileScript[message] || downloadFileScript.default)(exportObject, fileName);
});

export {};
