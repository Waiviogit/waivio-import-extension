import { DETAILS_SELECTOR } from '../constants';
import { make2dArray, replaceInvisible } from '../helpers/commonHelper';
import { getProductIdSephoraSku } from './productId';
import { classSelectorByRegex, elementSelectorByRegex } from '../helpers/scrapingHelper';

const modelRegEx = /model number/;
const languageRegEx = /language/i;
const printLengthRegEx = /print length/i;
const publicationDateRegEx = /publication date/i;

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

const getPublisherFromDetails = ():string => {
  const details = Array.from(document.querySelectorAll<HTMLElement>(DETAILS_SELECTOR.MAIN));
  if (!details?.length) return '';
  const arr1d = details.map((el) => el?.innerText);
  const arr2d = make2dArray(arr1d);
  for (const detail of arr2d) {
    if (/publisher/.test(detail[0].toLocaleLowerCase())) {
      const str = replaceInvisible(detail[1]);

      return str.replace(/\(([^)]*)\)/, '').trim();
    }
  }

  return '';
};

export const getFeaturesAmazon = () => {
  const features = [] as featuresType[];
  features.push(getRating());
  const details = Array.from(document.querySelectorAll<HTMLElement>(DETAILS_SELECTOR.TABLE))
    .map((el) => (el.outerText ?? '\t').split('\t'));
  const details2 = Array.from(document.querySelectorAll<HTMLElement>(DETAILS_SELECTOR.MAIN));
  if (details2.length) {
    const arr1d = details2.map((el) => el?.innerText);
    const arr2d = make2dArray(arr1d);
    details.push(...arr2d);
  }
  for (const detail of details) {
    if (modelRegEx.test(detail[0].toLocaleLowerCase())) {
      features.push({
        key: replaceInvisible(detail[0]).replace(/:/g, '').trim(),
        value: [replaceInvisible(detail[1])],
      });
      continue;
    }
    if (languageRegEx.test(detail[0].toLocaleLowerCase())) {
      features.push({
        key: 'language',
        value: [replaceInvisible(detail[1])],
      });
      continue;
    }
    if (printLengthRegEx.test(detail[0].toLocaleLowerCase())) {
      features.push({
        key: 'pages',
        value: [replaceInvisible(detail[1])],
      });
      continue;
    }
    if (publicationDateRegEx.test(detail[0].toLocaleLowerCase())) {
      features.push({
        key: 'publicationDate',
        value: [replaceInvisible(detail[1])],
      });
    }
  }

  // features for books
  const authors = Array.from(document.querySelectorAll<HTMLElement>('#bylineInfo span.author a'))
    .map((el) => el?.innerText);
  if (authors.length) {
    features.push({
      key: 'Author',
      value: authors,
    });
  }
  const publisher = getPublisherFromDetails();
  if (publisher) {
    features.push({
      key: 'publisher',
      value: [publisher],
    });
  }

  return features;
};

const getRatingSephora = ():string => {
  const ratingMap = {
    '0 stars': '0',
    '0.5 stars': '0.5',
    '1 stars': '1',
    '1.5 stars': '1.5',
    '2 stars': '2',
    '2.5 stars': '2.5',
    '3 stars': '3',
    '3.5 stars': '3.5',
    '4 stars': '4',
    '4.5 stars': '4.5',
    '5 stars': '5',
  };

  for (const ratingMapElement of Object.keys(ratingMap)) {
    const element = document
      .querySelector(`a[data-comp="ReviewsAnchor StyledComponent BaseComponent "] span[aria-label="${ratingMapElement}"]`);
    if (element) { // @ts-ignore
      return ratingMap[ratingMapElement];
    }
  }
  return '0';
};

export const getFeaturesSephora = () => {
  const features = [] as featuresType[];
  features.push({
    key: 'Overall Rating',
    value: [getRatingSephora()],
  });

  const sku = getProductIdSephoraSku();
  if (sku) {
    features.push({
      key: sku.key,
      value: [sku.value],
    });
  }

  return features;
};

const getFeatureNavItems = async (): Promise<featuresType[]> => {
  const features = [] as featuresType[];
  const button = document.querySelector<HTMLElement>('#nav-specification button');
  if (!button) return features;
  button.click();

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const elements = classSelectorByRegex('div', /specification--prop--/);
      for (const element of elements) {
        const title = elementSelectorByRegex(element, 'div', /specification--title--/);
        const desc = elementSelectorByRegex(element, 'div', /specification--desc--/);
        if (!title.length || !desc.length) continue;
        features.push({
          key: title[0].innerText,
          value: [desc[0].innerText],
        });
      }

      resolve(features);
    }, 500);
  });
};

export const getFeaturesAliExpress = async () => {
  const features = [] as featuresType[];
  const rating = document.querySelector<HTMLElement>('[data-pl="product-reviewer"] strong');
  if (rating) {
    features.push({
      key: 'Overall Rating',
      value: [replaceInvisible(rating.innerText)],
    });
  }

  const navFeatures = await getFeatureNavItems();
  if (navFeatures.length) features.push(...navFeatures);

  return features;
};

const getRatingWalmart = (): featuresType => {
  const ratingElement = {
    key: 'Overall Rating',
    value: [] as string [],
  };
  const rating = document
    .querySelector<HTMLElement>('div[data-testid="reviews-and-ratings"] span.rating-number')?.innerText;
  if (!rating) {
    ratingElement.value.push('0');
    return ratingElement;
  }
  const match = rating.match(/\(([^)]*)\)/);

  if (!match) {
    ratingElement.value.push('0');
    return ratingElement;
  }
  ratingElement.value.push(match[1]);
  return ratingElement;
};

export const getFeaturesWalmart = () => {
  const features = [] as featuresType[];
  const elements = document
    .querySelectorAll('section[aria-describedby="delivery-instructions"]');

  features.push(getRatingWalmart());
  if (!elements.length) return features;
  if (!elements[1]) return features;

  const featuresStrings = Array.from(
    elements[1].querySelectorAll<HTMLElement>('.nt1 .pb2'),
  )
    .map((el) => el.innerText)
    .filter(
      (el) => !/brand/i.test(el)
            && !/manufacturer/i.test(el)
            && !/size/i.test(el)
            && !/color/i.test(el),
    );

  for (const featuresString of featuresStrings) {
    const detail = featuresString.split('\n');
    features.push({
      key: replaceInvisible(detail[0]).replace(/:/g, '').trim(),
      value: [replaceInvisible(detail[1])],
    });
  }
  return features;
};
