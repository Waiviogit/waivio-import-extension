import ReactDOM from 'react-dom/client';
import EditAiModal from '../components/editWithAiModal';
import { MODAL_IDS } from '../constants';
import { makeBlobFromHtmlPage } from '../objectLink/createLink';
import {
  getAvatarAmazon,
  getAvatarSephora,
  getAvatarAliexpress,
  getAvatarWalmart,
  getAvatarInstacart,
  getProductIdAmazon,
  getProductIdSephora,
  getProductIdAliExpress,
  getProductIdWalmart,
  getProductIdInstacart,
  getPossibleIdsWalmart,
  getProductIdDefault,
  getGalleryItemsAmazon, getAvatarInstagram,
} from '../parser';
import { extractGalleryRequest, extractIdFromUrlRequest } from '../helpers/objectHelper';
import Cookie = chrome.cookies.Cookie;
import { SOURCE_TYPES } from '../../common/constants';

export interface GetWaivioProductIds {
  user: string
  accessToken: string
  guestName: string
  auth: Cookie|undefined
  linksForProductId: string[]
}

export interface GetWaivioAvatar {
  user: string
  accessToken: string
  guestName: string
  galleryLength: number
  auth: Cookie|undefined
}

export interface UserInfo {
  accessToken: string
  guestName: string
  userName: string
  auth: Cookie|undefined
}

export const getAvatarAndGallery = async ({
  user, accessToken, guestName, auth, galleryLength,
}: GetWaivioAvatar) => {
  const url = document.URL.toLowerCase();

  if (url.includes('instagram.com') || url.includes('tiktok.com') || url.includes('youtube.com')) {
    const { avatar, gallery } = getAvatarInstagram();
    return {
      primaryImageURLs: avatar ? [avatar] : [],
      imageURLs: gallery,
    };
  }

  if (url.includes('amazon')) {
    const avatar = getAvatarAmazon();
    return {
      primaryImageURLs: avatar ? [avatar] : [],
      imageURLs: getGalleryItemsAmazon(),
    };
  }

  if (url.includes('sephora')) {
    const { avatar, gallery } = getAvatarSephora();
    return {
      primaryImageURLs: avatar ? [avatar] : [],
      imageURLs: gallery,
    };
  }

  if (url.includes('aliexpress')) {
    const { avatar, gallery } = getAvatarAliexpress();
    return {
      primaryImageURLs: avatar ? [avatar] : [],
      imageURLs: gallery,
    };
  }

  if (url.includes('walmart')) {
    const { avatar, gallery } = getAvatarWalmart();
    return {
      primaryImageURLs: avatar ? [avatar] : [],
      imageURLs: gallery,
    };
  }

  if (url.includes('instacart')) {
    const { avatar, gallery } = getAvatarInstacart();
    return {
      primaryImageURLs: avatar ? [avatar] : [],
      imageURLs: gallery,
    };
  }

  const images = Array.from(document.querySelectorAll<HTMLImageElement>('img'));
  const extractImgData = (img:HTMLImageElement) => {
    const attrs: Record<string, string> = {};
    if (img.className) attrs.class = img.className;
    Array.from(img.attributes).forEach((attr) => {
      if (attr.name !== 'class') attrs[attr.name] = attr.value;
    });
    return attrs;
  };

  const imageList = images.map(extractImgData);
  const MAX_SIZE = 40 * 1024; // 40KB in bytes
  let imageData = JSON.stringify(imageList, null, 2);

  while (imageData.length > MAX_SIZE && imageList.length > 1) {
    imageList.pop();
    imageData = JSON.stringify(imageList, null, 2);
  }

  const response = await extractGalleryRequest({
    user, galleryLength, imageData, auth, accessToken, guestName,
  });

  if ('error' in response) {
    return {
      primaryImageURLs: [],
      imageURLs: [],
    };
  }

  return {
    primaryImageURLs: [response.result.avatar],
    imageURLs: response.result.gallery,
  };
};

