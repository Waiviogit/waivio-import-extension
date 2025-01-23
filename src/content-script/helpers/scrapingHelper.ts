export const classSelectorByRegex = (selector: string, regex: RegExp): HTMLElement[] => {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  return Array.from(elements).filter((el) => regex.test(el.className || ''));
};

export const idSelectorByRegex = (selector: string, regex: RegExp): HTMLElement[] => {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  return Array.from(elements).filter((el) => regex.test(el.id || ''));
};
