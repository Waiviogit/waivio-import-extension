import { AVATAR_SELECTOR } from '../constants';

export const getAvatar = ():string => {
  const image = document.querySelector<HTMLImageElement>(AVATAR_SELECTOR.MAIN);

  return image?.src ?? '';
};
