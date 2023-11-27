import { replaceInvisible } from '../helpers/commonHelper';
import { productIdType } from '../getProduct';

const PRODUCT_ID_TYPES = ['ean', 'ean8', 'ean13', 'isbn10', 'isbn13', 'asin'];

export const getProductIdAmazon = (): string => {
  const url = document.URL;
  let match = url.match(/\/dp\/([A-Z0-9]+)/);
  if (!match) match = url.match(/\/product\/([A-Z0-9]+)/);

  return match ? replaceInvisible(match[1]) : '';
};

export const getProductIdSephora = ():productIdType| undefined => {
  const url = document.URL;

  const product = url.match(/P\d+/);
  const sku = url.match(/\?skuId=\d+/);
  if (!product) return;
  if (!sku) return;
  return {
    key: 'sephora.com',
    value: `${product[0]}${sku[0]}`,
  };
};

export const getProductIdSephoraSku = ():productIdType| undefined => {
  const url = document.URL;

  const sku = url.match(/skuId=(\d+)/);

  if (!sku) return;
  return {
    key: 'skuId',
    value: sku[1],
  };
};

export const getGroupIdSephora = ():string => {
  const url = document.URL;
  const product = url.match(/P\d+/);
  if (!product) return '';

  return product[0];
};

export const getProductIdWalmart = ():productIdType| undefined => {
  const url = document.URL;
  const match = url.match(/\/ip\/([^\/]+)\/(.\d+)/);
  if (!match) return;
  if (!match[2]) return;
  return {
    key: 'walmart',
    value: match[2],
  };
};

export const getGroupIdWalmart = ():string => {
  const url = document.URL;
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
      console.log(stringNoDashes);
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
