import { AVATAR_SELECTOR, GALLERY_SELECTOR } from '../constants';
import { replaceInvisible } from '../helpers/commonHelper';

export const getAvatar = ():string => {
  const image = document.querySelector<HTMLImageElement>(AVATAR_SELECTOR.MAIN)
      || document.querySelector<HTMLImageElement>(AVATAR_SELECTOR.ALTERNATIVE_1)
      || document.querySelector<HTMLImageElement>(AVATAR_SELECTOR.ALTERNATIVE_2);

  if (image) return replaceInvisible(image?.src);
  const firstGalleryItem = document.querySelector<HTMLElement>('[data-csa-c-posy="1"]');
  if (!firstGalleryItem) return '';
  firstGalleryItem.click();
  const images = Array.from(document.querySelectorAll<HTMLImageElement>(GALLERY_SELECTOR.MAIN))
    .map((img) => img.src)
    .filter((el) => !!el);
  if (!images.length) return '';

  return replaceInvisible(images[images.length - 1]);
};
