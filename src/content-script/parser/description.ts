import { DESCRIPTION_SELECTOR } from '../constants';

const descriptionV2 = ():string => {
  const bulletPoints = Array
    .from(document.querySelectorAll<HTMLElement>(DESCRIPTION_SELECTOR.V2));

  const textPoints:string[] = [];

  for (const bulletPoint of bulletPoints) {
    const point = bulletPoint.innerText ?? '';
    if (point) textPoints.push(point.trim());
  }
  return textPoints.join('');
};
export const getDescription = (): string => {
  const bulletPoints = Array.from(
    document.querySelectorAll<HTMLElement>(DESCRIPTION_SELECTOR.MAIN),
  );
  if (!bulletPoints.length) {
    return descriptionV2();
  }

  const textPoints:string[] = [];

  for (const bulletPoint of bulletPoints) {
    const point = bulletPoint.innerText ?? '';
    if (point) textPoints.push(point.trim());
  }
  return textPoints.join('');
};
