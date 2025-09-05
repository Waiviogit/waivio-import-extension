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
    const res = await fetch(url, { method: 'HEAD' }); // only headers
    const sizeHeader = res.headers.get('content-length');
    if (!sizeHeader) return null;

    const sizeBytes = parseInt(sizeHeader, 10);
    return Number((sizeBytes / (1024 * 1024)).toFixed(3)); // convert to MB
  } catch (err) {
    console.error('Error fetching file size:', err);
    return null;
  }
}

const videoAnalyzeWithBlob = async (prompt: string, url: string): Promise<responseType> => {
  try {
    const downloadUrl = await getDownloadUrl(url);
    const allowedSizeInMB = 50;
    const currentSizeInMB = await getRemoteFileSizeMB(downloadUrl);
    if (!currentSizeInMB) throw new Error('Error fetching file size');

    if (currentSizeInMB > allowedSizeInMB) {
      const errorMessage = `Max file size exceeded. Current size: ${currentSizeInMB}MB, Allowed size: ${allowedSizeInMB}MB`;
      alert(errorMessage);
      throw new Error(errorMessage);
    }

    const blob = await fetch(downloadUrl).then((res) => res.blob());

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
