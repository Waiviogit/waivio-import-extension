import { NAME_SELECTOR } from '../constants';
import { replaceInvisible } from '../helpers/commonHelper';

export const productTitleAmazon = (): string => {
  const nameElement = document.querySelector<HTMLElement>(NAME_SELECTOR.MAIN);
  if (!nameElement) return '';

  const title = nameElement?.innerText ?? '';
  return replaceInvisible(title);
};

export const productTitleSephora = (): string => {
  const nameElement = document.querySelector<HTMLElement>(NAME_SELECTOR.SEPHORA);
  if (!nameElement) return '';

  const title = nameElement?.innerText ?? '';
  return replaceInvisible(title);
};

export const productTitleAliExpress = (): string => {
  const nameElement = document.querySelector<HTMLElement>(NAME_SELECTOR.ALIEXPRESS);
  if (!nameElement) return '';

  const title = nameElement?.innerText ?? '';
  return replaceInvisible(title);
};

export const productTitleWalmart = (): string => {
  const nameElement = document.querySelector<HTMLElement>(NAME_SELECTOR.WALMART);
  if (!nameElement) return '';
  const title = nameElement?.innerText ?? '';
  return replaceInvisible(title);
};

export const productTitleInstacart = (): string => {
  const nameElement = document.querySelector<HTMLElement>('h1');
  if (!nameElement) return '';
  const title = nameElement?.innerText ?? '';
  return replaceInvisible(title);
};
