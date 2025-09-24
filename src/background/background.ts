// Cache for blob data to avoid multiple fetches - moved outside the listener
const blobCache = new Map<string, Uint8Array>();

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

  if (message.action === 'getRemoteFileSize') {
    (async () => {
      try {
        const response = await fetch(message.url, {
          method: 'HEAD',
        });
        const sizeHeader = response.headers.get('content-length');
        if (!sizeHeader) {
          sendResponse({ error: 'No content-length header' });
          return;
        }
        const sizeBytes = parseInt(sizeHeader, 10);
        const sizeMB = Number((sizeBytes / (1024 * 1024)).toFixed(3));
        sendResponse({ sizeMB });
      } catch (error) {
        sendResponse({ error: (error as Error).message });
      }
    })();
    return true;
  }

  if (message.action === 'downloadBlob') {
    (async () => {
      try {
        // Check if already cached
        if (blobCache.has(message.url)) {
          const cachedData = blobCache.get(message.url)!;
          const chunkSize = 4 * 1024 * 1024;
          const totalChunks = Math.ceil(cachedData.length / chunkSize);

          sendResponse({
            totalSize: cachedData.length,
            totalChunks,
            cached: true,
          });
          return;
        }

        const response = await fetch(message.url);
        if (!response.ok) {
          sendResponse({ error: `HTTP ${response.status}: ${response.statusText}` });
          return;
        }
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Cache the blob data
        blobCache.set(message.url, uint8Array);
        console.log(`Cached blob for ${message.url}, size: ${uint8Array.length} bytes`);

        // Always use chunked approach (4MB chunks)
        const chunkSize = 4 * 1024 * 1024;
        const totalChunks = Math.ceil(uint8Array.length / chunkSize);

        sendResponse({
          totalSize: uint8Array.length,
          totalChunks,
          cached: false,
        });
      } catch (error) {
        sendResponse({ error: (error as Error).message });
      }
    })();
    return true;
  }

  if (message.action === 'getBlobChunk') {
    try {
      const cachedData = blobCache.get(message.url);
      if (!cachedData) {
        console.error(`Blob data not found in cache for ${message.url}. Available keys:`, Array.from(blobCache.keys()));
        sendResponse({ error: 'Blob data not found in cache' });
        return;
      }

      const chunkSize = 4 * 1024 * 1024;
      const start = message.chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, cachedData.length);
      const chunk = cachedData.slice(start, end);

      console.log(`Serving chunk ${message.chunkIndex}, size: ${chunk.length} bytes`);

      sendResponse({
        chunk: Array.from(chunk),
        chunkIndex: message.chunkIndex,
      });
    } catch (error) {
      sendResponse({ error: (error as Error).message });
    }
    return true;
  }

  if (message.action === 'clearBlobCache') {
    try {
      if (message.url) {
        const deleted = blobCache.delete(message.url);
        console.log(`Cache clear for ${message.url}: ${deleted ? 'success' : 'not found'}`);
      } else {
        blobCache.clear();
        console.log('Cache cleared completely');
      }
      sendResponse({ success: true });
    } catch (error) {
      sendResponse({ error: (error as Error).message });
    }
    return true;
  }
});

export {};
