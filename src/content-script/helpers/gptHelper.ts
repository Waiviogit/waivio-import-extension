import { EXTERNAL_URL } from '../constants';
import { getInstagramDataBlob } from '../downloaders/instagramDownloader';
import { getTiktokDataBlob } from '../downloaders/tikTokDownloader';

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

const blobGetters: Record<string, () => Promise<Blob>> = {
  'tiktok.com': getTiktokDataBlob,
  'instagram.com': getInstagramDataBlob,
};

const getBlobForUrl = async (url: string) => {
  const entry = Object.entries(blobGetters).find(([domain]) => url.includes(domain));
  if (!entry) throw new Error('Unsupported platform');
  return entry[1]();
};

const videoAnalyzeWithBlob = async (prompt: string, url: string): Promise<responseType> => {
  try {
    const blob = await getBlobForUrl(url);
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
          prompt, url,
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
