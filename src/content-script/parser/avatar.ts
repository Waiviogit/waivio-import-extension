import { AVATAR_SELECTOR } from '../constants';
import { replaceInvisible } from '../helpers/commonHelper';

export const getAvatar = ():string => {
  const image = document.querySelector<HTMLImageElement>(AVATAR_SELECTOR.MAIN);
  if (!image) {
    const alternative1 = document.querySelector<HTMLImageElement>(AVATAR_SELECTOR.ALTERNATIVE_1);
    if (!alternative1) {
      const alternative2 = document.querySelector<HTMLImageElement>(AVATAR_SELECTOR.ALTERNATIVE_2);
      return replaceInvisible(alternative2?.src);
    }
    return replaceInvisible(alternative1?.src);
  }

  return replaceInvisible(image?.src);
};
