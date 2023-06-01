import { DETAILS_SELECTOR } from '../constants';
import { replaceInvisible } from '../helpers/commonHelper';

const modelRegEx = /model number/;

export type featuresType = {
  key: string,
  value: string[]
}

const getRating = (): featuresType => {
  const ratingElement = {
    key: 'Overall Rating',
    value: [] as string [],
  };

  const ratingArr = Array
    .from(document.querySelectorAll<HTMLElement>('#averageCustomerReviews span span span span.a-size-base'))
    .map((el) => el.innerText.trim())
    .filter((el) => !!el)
    .filter((el, index, self) => index === self.indexOf(el));
  if (ratingArr.length) {
    const ratingTotal = ratingArr.reduce((acc, el) => acc + (Number(el) || 0), 0);
    const ratingAvg = ratingTotal / ratingArr.length;
    ratingElement.value.push(`${ratingAvg}`);
    return ratingElement;
  }
  ratingElement.value.push('0');
  return ratingElement;
};

export const getFeatures = () => {
  const features = [] as featuresType[];
  features.push(getRating());
  const details = Array.from(document.querySelectorAll<HTMLElement>(DETAILS_SELECTOR.TABLE))
    .map((el) => (el.outerText ?? '\t').split('\t'));
  for (const detail of details) {
    if (modelRegEx.test(detail[0].toLocaleLowerCase())) {
      features.push({
        key: replaceInvisible(detail[0]),
        value: [replaceInvisible(detail[1])],
      });
    }
  }
  return features;
};
