import axios from 'axios';
import { PARSE_COMMANDS, SOURCE_TYPES } from '../../common/constants';
import { isValidGoogleMapsUrl } from '../../common/helper/googleHelper';
import { replaceInvisible } from '../helpers/commonHelper';
import { EXTERNAL_URL } from '../constants';
import { getGoogleId } from '../googleMaps/formBusinessObjectFromGoogle';
import { getOSMId } from '../helpers/idHelper';

const aboutFormatText = 'The URL must be in the format:';
const constructAmazonURL = (url: string): string => {
  // Extract the product ID from the URL
  const regex = /\/dp\/(\w+)/;
  const match = url.match(regex);
  if (!match || match.length < 2) {
    // Invalid URL format
    return '';
  }

  const productId = match[1];

  // Extract the domain from the URL
  const domainRegex = /https?:\/\/www\.amazon\.(\w.+?)\//;
  const domainMatch = url.match(domainRegex);
  if (!domainMatch || domainMatch.length < 2) {
    // Invalid domain format
    return '';
  }

  const domain = domainMatch[1];

  return `https://www.amazon.${domain}/dp/${productId}`;
};

const notValidPageAmazonAction = (url: string):void => {
  const validUrl = constructAmazonURL(url);
  if (!validUrl) {
    alert(`${aboutFormatText} \nhttps://www.amazon.com/dp/ASIN_NUMBER`);
    return;
  }
  if (window.confirm(`${aboutFormatText} \n${validUrl}\n\nPress "OK" to be redirected to this page.`)) {
    window.open(validUrl, '_self');
  }
};

export const regexBySource = {
  [SOURCE_TYPES.AMAZON]: /(^https:\/\/www\.amazon[^\/]+\/dp\/[A-Z0-9]{10}(?!\/)|^https:\/\/www\.amazon[^\/]+\/gp\/product\/[A-Z0-9]{10})/,
  [SOURCE_TYPES.SEPHORA]: /^https:\/\/www\.sephora[^\/]+\//,
  [SOURCE_TYPES.WALMART]: /^https:\/\/www\.walmart[^\/]+\//,
  [SOURCE_TYPES.OPENSTREETMAP]: /(^https?:\/\/(?:www\.)?openstreetmap\.org\/node\/[0-9]|^https?:\/\/(?:www\.)?openstreetmap\.org\/way\/[0-9])/,
  [SOURCE_TYPES.GOOGLE_MAP]: /^https?:\/\/(?:www\.)?google\.com\/maps\//,
  [SOURCE_TYPES.ALIEXPRESS]: /^https:\/\/www\.aliexpress[^\/]+\/item\//,
  [SOURCE_TYPES.INSTACART]: /^https:\/\/www\.instacart[^\/]+\/products\//,
};

const getProductIdAmazon = (url:string): string => {
  let match = url.match(/\/dp\/([A-Z0-9]+)/);
  if (!match) match = url.match(/\/product\/([A-Z0-9]+)/);

  return match ? replaceInvisible(match[1]) : '';
};

const getProductIdSephora = (url:string):string => {
  const product = url.match(/P\d+/);
  const sku = url.match(/\?skuId=\d+/);
  if (!product) return '';
  if (!sku) return '';
  return `${product[0]}${sku[0]}`;
};

const getProductIdWalmart = (url:string): string => {
  const match = url.match(/\/ip\/([^\/]+)\/(.\d+)/);
  if (!match) return '';
  if (!match[2]) return '';
  return match[2];
};

const getIdByType = {
  [SOURCE_TYPES.AMAZON]: getProductIdAmazon,
  [SOURCE_TYPES.SEPHORA]: getProductIdSephora,
  [SOURCE_TYPES.WALMART]: getProductIdWalmart,
  [SOURCE_TYPES.OPENSTREETMAP]: getOSMId,
  [SOURCE_TYPES.GOOGLE_MAP]: getGoogleId,
};

const idTypeBySource = {
  [SOURCE_TYPES.AMAZON]: 'asins',
  [SOURCE_TYPES.SEPHORA]: 'sephora.com',
  [SOURCE_TYPES.WALMART]: 'walmart',
  [SOURCE_TYPES.OPENSTREETMAP]: 'openstrmaps',
  [SOURCE_TYPES.GOOGLE_MAP]: 'googleMaps',
};

export const getLinkById = async (id: string, idType: string): Promise<string> => {
  try {
    const resp = await axios.post(
      EXTERNAL_URL.WAIVIO_PERMLINK_BY_ID,
      {
        id,
        idType,
      },
      {
        timeout: 15000,
      },
    );

    return resp?.data?.result || '';
  } catch (error) {
    return '';
  }
};

