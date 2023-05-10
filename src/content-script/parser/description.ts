import { DESCRIPTION_SELECTOR } from '../constants';

export const getDescription = (): string => {
  const bulletPoints = Array.from(
    document.querySelectorAll<HTMLElement>(DESCRIPTION_SELECTOR.MAIN),
  );
  const textPoints = [];

  for (const bulletPoint of bulletPoints) {
    const point = bulletPoint.innerText ?? '';
    if (point) textPoints.push(point.trim());
  }
  return textPoints.join('');
};
