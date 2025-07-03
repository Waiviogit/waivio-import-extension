import { EXTERNAL_URL } from '../constants';
import { getInstagramDownloadUrl } from '../downloaders/instagramDownloader';

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

export const videoAnalysesByLink = async (prompt: string, url: string): Promise<responseType> => {
  try {
    if (url.includes('instagram.com')) {
      const downloadUrl = await getInstagramDownloadUrl();
      if (!downloadUrl) throw new Error('Cant get instagram download url');
      const blob = await fetch(downloadUrl).then((res) => res.blob());
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
