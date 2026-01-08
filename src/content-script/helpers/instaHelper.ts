export const getInstagramUsername = (): string => document.querySelector<HTMLElement>('span span div a')?.innerText
        || '';

export const getInstagramDescription = (): string => {
  const items = Array.from(document.querySelectorAll<HTMLElement>('h1'));
  for (const item of items) {
    if (item.innerText) return item.innerText;
  }

  const elements = Array.from(document.querySelectorAll<HTMLElement>('span[dir="auto"]')).slice(4, 20);

  let content = '';

  for (const el of elements) {
    content += el.innerText || '';
  }
  return content;
};
