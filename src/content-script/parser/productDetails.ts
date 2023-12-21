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

const getGroupIdFromScripts = ():string => {
  const scriptInnerTexts = Array.from(document.querySelectorAll('script'))
    .map((el) => el.innerText)
    .filter((el) => el.includes('parentAsin'));

  const regex = /jQuery\.parseJSON\((.*?)\)/;
  const script = scriptInnerTexts.find((el) => regex.test(el));
  if (!script) return '';
  const regex2 = /"parentAsin":\s*"(.*?)",/;
  const all = regex2.exec(script);
  if (!all) return '';
  return all[1] || '';
};

// for books

const getKindleAsin = ():string => {
  const kindleUrl = document.querySelector<HTMLLinkElement>('#tmm-grid-swatch-KINDLE a')?.href;
  if (!kindleUrl) return '';
  // eslint-disable-next-line no-script-url
  if (kindleUrl === 'javascript:void(0)') {
    const url = document.URL;
    let match = url.match(/\/dp\/([A-Z0-9]+)/);
    if (!match) match = url.match(/\/product\/([A-Z0-9]+)/);
    if (match && match[1]) return match[1];
    return '';
  }

  const match = kindleUrl.match(/\/dp\/([A-Z0-9]+)/);
  return match ? match[1] : '';
};

const getGroupIdFromAllOptions = ():string => {
  const kindleAsin = getKindleAsin();
  if (kindleAsin) return `GID_${kindleAsin}`;

  let refs = Array.from(document.querySelectorAll<HTMLLinkElement>('li.swatchElement a'));
  if (!refs.length) {
    refs = Array.from(document.querySelectorAll<HTMLLinkElement>('#tmmSwatches a'));
  }

  const asins = refs.map((el) => el.href)
    .filter((el) => el.includes('dp'))
    .map((el) => { const match = el.match(/\/dp\/([A-Z0-9]+)/); return match ? match[1] : ''; })
    .filter((el, index, self) => el && index === self.indexOf(el));

  if (!asins.length) return '';

  const url = document.URL;
  let match = url.match(/\/dp\/([A-Z0-9]+)/);
  if (!match) match = url.match(/\/product\/([A-Z0-9]+)/);

  if (match && match[1] && !asins.includes(match[1]))asins.push(match[1]);

  // Custom alphanumeric sorting
  asins.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  const asinsString = asins.join('');

  return asinsString;
};

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

  const groupIdScripts = getGroupIdFromScripts();
  if (groupIdScripts) productDetails.groupId = groupIdScripts;

  // special groupId for books
  const groupIdOptions = getGroupIdFromAllOptions();
  if (groupIdOptions) productDetails.groupId = groupIdOptions;

  if (!productDetails.weight && productDetails.dimension) {
    const [, weight] = productDetails.dimension.split(';');
    if (weight) productDetails.weight = weight;
  }
  return productDetails;
};

const getAlternativeDetails = (): productDetailsType => {
  const details = Array.from(document.querySelectorAll<HTMLElement>(DETAILS_SELECTOR.TABLE))
    .map((el) => (el.outerText ?? '\t').split('\t'));

  return constructDetailFrom2dArr(details);
};

export const getProductDetailsAmazon = (): productDetailsType => {
  const details = Array.from(document.querySelectorAll<HTMLElement>(DETAILS_SELECTOR.MAIN));
  if (!details.length) return getAlternativeDetails();

  const arr1d = details.map((el) => el?.innerText);
  const arr2d = make2dArray(arr1d);

  return constructDetailFrom2dArr(arr2d);
};
