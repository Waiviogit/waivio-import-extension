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
export const getDescriptionAmazon = (): string => {
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

export const getDescriptionSephora = (): string => {
  const script = document.querySelector<HTMLElement>('#linkStore')?.innerText;
  if (!script) return '';
  try {
    const json = JSON.parse(script);
    const description = json?.page?.product?.productDetails?.longDescription;
    const description2 = json?.page?.product?.productDetails?.shortDescription;
    if (!description && !description2) return '';

    if (description) return description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return description2.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  } catch (error) {
    return '';
  }
};

export const getDescriptionWalmart = (): string => {
  const description = document.querySelector<HTMLElement>('div[data-testid="product-description-content"]');
  if (!description) return '';
  return description.innerText;
};
