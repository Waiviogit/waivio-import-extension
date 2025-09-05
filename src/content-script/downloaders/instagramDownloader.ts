import { getIdFromUrl } from '../helpers/objectHelper';

// https://github.com/HOAIAN2/Instagram-Downloader

const IG_BASE_URL = `${window.location.origin}/`;
const IG_SHORTCODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

interface MediaItem {
    url: string;
    isVideo: boolean;
    id: string;
}
interface Data {
    date: number;
    user: {
        username: string;
    };
    media: MediaItem[];
}

const convertToPostId = (shortcode: string): string => {
  let id = BigInt(0);
  for (let i = 0; i < shortcode.length; i++) {
    const char = shortcode[i];
    id = (id * BigInt(64)) + BigInt(IG_SHORTCODE_ALPHABET.indexOf(char));
  }
  return id.toString(10);
};

const getCookieValue = (name: string): string | undefined => document.cookie.split('; ')
  .find((row) => row.startsWith(`${name}=`))
  ?.split('=')[1];

type FetchOptions = RequestInit & {
    headers: Record<string, string>;
};

const getFetchOptions = (): FetchOptions => ({
  headers: {
    'x-csrftoken': getCookieValue('csrftoken') || '',
    'x-ig-app-id': '936619743392459',
    'x-ig-www-claim': sessionStorage.getItem('www-claim-v2') || '',
    'x-requested-with': 'XMLHttpRequest',
  },
  referrer: window.location.href,
  referrerPolicy: 'strict-origin-when-cross-origin',
  method: 'GET',
  mode: 'cors',
  credentials: 'include',
});

const getPostIdFromApi = async (shortcode: string): Promise<string | null> => {
  const apiURL = new URL('/graphql/query/', IG_BASE_URL);
  const fetchOptions = getFetchOptions();
  fetchOptions.method = 'POST';
  (fetchOptions.headers as Record<string, string>)['content-type'] = 'application/x-www-form-urlencoded';
  (fetchOptions.headers as Record<string, string>)['x-fb-friendly-name'] = 'PolarisPostActionLoadPostQueryQuery';
  (fetchOptions as any).body = new URLSearchParams({
    fb_api_caller_class: 'RelayModern',
    fb_api_req_friendly_name: 'PolarisPostActionLoadPostQueryQuery',
    doc_id: '8845758582119845',
    variables: JSON.stringify({
      shortcode,
    }),
  }).toString();
  try {
    const respone = await fetch(apiURL.href, fetchOptions);
    const json = await respone.json();
    return json.data.xdt_shortcode_media.id;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getPostPhotos = async (shortcode: string): Promise<any | null> => {
  let postId = convertToPostId(shortcode);
  let apiURL = new URL(`/api/v1/media/${postId}/info/`, IG_BASE_URL);
  try {
    let respone = await fetch(apiURL.href, getFetchOptions());
    if (respone.status === 400) {
      const fetchedPostId = await getPostIdFromApi(shortcode);
      if (!fetchedPostId) throw new Error('Network bug');
      postId = fetchedPostId;
      apiURL = new URL(`/api/v1/media/${postId}/info/`, IG_BASE_URL);
      respone = await fetch(apiURL.href, getFetchOptions());
    }
    const json = await respone.json();
    return json.items[0];
  } catch (error) {
    console.log(error);
    return null;
  }
};

const extractMediaData = (item: any): MediaItem => {
  const isVideo = item.media_type !== 1;
  const media: MediaItem = {
    url: isVideo ? item.video_versions[0].url : item.image_versions2.candidates[0].url,
    isVideo,
    id: String(item.pk),
  };
  return media;
};

export const getInstagramDownloadUrl = async (): Promise<string> => {
  const instagramId = getIdFromUrl(document.URL);

  const json = await getPostPhotos(instagramId);
  const data: Data = {
    date: json.taken_at,
    user: {
      username: json.user.username,
    },
    media: [],
  };

  if (json.carousel_media) {
    data.media = json.carousel_media.map((item: any) => extractMediaData(item));
  } else data.media.push(extractMediaData(json));
  return data.media[0].url || '';
};

export const getInstagramThumbnail = async (): Promise<string> => {
  const instagramId = getIdFromUrl(document.URL);
  const json = await getPostPhotos(instagramId);
  return json?.image_versions2?.candidates?.[0]?.url as string;
};

export const getInstagramDataBlob = async (): Promise<string> => {
  const downloadUrl = await getInstagramDownloadUrl();
  if (!downloadUrl) throw new Error('Cant get instagram download url');
  return downloadUrl;
};
