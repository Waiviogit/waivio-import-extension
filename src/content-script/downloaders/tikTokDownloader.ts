interface TiktokDownloadData {
  nowm?: string;
  wm?: string;
  audio?: string;
}

// Function moved to background script to avoid CORS issues
export async function tiktokdownloadUrl(url: string): Promise<TiktokDownloadData> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'tiktokdownloadUrl', url },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        resolve(response.result);
      },
    );
  });
}

export const getTiktokDataBlob = async (): Promise<string> => {
  const data = await tiktokdownloadUrl(document.URL);
  const downloadUrl = data.nowm;

  if (!downloadUrl) throw new Error('Can\'t get tiktok download url');
  return downloadUrl;
};

export const getTicktockThumbnail = async (): Promise<string> => {
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(document.URL)}`;
    const response = await fetch(oembedUrl);
    const data = await response.json();
    return data.thumbnail_url || '';
  } catch (error) {
    console.error('Error fetching TikTok thumbnail:', error);
    return '';
  }
};
