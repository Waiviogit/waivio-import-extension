import { PARSE_COMMANDS } from '../../services/pageParser';

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
  const domainRegex = /https?:\/\/www\.amazon\.(\w+)\//;
  const domainMatch = url.match(domainRegex);
  if (!domainMatch || domainMatch.length < 2) {
    // Invalid domain format
    return '';
  }

  const domain = domainMatch[1];

  return `https://www.amazon.${domain}/dp/${productId}`;
};

// const validatePage = (url: string):boolean => {
//   const regex = /^https:\/\/www\.amazon[^\/]+\/dp\/[A-Z0-9]{10}(?!\/)/;
//
//   const result = regex.test(url);
//   if (!result) {
//     const validUrl = constructAmazonURL(url) || 'https://www.amazon.com/dp/ASIN_NUMBER';
//     if (window.confirm(`Url must be like ${validUrl} If you click "ok" you would be redirected . Cancel will load this website `)) {
//       window.open(validUrl, '_self');
//     }
//   }
//   return result;
// };

const validatePage = (url: string):boolean => {
  const regex = /^https:\/\/www\.amazon[^\/]+\/dp\/[A-Z0-9]{10}(?!\/)/;

  const result = regex.test(url);
  if (!result) {
    const validUrl = constructAmazonURL(url);
    if (!validUrl) {
      alert('Url must be like https://www.amazon.com/dp/ASIN_NUMBER');
      return result;
    }
    if (window.confirm(`Url must be like ${validUrl}\n If you click "ok" you would be redirected. Cancel will load this website `)) {
      window.open(validUrl, '_self');
    }
  }
  return result;
};

const validatePageForAsin = (url: string):boolean => {
  const regex = /^https:\/\/www\.amazon\./;

  const result = regex.test(url);
  if (!result) {
    alert('Url must has amazon domain https://www.amazon.com');
  }
  return result;
};

export const urlValidation = (url: string, message: string):boolean => {
  const validationType = {
    [PARSE_COMMANDS.TO_JSON]: validatePage,
    [PARSE_COMMANDS.TO_CSV]: validatePage,
    [PARSE_COMMANDS.TO_CLIPBOARD]: validatePage,
    [PARSE_COMMANDS.SCAN_ASINS]: validatePageForAsin,
    [PARSE_COMMANDS.IMPORT_WAIVIO]: validatePage,
  };
  const type = message as keyof typeof PARSE_COMMANDS;

  return validationType[type](url);
};
