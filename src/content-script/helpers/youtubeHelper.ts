const YOUTUBE_URL_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

const USER_AGENT_STRING = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)';

const CAPTION_XML_REGEX = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;

class YouTubeCaptionError extends Error {
  constructor(message: string) {
    super(`[YouTubeCaption] 🚨 ${message}`);
  }
}

const errorTypes = {
  RequestLimitExceeded: () => new YouTubeCaptionError(
    'YouTube is receiving too many requests from this IP and requires captcha resolution.',
  ),
  VideoNotAvailable: (videoId: string) => new YouTubeCaptionError(`The video is no longer available (${videoId}).`),
  CaptionsDisabled: (videoId: string) => new YouTubeCaptionError(`Captions are disabled for this video (${videoId}).`),
  NoCaptionsAvailable: (videoId: string) => new YouTubeCaptionError(`No captions are available for this video (${videoId}).`),
  // eslint-disable-next-line max-len
  LanguageUnavailable: (lang: string, availableLangs: string[], videoId: string) => new YouTubeCaptionError(
    `No captions available in ${lang} for this video (${videoId}). Available languages: ${availableLangs.join(
      ', ',
    )}.`,
  ),
};

export interface CaptionConfig {
    lang?: string;
    plainText?: true;
}

export interface CaptionResponse {
    text: string;
    duration: number;
    offset: number;
    lang?: string;
}

type authorLinkType = {
    author: string
    linkToChannel: string
}

type titleBodyType = {
  title: string
  body: string
}

export type captionType = {
  captions:string
  author: string
  linkToChannel: string
}

const getChanelURL = (content: string): authorLinkType => {
  try {
    const splitContent = content.split('"itemListElement":')[1];

    const cutTo = splitContent.indexOf(']');
    const stringifiedJson = splitContent.slice(0, cutTo + 1);

    const parsed = JSON.parse(stringifiedJson);
    const result = parsed?.[0]?.item;
    console.log(JSON.stringify(result));
    return {
      author: result?.name ?? '',
      linkToChannel: result?.['@id'] ?? '',
    };
  } catch (error) {
    return {
      author: '',
      linkToChannel: '',
    };
  }
};

export const extractVideoId = (url: string): string => {
  const regex = /(?:watch\?v=|\/shorts\/)([^&/]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return '';
};

export const getTitleAndBody = (content:string): titleBodyType => {
  const index = content.indexOf('"title":{');
  const firstSlice = content.slice(index);

  const cutTo = firstSlice.indexOf(',"lengthSeconds"');
  const stringifiedJson = firstSlice.slice(0, cutTo);

  const parsed = JSON.parse(`{${stringifiedJson}}`);
  return {
    title: parsed?.title?.simpleText ?? '',
    body: parsed?.description?.simpleText ?? '',
  };
};

/**
 * Retrieve captions for a specified YouTube video.
 * @param {string} videoId - The video URL or ID.
 * @param {CaptionConfig} [options] - Language and formatting configuration options.
 * @returns {Promise<CaptionResponse[] | string>} Promise resolving to caption data or plain text.
 */
async function getVideoCaptions(
  videoId: string,
  options?: CaptionConfig,
): Promise<captionType> {
  // eslint-disable-next-line no-use-before-define
  const id = extractVideoIdentifier(videoId);
  // eslint-disable-next-line no-use-before-define
  const videoPageContent = await fetchVideoContent(id, options?.lang);

  const authorWithLink = getChanelURL(videoPageContent);

  // eslint-disable-next-line no-use-before-define
  const captionsData = extractCaptionsFromContent(videoPageContent);
  if (!captionsData) {
    throw errorTypes.CaptionsDisabled(videoId);
  }

  // eslint-disable-next-line no-use-before-define
  checkCaptionsValidity(captionsData, videoId, options?.lang);
  // eslint-disable-next-line no-use-before-define
  const captionLink = getCaptionURL(captionsData, options?.lang);

  // eslint-disable-next-line no-use-before-define
  const captionData = await fetchCaptionData(captionLink, options?.lang);
  // eslint-disable-next-line no-use-before-define
  const captions = parseCaptionData(captionData, captionsData, options);

  return {
    captions,
    ...authorWithLink,
  };
}

export async function fetchVideoContent(videoId: string, lang?: string): Promise<string> {
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      ...(lang && { 'Accept-Language': lang }),
      'User-Agent': USER_AGENT_STRING,
    },
  });
  if (!response.ok) throw errorTypes.VideoNotAvailable(videoId);
  return response.text();
}

function extractCaptionsFromContent(content: string) {
  const splitContent = content.split('"captions":');
  if (splitContent.length <= 1) return null;

  try {
    return JSON.parse(splitContent[1].split(',"videoDetails')[0].replace('\n', '')).playerCaptionsTracklistRenderer;
  } catch {
    return null;
  }
}

function checkCaptionsValidity(captions: any, videoId: string, lang?: string) {
  if (!('captionTracks' in captions)) {
    throw errorTypes.NoCaptionsAvailable(videoId);
  }
  if (
    lang
    // eslint-disable-next-line max-len
        && !captions.captionTracks.some((track: { languageCode: string }) => track.languageCode === lang)
  ) {
    throw errorTypes.LanguageUnavailable(
      lang,
      captions.captionTracks.map((track: { languageCode: string }) => track.languageCode),
      videoId,
    );
  }
}

function getCaptionURL(captions: any, lang?: string) {
  const track = lang
  // eslint-disable-next-line no-shadow
    ? captions.captionTracks.find((track: { languageCode: string }) => track.languageCode === lang)
    : captions.captionTracks[0];
  return track.baseUrl;
}

async function fetchCaptionData(captionURL: string, lang?: string): Promise<string> {
  const response = await fetch(captionURL, {
    headers: {
      ...(lang && { 'Accept-Language': lang }),
      'User-Agent': USER_AGENT_STRING,
    },
  });
  if (!response.ok) throw errorTypes.NoCaptionsAvailable('Video ID');
  return response.text();
}

/**
 * Parse the caption data.
 * @param {string} captionContent - Raw caption data.
 * @param {any} captions - Caption metadata.
 * @param {CaptionConfig} options - Configuration options.
 * @returns {CaptionResponse[] | string} Array of captions or plain text.
 */
function parseCaptionData(
  captionContent: string,
  captions: any,
  options?: CaptionConfig,
): string {
  const matches = [...captionContent.matchAll(CAPTION_XML_REGEX)];

  const parsedCaptions = matches.map((match) => ({
    text: match[3],
    duration: parseFloat(match[2]),
    offset: parseFloat(match[1]),
    lang: options?.lang ?? captions.captionTracks[0].languageCode,
  }));

  return parsedCaptions.map((caption) => caption.text).join(' ');
}

/**
 * Extract video identifier from a URL or string.
 * @param {string} videoId - The video URL or ID.
 * @returns {string} Video identifier.
 */
function extractVideoIdentifier(videoId: string): string {
  if (videoId.length === 11) return videoId;
  const match = videoId.match(YOUTUBE_URL_REGEX);
  if (match) return match[1];
  throw new YouTubeCaptionError('Unable to retrieve YouTube video ID.');
}

export default getVideoCaptions;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = getVideoCaptions;
}
