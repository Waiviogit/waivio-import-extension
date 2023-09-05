const galleryItemsAlt = (): string[] => {
  const scripts = Array.from(document.querySelectorAll<HTMLElement>('#booksImageBlock_feature_div script'))
    .map((el) => el?.innerText);
  const script = scripts.find((el) => el.includes('imageGalleryData'));
  if (!script) return [];
  const match = script.match(/'imageGalleryData'\s*:\s*(\[.*?\}])/s);
  if (!match) return [];
  try {
    const json = JSON.parse(match[1]);
    const images = json.map((el: {mainUrl?: string}) => el?.mainUrl).filter((el: string) => !!el);
    return images.slice(1);
  } catch (error) {
    return [];
  }
};

export const getGalleryItems = (): string[] => {
  const altImages = Array.from(
    document.querySelectorAll<HTMLElement>('#altImages li.a-spacing-small.item.imageThumbnail.a-declarative'),
  );
  for (const altImage of altImages) {
    altImage.click();
  }
  const images = Array.from(document.querySelectorAll<HTMLImageElement>('li:not([data-csa-c-posy="1"]) .imgTagWrapper img'))
    .map((img) => img.src)
    .filter((el) => !!el)
    .filter((el, index, self) => index === self.indexOf(el));

  if (!images.length) return galleryItemsAlt();

  return images;
};