type DistriatorType = {
  name: string;
  address?: string;
  websites?: string[];
  emails?: string[];
  primaryImageURLs?: string[];
  imageURLs?: string[];
  latitude?: number;
  longitude?: number;
  phone?: string;
  workingHours?: string;
  fieldDescription?: string;
}

type LatitudeLongitudeType = {
  latitude: number;
  longitude: number;
}

// Inject external page script once
let pageScriptInjected = false;
const injectPageScript = () => {
  if (pageScriptInjected) return;
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('pageScript.js');
  script.onload = () => script.remove();
  document.documentElement.appendChild(script);
  pageScriptInjected = true;
};

const getLocationData = async (
  clickableLocation: HTMLElement | null,
): Promise<LatitudeLongitudeType | null> => {
  if (!clickableLocation) {
    console.log('no clickableLocation');
    return null;
  }

  // Inject the page script if not already done
  injectPageScript();

  // Generate a unique ID for this element
  const uniqueId = `location-data-${Date.now()}`;
  clickableLocation.setAttribute('data-location-id', uniqueId);

  // Listen for response
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      // eslint-disable-next-line no-use-before-define
      window.removeEventListener('message', handler);
      clickableLocation.removeAttribute('data-location-id');
      console.log('no latitude and longitude - timeout');
      resolve(null);
    }, 2000);

    const handler = (event: MessageEvent) => {
      if (event.data.type === 'LOCATION_DATA_RESULT' && event.data.id === uniqueId) {
        clearTimeout(timeout);
        window.removeEventListener('message', handler);
        clickableLocation.removeAttribute('data-location-id');
        resolve(event.data.data);
      }
    };

    window.addEventListener('message', handler);

    // Small delay to ensure script is loaded, then request location data
    setTimeout(() => {
      window.postMessage({ type: 'GET_LOCATION_DATA', id: uniqueId }, '*');
    }, 50);
  });
};

function findNextPAfter(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el;

  while (node) {
    // 1) try next siblings on the same level
    let sibling = node.nextElementSibling as HTMLElement | null;
    while (sibling) {
      // found a <p>
      if (sibling.tagName === 'P') return sibling;

      // if it's a wrapper, look inside it for a <p>
      const pInside = sibling.querySelector('p');
      if (pInside) return pInside as HTMLElement;

      sibling = sibling.nextElementSibling as HTMLElement | null;
    }

    // 2) go up and continue searching siblings of the parent
    node = node.parentElement;
  }

  return null;
}

export const getDistriatorObject = async ():Promise<DistriatorType> => {
  const result: DistriatorType = {
    name: document.querySelector('h1')?.textContent || '',
  };

  const headers = document.querySelectorAll<HTMLElement>('h2');

  const headers2 = Array.from(document.querySelectorAll('h2'));
  const clickableLocation = headers2.find((el) => el?.textContent?.trim() === 'Location')?.nextSibling as HTMLElement | null;

  const latLon = await getLocationData(clickableLocation);
  if (latLon) {
    result.latitude = latLon.latitude;
    result.longitude = latLon.longitude;
  }

  for (const h2 of headers) {
    if (!h2.textContent) continue;
    const title = h2.textContent.trim();

    // Usually content is placed right after h2
    const container = h2.nextElementSibling as HTMLElement;
    if (!container) continue;

    if (title === 'Contact') {
      const spans = Array.from(container.querySelectorAll('span'));
      for (const span of spans) {
        const content = span.innerText.trim();
        if (!content) continue;

        // Email check
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content)) {
          result.emails = [content];
          continue;
        }

        // URL check
        try {
          const _ = new URL(content);
          if (_) result.websites = [content];
          continue;
        } catch {
          // not a valid URL
        }

        // Phone check (only digits and +)
        if (/^[\d+]+$/.test(content)) {
          result.phone = content;
        }
      }
    }

    if (title === 'Location') {
      const paragraphs = Array.from(container.querySelectorAll('p'));
      result.address = paragraphs.map((p) => p.textContent?.trim()).filter(Boolean).join(', ').replace(/\s{2,}/g, ' ');
    }

    if (title === 'Business Photo Gallery') {
      const images = Array.from(container.querySelectorAll('img')).map((img) => img.src)
        .filter(Boolean);

      const [avatar, ...gallery] = images;
      if (!avatar) continue;
      result.primaryImageURLs = [avatar];
      if (gallery.length) result.imageURLs = gallery;
    }

    if (title === 'Notes') {
      const paragraphs = Array.from(h2.parentElement?.querySelectorAll('h3') || []);
      paragraphs.forEach((h3) => {
        const h3title = (h3.textContent || '').trim();
        const p = findNextPAfter(h3);
        const pText = p?.textContent;
        if (!pText) return;

        if (h3title === 'Business Notes') {
          result.fieldDescription = pText.trim();
        }

        if (h3title === 'Work Time') {
          result.workingHours = pText.trim();
        }
      });
    }
  }

  return result;
};

