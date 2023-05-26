import { GALLERY_SELECTOR } from '../constants';

export const getGalleryItems = (): string[] => {
  const urls = Array.from(document.querySelectorAll<HTMLImageElement>(GALLERY_SELECTOR.MAIN))
    .map((img) => img.src)
    .filter((el) => !!el);
  return urls;
};
