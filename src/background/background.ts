chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getCookies') {
    chrome.cookies.getAll({ domain: message.payload }, (cookies) => {
      sendResponse({ cookies });
    });

    return true; // Indicates that the response will be sent asynchronously
  }

  if (message.action === 'CAPTURE_VISIBLE_TAB') {
    try {
      chrome.tabs.captureVisibleTab({ format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
          return;
        }
        sendResponse({ dataUrl });
      });
    } catch (e) {
      sendResponse({ error: (e as Error).message });
    }
    return true;
  }
});

export {};
