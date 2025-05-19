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
import { generateObjectFromImage } from '../helpers/objectHelper';
import { getWaivioUserInfo } from '../helpers/userHelper';
import { makeBlobFromHtmlPage } from '../objectLink/createLink';
import { loadImageBase64 } from '../helpers/downloadWaivioHelper';

const getAvatarAndGallery = () => {
  const url = document.URL.toLowerCase();

  if (url.includes('amazon')) {
    const avatar = getAvatarAmazon();
    return {
      primaryImageURLs: avatar ? [avatar] : [],
      imageURLs: [],
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

  return {
    primaryImageURLs: [],
    imageURLs: [],
  };
};

const getWaivioProductIds = () => {
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

  return [getProductIdDefault()];
};

export const editWithAi = async () => {
  const { primaryImageURLs, imageURLs } = getAvatarAndGallery();
  const waivioProductIds = getWaivioProductIds();
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
  console.log(imageUrl);

  const response = await generateObjectFromImage({
    accessToken, guestName, auth, user: userName, url: imageUrl,
  });

  if ('error' in response) {
    alert(response.error?.message);
    return;
  }

  const product = {
    ...response.result,
    primaryImageURLs,
    imageURLs,
    waivio_product_ids: waivioProductIds,
  };

  const rootElement = document.createElement('div');
  rootElement.id = 'react-chrome-modal';
  document.body.appendChild(rootElement);
  const rootModal = ReactDOM.createRoot(rootElement);

  rootModal.render(<EditAiModal
      product={product}
  />);
};
