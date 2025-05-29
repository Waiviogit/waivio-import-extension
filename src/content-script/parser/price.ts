import { PRICE_SELECTOR } from '../constants';

const CURRENCY_PREFIX = {
  A$: 'AUD',
  $: 'USD',
  'US $': 'USD',
  C$: 'CAD',
  NZ$: 'NZD',
  '€': 'EUR',
  '£': 'GBP',
  S$: 'SGD',
  HK$: 'HKD',
  MX$: 'MXN',
  '₣': 'CHF',
  '¥': 'JPY',
  '₽': 'RUB',
  '₴': 'UAH',
  '₹': 'INR',
  R$: 'BRL',
  R: 'ZAR',
  zł: 'PLN',
  '₺': 'TRY',
  '₪': 'ILS',
  'د.إ': 'AED',
  '﷼': 'SAR',
  '฿': 'THB',
  '₩': 'KRW',
  RM: 'MYR',
  '₱': 'PHP',
  Rp: 'IDR',
  '₫': 'VND',
  kr: 'SEK',
  default: 'USD',
};

const extractCurrency = (priceString: string): string => {
  const match = priceString.match(/^\D+/);
  if (!match) return '$';

  const currency = match[0] || '$';
  return currency.trim();
};

const extractNumericValue = (priceString: string): string => {
  const numericValue = parseFloat(priceString.replace(/[^\d.-]+/g, ''));
  return String(numericValue);
};

export type priceType = {
  mostRecentPriceCurrency: string
  mostRecentPriceAmount: string
}

const priceFromSeparateSpan = (): priceType => {
  const price = {
    mostRecentPriceCurrency: '',
    mostRecentPriceAmount: '',
  };
  const priceWhole = document.querySelector<HTMLElement>('.a-price-whole');
  const priceFraction = document.querySelector<HTMLElement>('.a-price-fraction');
  const amount = parseFloat(`${(priceWhole?.innerText ?? '').replace(/\D/g, '').trim()}.${(priceFraction?.innerText ?? '').replace(/\D/g, '').trim() || 0}`);
  if (!amount) return price;
  const prefixElement = document.querySelector<HTMLElement>('.a-price-symbol');
  const prefix = extractCurrency(prefixElement?.innerText ?? '') as keyof typeof CURRENCY_PREFIX;
  price.mostRecentPriceCurrency = CURRENCY_PREFIX[prefix];
  price.mostRecentPriceAmount = String(amount);

  return price;
};

export const getPriceAmazon = (): priceType => {
  const price = {
    mostRecentPriceCurrency: '',
    mostRecentPriceAmount: '',
  };
  const priceElement = document.querySelector<HTMLElement>(PRICE_SELECTOR.AMAZON);
  if (!priceElement) return priceFromSeparateSpan();
  const prefix = extractCurrency(priceElement.innerText) as keyof typeof CURRENCY_PREFIX;
  const mostRecentPriceCurrency = CURRENCY_PREFIX[prefix];
  const mostRecentPriceAmount = extractNumericValue(priceElement.innerText);
  price.mostRecentPriceCurrency = mostRecentPriceCurrency;
  price.mostRecentPriceAmount = mostRecentPriceAmount;
  return price;
};

export const getPriceSephora = (): priceType => {
  const price = {
    mostRecentPriceCurrency: '',
    mostRecentPriceAmount: '',
  };
  const priceElement = document.querySelector<HTMLElement>(PRICE_SELECTOR.SEPHORA);
  if (!priceElement) return price;
  const prefix = extractCurrency(priceElement.innerText) as keyof typeof CURRENCY_PREFIX;
  const mostRecentPriceCurrency = CURRENCY_PREFIX[prefix];
  const mostRecentPriceAmount = extractNumericValue(priceElement.innerText);
  price.mostRecentPriceCurrency = mostRecentPriceCurrency;
  price.mostRecentPriceAmount = mostRecentPriceAmount;
  return price;
};

export const getPriceAliExpress = (): priceType => {
  const price = {
    mostRecentPriceCurrency: '',
    mostRecentPriceAmount: '',
  };

  const priceElement = document.querySelector<HTMLElement>(PRICE_SELECTOR.ALIEXPRESS);
  if (!priceElement) return price;

  const prefix = extractCurrency(priceElement.innerText) as keyof typeof CURRENCY_PREFIX;
  const mostRecentPriceCurrency = CURRENCY_PREFIX[prefix];
  const mostRecentPriceAmount = extractNumericValue(priceElement.innerText);
  price.mostRecentPriceCurrency = mostRecentPriceCurrency;
  price.mostRecentPriceAmount = mostRecentPriceAmount;
  return price;
};

export const getPriceWalmart = (): priceType => {
  const price = {
    mostRecentPriceCurrency: '',
    mostRecentPriceAmount: '',
  };
  const priceElement = document.querySelector<HTMLElement>('span[itemprop="price"]');
  if (!priceElement) return price;
  const prefix = extractCurrency(priceElement.innerText) as keyof typeof CURRENCY_PREFIX;
  const mostRecentPriceCurrency = CURRENCY_PREFIX[prefix];
  const mostRecentPriceAmount = extractNumericValue(priceElement.innerText);
  price.mostRecentPriceCurrency = mostRecentPriceCurrency;
  price.mostRecentPriceAmount = mostRecentPriceAmount;
  return price;
};
