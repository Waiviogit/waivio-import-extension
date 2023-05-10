const CURRENCY_PREFIX = {
  A$: 'AUD',
  $: 'USD',
  C$: 'CAD',
  NZ$: 'NZD',
  '€': 'EUR',
  '£': 'GBP',
  S$: 'SGD',
  HK$: 'HKD',
  MX$: 'MXN',
  '₣': 'CHF',
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

export const getPrice = (): priceType => {
  const price = {
    mostRecentPriceCurrency: '',
    mostRecentPriceAmount: '',
  };
  const priceElement = document.querySelector<HTMLElement>('#corePrice_desktop .a-offscreen');
  if (!priceElement) return price;
  const prefix = extractCurrency(priceElement.innerText) as keyof typeof CURRENCY_PREFIX;
  const mostRecentPriceCurrency = CURRENCY_PREFIX[prefix];
  const mostRecentPriceAmount = extractNumericValue(priceElement.innerText);
  price.mostRecentPriceCurrency = mostRecentPriceCurrency;
  price.mostRecentPriceAmount = mostRecentPriceAmount;
  return price;
};
