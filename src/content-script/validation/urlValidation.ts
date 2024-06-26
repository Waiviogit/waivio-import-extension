import { PARSE_COMMANDS, SOURCE_TYPES } from '../../common/constants';
import { isValidGoogleMapsUrl } from '../../common/helper/googleHelper';

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

const validatePage = (url: string, source: string):boolean => {
  const regexBySource = {
    [SOURCE_TYPES.AMAZON]: /(^https:\/\/www\.amazon[^\/]+\/dp\/[A-Z0-9]{10}(?!\/)|^https:\/\/www\.amazon[^\/]+\/gp\/product\/[A-Z0-9]{10})/,
    [SOURCE_TYPES.SEPHORA]: /^https:\/\/www\.sephora[^\/]+\//,
    [SOURCE_TYPES.WALMART]: /^https:\/\/www\.walmart[^\/]+\//,
    [SOURCE_TYPES.OPENSTREETMAP]: /(^https?:\/\/(?:www\.)?openstreetmap\.org\/node\/[0-9]|^https?:\/\/(?:www\.)?openstreetmap\.org\/way\/[0-9])/,
    [SOURCE_TYPES.GOOGLE_MAP]: /^https?:\/\/(?:www\.)?google\.com\/maps\//,
  };

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

const validatePageForYoutube = (url: string):boolean => {
  const regex = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=/;

  const result = regex.test(url);
  if (!result) {
    alert('The URL must be youtube video example: https://www.youtube.com/watch?v=AVCOKbYKQm8');
  }
  return result;
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
    [PARSE_COMMANDS.CREATE_DRAFT]: validatePageForYoutube,
    [PARSE_COMMANDS.IMPORT_WAIVIO_OPENSTREETMAP]: validatePageForOpenstreetmap,
    [PARSE_COMMANDS.IMPORT_WAIVIO_GOOGLE]: isValidGoogleMapsUrl,
    [PARSE_COMMANDS.GET_ID]: validateGetId,
  };
  const type = message as keyof typeof PARSE_COMMANDS;

  return validationType[type](url, source);
};
