export const getGalleryItemsAmazon = (): string[] => {
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

  return images;
};
