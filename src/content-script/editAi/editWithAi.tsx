import ReactDOM from 'react-dom/client';
import EditAiModal from '../components/editWithAiModal';
import {
  getAvatarAmazon,
  getAvatarSephora,
  getAvatarAliexpress,
  getAvatarWalmart,
  getAvatarInstacart,
} from '../parser/avatar';
import {
  getProductIdAmazon,
  getProductIdSephora,
  getProductIdAliExpress,
  getProductIdWalmart,
  getProductIdInstacart,
  getPossibleIdsWalmart,
  getProductIdDefault,
} from '../parser/productId';
import { extractGalleryRequest, extractIdFromUrlRequest, generateObjectFromImage } from '../helpers/objectHelper';
import { getWaivioUserInfo } from '../helpers/userHelper';
import { makeBlobFromHtmlPage } from '../objectLink/createLink';
import { loadImageBase64 } from '../helpers/downloadWaivioHelper';
import Cookie = chrome.cookies.Cookie;
import { getGalleryItemsAmazon } from '../parser';

interface GetWaivioProductIds {
  user: string
  accessToken: string
  guestName: string
  auth: Cookie|undefined
}

interface GetWaivioAvatar {
  user: string
  accessToken: string
  guestName: string
  galleryLength: number
  auth: Cookie|undefined
}

const getAvatarAndGallery = async ({
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

const getWaivioProductIds = async ({
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

export const editWithAi = async () => {
  const userInfo = await getWaivioUserInfo();
  if (!userInfo) return;
  const {
    accessToken, guestName, userName, auth,
  } = userInfo;

  const imageBlob = await makeBlobFromHtmlPage(false);
  if (!imageBlob) {
    alert('Can\'t make screenshot of this page');
    return;
  }
  const { result: imageUrl } = await loadImageBase64(imageBlob);
  if (!imageUrl) {
    alert('Can\'t save screenshot of this page');
    return;
  }

  const response = await generateObjectFromImage({
    accessToken, guestName, auth, user: userName, url: imageUrl,
  });

  if ('error' in response) {
    alert(response.error?.message || 'Failed to generate object from image');
    return;
  }

  // Ensure response.result exists and has required properties
  if (!response.result) {
    alert('No result received from AI service');
    return;
  }

  const galleryLength = (response.result?.galleryLength || 0) > 2
    ? (response.result?.galleryLength || 0) - 1
    : response.result?.galleryLength || 1;

  try {
    const [waivioProductIds, { primaryImageURLs, imageURLs }] = await Promise.all([
      getWaivioProductIds({
        user: userName,
        auth,
        accessToken,
        guestName,
      }),
      getAvatarAndGallery({
        user: userName,
        auth,
        accessToken,
        guestName,
        galleryLength,
      }),
    ]);

    const product = {
      ...response.result,
      primaryImageURLs: primaryImageURLs || [],
      imageURLs: imageURLs || [],
      waivio_product_ids: waivioProductIds || [],
      websites: [document.URL],
    };

    const rootElement = document.createElement('div');
    rootElement.id = 'react-chrome-modal';
    document.body.appendChild(rootElement);
    const rootModal = ReactDOM.createRoot(rootElement);

    rootModal.render(<EditAiModal
        product={product}
    />);
  } catch (error) {
    console.error('Error setting up AI modal:', error);
    alert('Failed to setup AI editing modal');
  }
};
