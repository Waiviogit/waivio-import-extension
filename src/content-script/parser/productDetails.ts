import { make2dArray, replaceInvisible } from '../helpers/commonHelper';
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
      productDetails.dimension = replaceInvisible(detail[1]);
    }
    if (manufacturerRegEx.test(detail[0].toLocaleLowerCase())) {
      productDetails.manufacturer = replaceInvisible(detail[1]);
    }
    if (groupIdRegEx.test(detail[0].toLocaleLowerCase())) {
      productDetails.groupId = replaceInvisible(detail[1]);
    }
    if (weightRegEx.test(detail[0].toLocaleLowerCase())) {
      productDetails.weight = replaceInvisible(detail[1]);
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
