export const getPrice = (): string => {
  const priceElement = document.querySelector('#corePrice_desktop .a-offscreen');
  if (!priceElement) return '';
  return priceElement.innerHTML.trim();
};
