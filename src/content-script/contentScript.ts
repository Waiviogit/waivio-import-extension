const downloadObjectAsJson = (exportObj: object, exportName: string): void => {
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportObj))}`;
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', `${exportName}.json`);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
const SELECTOR = {
  TWISTER_ID: '#tp-inline-twister-dim-values-container',
};

const getOptions = () => {
  const options = document.querySelectorAll(SELECTOR.TWISTER_ID);
  console.log(options);
};

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);
  console.log(sender);
  getOptions();
  downloadObjectAsJson({ test: 'test' }, 'test');
});

export {};
