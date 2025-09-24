import { EXTERNAL_URL } from '../constants';
import { getInstagramDataBlob } from '../downloaders/instagramDownloader';
import { getTiktokDataBlob } from '../downloaders/tikTokDownloader';
import { shortenYoutubeUrl } from './youtubeHelper';
import { getThreeSpeakDataBlob } from '../downloaders/threeSpeakDownloader';

type responseType = {
    result?: string
    error?: unknown
}
export const getGptAnswer = async (query: string): Promise<responseType> => {
  try {
    console.log('request sent');
    const response = await fetch(
      EXTERNAL_URL.WAIVIO_IMPORT_GPT_QUERY,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      },
    );
    const responseData = await response.json();

    return { result: responseData.result };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

const blobGetters: Record<string, () => Promise<string>> = {
  'tiktok.com': getTiktokDataBlob,
  'instagram.com': getInstagramDataBlob,
  '3speak.tv': getThreeSpeakDataBlob,
  'waivio.com': getThreeSpeakDataBlob,
};

const getDownloadUrl = async (url: string) => {
  const entry = Object.entries(blobGetters).find(([domain]) => url.includes(domain));
  if (!entry) throw new Error('Unsupported platform');
  return entry[1]();
};

export async function getRemoteFileSizeMB(url: string): Promise<number | null> {
  try {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'getRemoteFileSize', url },
        (response) => {
          if (response.error) {
            console.error('Error fetching file size:', response.error);
            resolve(null);
          } else {
            resolve(response.sizeMB);
          }
        },
      );
    });
  } catch (err) {
    console.error('Error fetching file size:', err);
    return null;
  }
}

export async function downloadBlobViaBackground(url: string): Promise<Blob | null> {
  try {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'downloadBlob', url },
        async (response) => {
          if (response.error) {
            console.error('Error downloading blob:', response.error);
            resolve(null);
            return;
          }

          // Always use chunked download
          try {
            const downloadChunk = (chunkIndex: number) => new Promise<Uint8Array>(
              (chunkResolve, chunkReject) => {
                chrome.runtime.sendMessage(
                  { action: 'getBlobChunk', url, chunkIndex },
                  (chunkResponse) => {
                    if (chunkResponse.error) {
                      chunkReject(new Error(chunkResponse.error));
                      return;
                    }
                    chunkResolve(new Uint8Array(chunkResponse.chunk));
                  },
                );
              },
            );

            const chunkPromises = [];
            for (let i = 0; i < response.totalChunks; i++) {
              chunkPromises.push(downloadChunk(i));
            }

            Promise.all(chunkPromises).then((chunkArrays) => {
              // Clear cache after successful download
              chrome.runtime.sendMessage({ action: 'clearBlobCache', url });

              const totalSize = chunkArrays.reduce((sum, chunk) => sum + chunk.length, 0);
              const combined = new Uint8Array(totalSize);
              let offset = 0;

              for (const chunk of chunkArrays) {
                combined.set(chunk, offset);
                offset += chunk.length;
              }

              const blob = new Blob([combined]);
              resolve(blob);
            }).catch((chunkError) => {
              console.error('Error downloading chunks:', chunkError);
              chrome.runtime.sendMessage({ action: 'clearBlobCache', url });
              resolve(null);
            });
          } catch (chunkError) {
            console.error('Error processing chunks:', chunkError);
            chrome.runtime.sendMessage({ action: 'clearBlobCache', url });
            resolve(null);
          }
        },
      );
    });
  } catch (err) {
    console.error('Error downloading blob:', err);
    return null;
  }
}

const videoAnalyzeWithBlob = async (prompt: string, url: string): Promise<responseType> => {
  try {
    const downloadUrl = await getDownloadUrl(url);
    const allowedSizeInMB = 100;
    const currentSizeInMB = await getRemoteFileSizeMB(downloadUrl);
    if (!currentSizeInMB) throw new Error('Error fetching file size');

    if (currentSizeInMB > allowedSizeInMB) {
      const errorMessage = `Max file size exceeded. Current size: ${currentSizeInMB}MB, Allowed size: ${allowedSizeInMB}MB`;
      throw new Error(errorMessage);
    }

    const blob = await downloadBlobViaBackground(downloadUrl);

    if (!blob) throw new Error('cant make blob');

    const formData = new FormData();
    formData.append('file', blob, 'video.mp4');
    formData.append('prompt', prompt);
    formData.append('url', url);

    const response = await fetch(EXTERNAL_URL.WAIVIO_IMPORT_VIDEO_ANALYSES_BLOB, {
      method: 'POST',
      body: formData,
    });

    const responseData = await response.json();
    return { result: responseData.result };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export const videoAnalysesByLink = async (prompt: string, url: string): Promise<responseType> => {
  try {
    if (!url.includes('youtube.com')) {
      return videoAnalyzeWithBlob(prompt, url);
    }

    const response = await fetch(
      EXTERNAL_URL.WAIVIO_IMPORT_VIDEO_ANALYSES,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt, url: shortenYoutubeUrl(url),
        }),
      },
    );
    const responseData = await response.json();

    return { result: responseData.result };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export const formatResponseToValidJson = (string = '') => string
  .replace(/```/gm, '')
  .replace('json', '')
  .replace(/^"|"$/g, '') // Remove the outermost quotes
  .replace(/\\"/g, '"') // Replace escaped quotes with actual quotes
  .replace(/\\n/g, '\n') // Convert escaped newlines into actual newlines
  .replace(/\\\\/g, '\\');
