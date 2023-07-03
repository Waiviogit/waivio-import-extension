import { replaceInvisible } from '../helpers/commonHelper';

export const getAvatar = () => {
  const gallery = Array.from(document.querySelectorAll<HTMLElement>('li.imageThumbnail'));
  for (const item of gallery) {
    item.click();
  }
  const avatar = document.querySelector<HTMLImageElement>('li[data-csa-c-posy="1"] .imgTagWrapper img');
  return replaceInvisible(avatar?.src) ?? '';
};
