import { make2dArray } from '../helpers/commonHelper';
import { DETAILS_SELECTOR } from '../constants';

export type productDetailsType = {
  dimension?: string
  groupId?: string
  manufacturer?: string
}

const dimensionRegEx = /dimension/;
const manufacturerRegEx = /manufacturer/;
const groupIdRegEx = /asin/;

export const getProductDetails = (): productDetailsType => {
  const productDetails = {} as productDetailsType;
  const details = Array.from(document.querySelectorAll<HTMLElement>(DETAILS_SELECTOR.MAIN));

  const arr1d = details.map((el) => el?.innerText);
  const arr2d = make2dArray(arr1d);

  for (const element of arr2d) {
    if (dimensionRegEx.test(element[0].toLocaleLowerCase())) {
      productDetails.dimension = element[1].trim();
    }
    if (manufacturerRegEx.test(element[0].toLocaleLowerCase())) {
      productDetails.manufacturer = element[1].trim();
    }
    if (groupIdRegEx.test(element[0].toLocaleLowerCase())) {
      productDetails.groupId = element[1].trim();
    }
  }
  // add check if !productDetails.groupId =
  return productDetails;
};