export const getWaivioProductIds = async ({
  user, auth, accessToken, guestName, linksForProductId,
}: GetWaivioProductIds) => {
  const ids = [];
  for (const url of linksForProductId) {
    if (url.includes('amazon')) {
      const asin = getProductIdAmazon(url);
      ids.push(asin ? { key: 'asin', value: asin } : getProductIdDefault('', url));
      continue;
    }

    if (url.includes('sephora')) {
      const sephoraId = getProductIdSephora(url);
      ids.push(sephoraId || getProductIdDefault('', url));
      continue;
    }

    if (url.includes('aliexpress')) {
      const aliId = getProductIdAliExpress(url);
      ids.push(aliId || getProductIdDefault('', url));
      continue;
    }

    if (url.includes('walmart')) {
      const walmartId = getProductIdWalmart(url);
      const possibleIds = getPossibleIdsWalmart();
      if (walmartId) {
        ids.push(...[walmartId, ...possibleIds]);
        continue;
      }
      ids.push(...possibleIds);
      continue;
    }

    if (url.includes('instacart')) {
      const instacartId = getProductIdInstacart(url);
      ids.push(instacartId || getProductIdDefault('', url));
      continue;
    }

    const response = await extractIdFromUrlRequest({
      url: url.replace('%20', '_'),
      user,
      accessToken,
      guestName,
      auth,
    });

    if ('error' in response) {
      ids.push(getProductIdDefault('', url));
      continue;
    }
    ids.push(getProductIdDefault(response.result, url));
  }

  return ids;
};

export const getTextInfoFromSite = () => {
  const url = document.URL;
  if (url.includes('youtube')) {
    let result = '';

    const title = document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute('content') || '';
    const description = document
      .querySelector('meta[property="og:description"]')
      ?.getAttribute('content') || '';

    if (title) result += `page title: ${title}`;
    if (description) result += ` page description: ${description}`;

    return result;
  }

  return '';
};

const sourceToObjectType:Record<string, string> = {
  [SOURCE_TYPES.EDIT_AI_PRODUCT]: 'product',
  [SOURCE_TYPES.EDIT_AI_PERSON]: 'person',
  [SOURCE_TYPES.EDIT_AI_BUSINESS]: 'business',
};

export const editWithAi = async (source: string) => {
  const objectType = sourceToObjectType[source] ?? 'product';

  // Remove any existing modal to avoid stale data
  const existingModal = document.getElementById(MODAL_IDS.MAIN_MODAL_HOST);
  if (existingModal) {
    document.body.removeChild(existingModal);
  }

  // Take screenshot before rendering modal to avoid interference
  const imageBlob = await makeBlobFromHtmlPage(false);

  const rootElement = document.createElement('div');
  rootElement.id = MODAL_IDS.MAIN_MODAL_HOST;
  document.body.appendChild(rootElement);
  const rootModal = ReactDOM.createRoot(rootElement);

  rootModal.render(<EditAiModal objectType={objectType} imageBlob={imageBlob} />);
};
