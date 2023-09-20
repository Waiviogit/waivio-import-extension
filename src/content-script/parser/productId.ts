import { replaceInvisible } from '../helpers/commonHelper';
import { productIdType } from '../getProduct';

export const getProductIdAmazon = (): string => {
  const url = document.URL;
  const match = url.match(/\/dp\/([A-Z0-9]+)/);
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
