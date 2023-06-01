import { NAME_SELECTOR } from '../constants';
import { replaceInvisible } from '../helpers/commonHelper';

export const productTitle = (): string => {
  const nameElement = document.querySelector<HTMLElement>(NAME_SELECTOR.MAIN);
  if (!nameElement) return '';

  const title = nameElement?.innerText ?? '';
  return replaceInvisible(title);
};
