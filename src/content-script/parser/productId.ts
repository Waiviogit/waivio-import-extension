import { replaceInvisible } from '../helpers/commonHelper';
import { productIdType } from '../getProduct';

export const getProductIdAmazon = (): string => {
  const url = document.URL;
  const match = url.match(/\/dp\/([A-Z0-9]+)/);
  return match ? replaceInvisible(match[1]) : '';
};

export const getProductIdSephora = ():productIdType| undefined => {
  const url = document.URL;
  const match = url.match(/\/product\/(.*?)(\?skuId=\d+)/);
  if (!match) return;
  if (!match[2]) return;
  return {
    key: 'sephora.com',
    value: `${match[1]}${match[2]}`,
  };
};

export const getGroupIdSephora = ():string => {
  const url = document.URL;
  const match = url.match(/\/product\/(.*?)(\?skuId=\d+)/);
  if (!match) return '';
  if (!match[1]) return '';
  return match[1];
};
