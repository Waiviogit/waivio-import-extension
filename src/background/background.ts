import axios from 'axios';
import * as cheerio from 'cheerio';
import * as qs from 'qs';

// Cache for blob data to avoid multiple fetches - moved outside the listener
const blobCache = new Map<string, Uint8Array>();

async function tiktokdownloadUrl(url: string) {
  return new Promise((resolve, reject) => {
    // Create axios instance with realistic browser headers
    const axiosInstance = axios.create({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
      },
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: (status) => status < 400, // Don't throw on 3xx redirects
    });

    axiosInstance.get('https://ttdownloader.com/')
      .then((data) => {
        console.log('Initial request status:', data.status);
        console.log('Response headers:', data.headers);

        const $ = cheerio.load(data.data);
        const cookie = data.headers['set-cookie']?.join('') || '';
        const token = $('#token').attr('value') || '';

        console.log('Extracted token:', token);
        console.log('Extracted cookies:', cookie);

        const dataPost = {
          url,
          format: '',
          token,
        };

        axiosInstance({
          method: 'POST',
          url: 'https://ttdownloader.com/search/',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            Origin: 'https://ttdownloader.com',
            Referer: 'https://ttdownloader.com/',
            Cookie: cookie,
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
          },
          data: qs.stringify(dataPost),
        }).then(({ data: searchData, status }) => {
          console.log('Search request status:', status);
          console.log('Search response length:', searchData.length);

          const $$ = cheerio.load(searchData);
          const result = {
            nowm: $$('#results-list > div:nth-child(2) > div.download > a')?.attr('href'),
            wm: $$('#results-list > div:nth-child(3) > div.download > a')?.attr('href'),
            audio: $$('#results-list > div:nth-child(4) > div.download > a')?.attr('href'),
          };

          console.log('Parsed result:', result);
          resolve(result);
        })
          .catch((e) => {
            console.error('Search request error:', e.response?.status, e.response?.statusText);
            console.error('Search request data:', e.response?.data);
            reject(new Error(`Search request failed: ${e.response?.status} ${e.response?.statusText || e.message}`));
          });
      })
      .catch((e) => {
        console.error('Initial request error:', e.response?.status, e.response?.statusText);
        console.error('Initial request data:', e.response?.data);
        reject(new Error(`Initial request failed: ${e.response?.status} ${e.response?.statusText || e.message}`));
      });
  });
}

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

  if (message.action === 'tiktokdownloadUrl') {
    (async () => {
      try {
        const result = await tiktokdownloadUrl(message.url);
        sendResponse({ result });
      } catch (error) {
        sendResponse({ error: (error as Error).message });
      }
    })();
    return true;
  }
});

export {};
