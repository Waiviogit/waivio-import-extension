chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getCookies') {
    chrome.cookies.getAll({ domain: message.payload }, (cookies) => {
      sendResponse({ cookies });
    });

    return true; // Indicates that the response will be sent asynchronously
  }
});

export {};
