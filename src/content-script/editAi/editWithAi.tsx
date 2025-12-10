import ReactDOM from 'react-dom/client';
import EditAiModal from '../components/editWithAiModal';
import { MODAL_IDS } from '../constants';
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
  getGalleryItemsAmazon,
} from '../parser';
import { extractGalleryRequest, extractIdFromUrlRequest } from '../helpers/objectHelper';
import Cookie = chrome.cookies.Cookie;
import { SOURCE_TYPES } from '../../common/constants';

export interface GetWaivioProductIds {
  user: string
  accessToken: string
  guestName: string
  auth: Cookie|undefined
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

export const getWaivioProductIds = async ({
  user, auth, accessToken, guestName,
}: GetWaivioProductIds) => {
  const url = document.URL.toLowerCase();

  if (url.includes('amazon')) {
    const asin = getProductIdAmazon();
    return asin ? [{ key: 'asin', value: asin }] : [getProductIdDefault()];
  }

  if (url.includes('sephora')) {
    const sephoraId = getProductIdSephora();
    return sephoraId ? [sephoraId] : [getProductIdDefault()];
  }

  if (url.includes('aliexpress')) {
    const aliId = getProductIdAliExpress();
    return aliId ? [aliId] : [getProductIdDefault()];
  }

  if (url.includes('walmart')) {
    const walmartId = getProductIdWalmart();
    const possibleIds = getPossibleIdsWalmart();
    return walmartId ? [walmartId, ...possibleIds] : possibleIds;
  }

  if (url.includes('instacart')) {
    const instacartId = getProductIdInstacart();
    return instacartId ? [instacartId] : [getProductIdDefault()];
  }

  const response = await extractIdFromUrlRequest({
    url: document.URL,
    user,
    accessToken,
    guestName,
    auth,
  });

  if ('error' in response) {
    return [getProductIdDefault()];
  }

  return [getProductIdDefault(response.result)];
};

const sourceToObjectType:Record<string, string> = {
  [SOURCE_TYPES.EDIT_AI_PRODUCT]: 'product',
  [SOURCE_TYPES.EDIT_AI_PERSON]: 'person',
  [SOURCE_TYPES.EDIT_AI_BUSINESS]: 'business',
};

export const editWithAi = async (source: string) => {
  const objectType = sourceToObjectType[source] ?? 'product';

  const rootElement = document.createElement('div');
  rootElement.id = MODAL_IDS.MAIN_MODAL_HOST;
  document.body.appendChild(rootElement);
  const rootModal = ReactDOM.createRoot(rootElement);

  rootModal.render(<EditAiModal objectType={objectType} />);
};
