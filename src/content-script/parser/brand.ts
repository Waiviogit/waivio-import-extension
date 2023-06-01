import { BRAND_SELECTOR } from '../constants';
import { replaceInvisible } from '../helpers/commonHelper';

export const getBrand = (): string => {
  const brandElements = Array.from(document.querySelectorAll<HTMLElement>(BRAND_SELECTOR.MAIN));
  const innerHtml = [];

  for (const innerHtmlElement of brandElements) {
    const text = innerHtmlElement.innerHTML;
    if (text) innerHtml.push(text.trim());
  }
  return innerHtml.length === 2 ? replaceInvisible(innerHtml[1]) : '';
};
