import { downloadObjectAsJson } from './helpers/downloadHelper';
import { randomNameGenerator } from './helpers/commonHelper';
import { getOptions } from './parser/options';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);
  console.log(sender);
  getOptions();
  downloadObjectAsJson({ test: 'test' }, randomNameGenerator(8));
});

export {};
