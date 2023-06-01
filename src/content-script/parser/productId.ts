import { replaceInvisible } from '../helpers/commonHelper';

export const getProductId = (): string => {
  const url = document.URL;
  const match = url.match(/\/dp\/([A-Z0-9]+)/);
  return match ? replaceInvisible(match[1]) : '';
};
