export const getInstagramUsername = (): string => document.querySelector<HTMLElement>('span span div a')?.innerText
        || '';

export const getInstagramDescription = (): string => document.querySelector<HTMLElement>('h1')?.innerText || '';
