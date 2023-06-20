import { BRAND_SELECTOR } from '../constants';
import { make2dArray, replaceInvisible } from '../helpers/commonHelper';

const brandV2 = ():string => {
  const tableElements = Array
    .from(document
      .querySelectorAll<HTMLElement>(BRAND_SELECTOR.V2))
    .map((el) => (el?.innerText ?? '').trim());
  if (!tableElements.length) return '';
  const rows = make2dArray(tableElements);

  for (const row of rows) {
    if (row[0].toLowerCase().includes('brand')) return row[1];
  }
  return '';
};

export const getBrand = (): string => {
  const brandElements = Array.from(document.querySelectorAll<HTMLElement>(BRAND_SELECTOR.MAIN));
  const innerHtml:string[] = [];

  for (const innerHtmlElement of brandElements) {
    const text = innerHtmlElement.innerHTML;
    if (text) innerHtml.push(text.trim());
  }
  const result = innerHtml.length === 2 ? replaceInvisible(innerHtml[1]) : '';
  if (!result) {
    return brandV2();
  }
  return result;
};
