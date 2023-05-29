import { GALLERY_SELECTOR } from '../constants';

export const getGalleryItems = (): string[] => {
  const altImages = Array.from(
    document.querySelectorAll<HTMLImageElement>(GALLERY_SELECTOR.ALT_IMAGES),
  );
  for (const altImage of altImages) {
    altImage.click();
  }
  const images = Array.from(document.querySelectorAll<HTMLImageElement>(GALLERY_SELECTOR.MAIN))
    .map((img) => img.src)
    .filter((el) => !!el)
    .slice(1);

  return images;
};
