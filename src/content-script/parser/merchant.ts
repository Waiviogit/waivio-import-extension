import { classSelectorByRegex } from '../helpers/scrapingHelper';
import { replaceInvisible } from '../helpers/commonHelper';

export const getMerchantsAliExpress = (): string[] => {
  const [name] = classSelectorByRegex('span', /store-detail--storeName/);
  if (!name) return [];

  return [replaceInvisible(name.innerText)];
};
