import { replaceInvisible } from '../helpers/commonHelper';
import { productIdType } from '../getProduct';
import { classSelectorByRegex } from '../helpers/scrapingHelper';

const PRODUCT_ID_TYPES = ['ean', 'ean8', 'ean13', 'isbn10', 'isbn13', 'asin'];

export const getProductIdAmazon = (url = document.URL): string => {
  let match = url.match(/\/dp\/([A-Z0-9]+)/);
  if (!match) match = url.match(/\/product\/([A-Z0-9]+)/);

  return match ? replaceInvisible(match[1]) : '';
};

export const getProductIdSephora = (url = document.URL):productIdType| undefined => {
  const product = url.match(/P\d+/);
  const sku = url.match(/\?skuId=\d+/);
  if (!product) return;
  if (!sku) return;
  return {
    key: 'sephora.com',
    value: `${product[0]}${sku[0]}`,
  };
};

export const getGroupIdAliExpress = (url = document.URL):string|undefined => {
  const match = url.match(/\/item\/(\d+)\.html/);
  if (!match) return;

  return match[1];
};

export const getProductIdAliExpress = (groupId?: string):productIdType| undefined => {
  if (!groupId) return;

  let productIdPart = '';

  const selectedOptions = classSelectorByRegex('div', /sku-item--selected/);

  for (const selectedOption of selectedOptions) {
    // @ts-ignore
    const optionData = selectedOption.attributes?.['data-sku-col']?.value as string | undefined;
    if (optionData) productIdPart += `/${optionData}`;
  }
  if (!productIdPart) {
    return {
      key: 'aliexpress.com',
      value: groupId,
    };
  }

  return {
    key: 'aliexpress.com',
    value: `${groupId}${productIdPart}`,
  };
};

export const getProductIdSephoraSku = (url = document.URL):productIdType| undefined => {
  const sku = url.match(/skuId=(\d+)/);

  if (!sku) return;
  return {
    key: 'skuId',
    value: sku[1],
  };
};

export const getGroupIdSephora = (url = document.URL):string => {
  const product = url.match(/P\d+/);
  if (!product) return '';

  return product[0];
};

export const getProductIdWalmart = (url = document.URL):productIdType| undefined => {
  const match = url.match(/\/ip\/([^\/]+)\/(.\d+)/);
  if (!match) return;
  if (!match[2]) return;
  return {
    key: 'walmart',
    value: match[2],
  };
};

export const getGroupIdWalmart = (url = document.URL):string => {
  const match = url.match(/\/ip\/([^\/]+)\/(.\d+)/);
  if (!match) return '';
  if (!match[1]) return '';
  return match[1];
};

export const getPossibleIdsWalmart = ():productIdType[] => {
  const productIds = [];

  const elements = Array.from(
    document.querySelectorAll<HTMLElement>('div[data-testid="ui-collapse-panel"]'),
  ).map((el) => el.innerText.split('\n'));

  for (const nodes of elements) {
    for (const [i, node] of nodes.entries()) {
      const stringNoDashes = node.replace('-', '');

      if (PRODUCT_ID_TYPES.some((id) => stringNoDashes.toLowerCase().includes(id))) {
        if (stringNoDashes.includes(':')) {
          const values = stringNoDashes.split(':');
          const key = replaceInvisible(values[0].toLocaleLowerCase());
          const value = replaceInvisible(values[1]);

          if (!key || !value) continue;

          productIds.push({ key, value });
          continue;
        }
        const key = replaceInvisible(stringNoDashes.toLocaleLowerCase());
        const value = replaceInvisible(nodes[i + 1]);

        if (!key || !value) continue;
        productIds.push({ key, value });
      }
    }
  }

  return productIds;
};

export const getProductIdInstacart = (url = document.URL): productIdType | undefined => {
  const match = url.match(/\/products\/([^\/?]+)/);
  if (!match) return;
  return {
    key: 'instacart',
    value: match[1],
  };
};

export const getProductIdDefault = (value?:string, url = document.URL) => {
  const urlObject = new URL(url);
  const pathWithId = urlObject.pathname.split('/').at(-1) || '';
  const valueFromPath = ((pathWithId?.length || 0) > 8 ? pathWithId : document.URL).replace('%20', '_');

  return {
    key: urlObject.host.replace(/www\./, ''),
    value: value || valueFromPath,
  };
};
