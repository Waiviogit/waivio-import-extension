export const productTitle = (): string => {
  const nameElement = document.querySelector('#productTitle');
  if (!nameElement) return '';
  // @ts-ignore
  const title = nameElement?.innerText ?? '';
  return title.trim();
};
