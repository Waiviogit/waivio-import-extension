import { NAME_SELECTOR } from '../constants';

export const productTitle = (): string => {
  const nameElement = document.querySelector<HTMLElement>(NAME_SELECTOR.MAIN);
  if (!nameElement) return '';

  const title = nameElement?.innerText ?? '';
  return title.trim();
};
