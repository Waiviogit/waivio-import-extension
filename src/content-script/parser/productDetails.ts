import { make2dArray } from '../helpers/commonHelper';
import { DETAILS_SELECTOR } from '../constants';

export type productDetailsType = {
  dimension?: string
  groupId?: string
  manufacturer?: string
  weight?: string
}

const dimensionRegEx = /dimension/;
const manufacturerRegEx = /^(?!.*discontinued.*)(?=.*manufacturer).*$/;
const groupIdRegEx = /asin/;
const weightRegEx = /weight/;

const constructDetailFrom2dArr = (details: string[][]): productDetailsType => {
  const productDetails = {} as productDetailsType;
  for (const detail of details) {
    if (dimensionRegEx.test(detail[0].toLocaleLowerCase())) {
      productDetails.dimension = detail[1].trim();
    }
    if (manufacturerRegEx.test(detail[0].toLocaleLowerCase())) {
      productDetails.manufacturer = detail[1].trim();
    }
    if (groupIdRegEx.test(detail[0].toLocaleLowerCase())) {
      productDetails.groupId = detail[1].trim();
    }
    if (weightRegEx.test(detail[0].toLocaleLowerCase())) {
      productDetails.weight = detail[1].trim();
    }
  }
  return productDetails;
};

const getAlternativeDetails = (): productDetailsType => {
  const details = Array.from(document.querySelectorAll<HTMLElement>(DETAILS_SELECTOR.TABLE))
    .map((el) => (el.outerText ?? '\t').split('\t'));

  return constructDetailFrom2dArr(details);
};

export const getProductDetails = (): productDetailsType => {
  const details = Array.from(document.querySelectorAll<HTMLElement>(DETAILS_SELECTOR.MAIN));
  if (!details.length) return getAlternativeDetails();

  const arr1d = details.map((el) => el?.innerText);
  const arr2d = make2dArray(arr1d);

  return constructDetailFrom2dArr(arr2d);
};