export const getObjectLinkOnWaivio = async (url: string): Promise<string> => {
  for (const type in regexBySource) {
    let match = regexBySource[type].test(url);
    if (type === SOURCE_TYPES.GOOGLE_MAP) {
      match = isValidGoogleMapsUrl(url);
    }
    if (match) {
      const id = await getIdByType[type](url) || '';

      const idType = idTypeBySource[type] || '';
      if (!id || !idType) return '';
      return getLinkById(id, idType);
    }
  }
  return '';
};

const validatePage = (url: string, source: string):boolean => {
  if (source === SOURCE_TYPES.GOOGLE_MAP) {
    return isValidGoogleMapsUrl(url);
  }

  const errorMessageBySource = {
    [SOURCE_TYPES.AMAZON]: notValidPageAmazonAction,
    default: ():void => {},
  };
  const regex = regexBySource[source];

  const result = regex.test(url);
  if (!result) {
    errorMessageBySource[source](url);
  }
  return result;
};

const validatePageForAsin = (url: string):boolean => {
  const regex = /^https:\/\/www\.amazon\./;

  const result = regex.test(url);
  if (!result) {
    alert('The URL must have the Amazon domain https://www.amazon.com');
  }
  return result;
};

const validatePageForYoutube = (url: string): boolean => {
  const regex = /^https?:\/\/(?:www\.)?youtube\.com\/(?:(?:watch\?(?:.*&)?v=[\w-]+)|shorts\/[\w-]+)/;

  const result = regex.test(url);
  if (!result) {
    alert('The URL must be a YouTube video, e.g.: https://www.youtube.com/watch?v=AVCOKbYKQm8');
  }
  return result;
};

const isValidInstagramUrl = (url: string): boolean => {
  const pattern = /^(https?:\/\/)?(www\.)?instagram\.com\/(?:[\w-]+\/)?(p|reel)\/([\w-]+)(\/?|\?.*)/;
  return pattern.test(url);
};

const validateTiktok = (url: string):boolean => {
  const regex = /^https?:\/\/(?:www\.)?tiktok\.com\//;

  return regex.test(url);
};

const draftValidation = {
  [SOURCE_TYPES.RECIPE_DRAFT_TIKTOK]: validateTiktok,
  [SOURCE_TYPES.DRAFT_TIKTOK]: validateTiktok,
  [SOURCE_TYPES.TUTORIAL_TIKTOK]: validateTiktok,
  [SOURCE_TYPES.DRAFT_INSTAGRAM]: isValidInstagramUrl,
  [SOURCE_TYPES.RECIPE_DRAFT_INSTAGRAM]: isValidInstagramUrl,
  [SOURCE_TYPES.TUTORIAL_INSTAGRAM]: isValidInstagramUrl,
  [SOURCE_TYPES.RECIPE_DRAFT]: validatePageForYoutube,
  [SOURCE_TYPES.TUTORIAL_YOUTUBE]: validatePageForYoutube,
  default: validatePageForYoutube,
};

const draftUrlValidation = (url: string, source: string):boolean => {
  const type = source as keyof typeof draftValidation;

  return (draftValidation[type] || draftValidation.default)(url);
};

const validatePageForOpenstreetmap = (url: string):boolean => {
  const regex = /(^https?:\/\/(?:www\.)?openstreetmap\.org\/node\/[0-9]|^https?:\/\/(?:www\.)?openstreetmap\.org\/way\/[0-9])/;

  const result = regex.test(url);
  if (!result) {
    alert('The URL must be openstreetmap business, example: https://www.openstreetmap.org/node/338486362#map=18/52.23000/21.00375');
  }
  return result;
};

const validateGetId = (url: string, source: string) :boolean => {
  const actionBySource = {

    [SOURCE_TYPES.OPENSTREETMAP]: validatePageForOpenstreetmap,
    [SOURCE_TYPES.GOOGLE_MAP]: isValidGoogleMapsUrl,
    default: () => false,
  };

  return (actionBySource[source] || actionBySource.default)(url);
};

export const urlValidation = (url: string, message: string, source: string):boolean => {
  const validationType = {
    [PARSE_COMMANDS.TO_JSON]: validatePage,
    [PARSE_COMMANDS.TO_CSV]: validatePage,
    [PARSE_COMMANDS.TO_CLIPBOARD]: validatePage,
    [PARSE_COMMANDS.SCAN_ASINS]: validatePageForAsin,
    [PARSE_COMMANDS.IMPORT_WAIVIO]: validatePage,
    [PARSE_COMMANDS.CREATE_DRAFT]: draftUrlValidation,
    [PARSE_COMMANDS.CREATE_POST]: () => true,
    [PARSE_COMMANDS.IMPORT_WAIVIO_OPENSTREETMAP]: validatePageForOpenstreetmap,
    [PARSE_COMMANDS.IMPORT_WAIVIO_GOOGLE]: isValidGoogleMapsUrl,
    [PARSE_COMMANDS.GET_ID]: validateGetId,
    default: () => true,
  };
  const type = message as keyof typeof PARSE_COMMANDS;

  return (validationType[type] || validationType.default)(url, source);
};
