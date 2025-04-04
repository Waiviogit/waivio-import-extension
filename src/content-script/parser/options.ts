import {
  getAvatarAliexpress, getAvatarAmazon, getAvatarSephora, getAvatarWalmart,
} from './avatar';
import { OPTION_SELECTOR } from '../constants';
import { classSelectorByRegex, idSelectorByRegex } from '../helpers/scrapingHelper';

export type OptionType = {
  category: string
  value: string
  image?: string
}

const optionsFilter = (el: OptionType) => !/(unavailable|stock)/ig.test(el.category);

const capitalizeEachWord = (string: string): string => {
  const arr = string.split(' ');
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  return arr.join(' ');
};

const getOptionObject = (category: string, value: string, source = 'amazon'): OptionType => {
  const option = {
    category: capitalizeEachWord(category
      .trim()
      .replace(/[.,%?+*|{}[\]()<>“”^'"\\\-_=!&$:]/g, '')
      .replace(/  +/g, ' ')),
    value: value.trim(),
  } as OptionType;
  if (option.category === 'Color' && source === 'amazon') {
    option.image = getAvatarAmazon();
  }
  if (option.category === 'Color' && source === 'sephora') {
    const { avatar } = getAvatarSephora();
    option.image = avatar;
  }
  if (option.category === 'Color' && source === 'walmart') {
    const { avatar } = getAvatarWalmart();
    option.image = avatar;
  }

  if (option.category === 'Color' && source === 'aliexpress') {
    const { avatar } = getAvatarAliexpress();
    option.image = avatar;
  }
  return option;
};

const getTmmOptions = () => {
  const productOptions = [] as OptionType[];

  const options = Array
    .from(document.querySelectorAll<HTMLElement>(OPTION_SELECTOR.TMM_OPTION))
    .map((el) => el.innerText.trim())
    .filter((el) => !!el && !/(free)|(membership trial)|(available instantly)/i.test(el.toLowerCase()))
    .filter((el, index, self) => index === self.indexOf(el));

  for (const option of options) {
    if (!option) continue;
    productOptions.push(getOptionObject('Format', option));
  }
  return productOptions;
};

const getInlineOptions = (): OptionType[] => {
  const productOptions = [] as OptionType[];

  const inlineOptions = idSelectorByRegex('span', /inline-twister-expanded-dimension-text/)
  // @ts-ignore
    .map((el) => el?.parentNode?.innerText || '');

  if (!inlineOptions.length) return getTmmOptions();

  for (const el of inlineOptions) {
    if (!el) continue;
    const keyValueMain = el.split(':');
    productOptions.push(getOptionObject(keyValueMain[0], keyValueMain[1], 'amazon'));
  }

  return productOptions;
};

export const getOptions = (): OptionType[] => {
  const options = Array.from(document.querySelectorAll<HTMLElement>(OPTION_SELECTOR.TWISTER_ID));
  if (!options.length) {
    const productOptions = getInlineOptions();
    return productOptions.filter(optionsFilter);
  }

  const productOptions = [];
  for (const option of options) {
    const nameNode = option.querySelector<HTMLElement>(OPTION_SELECTOR.OPTION_NAME);
    const valueNode = option.querySelector<HTMLElement>(OPTION_SELECTOR.OPTION_VALUE);
    const category = nameNode?.innerText ?? '';
    const value = valueNode?.innerText ?? '';
    if (!category || !value) continue;

    productOptions.push(getOptionObject(category, value));
  }

  return productOptions.filter(optionsFilter);
};

export const getSephoraOptions = (): OptionType[] => {
  const productOptions = [];
  const mainOption = document
    .querySelector<HTMLElement>('div[data-comp="SwatchDescription "]')?.innerText;
  if (mainOption) {
    const keyValueMain = mainOption.split(':');
    productOptions.push(getOptionObject(keyValueMain[0], keyValueMain[1], 'sephora'));
  }

  const sizeLabel = document
    .querySelector<HTMLElement>('span[data-at="sku_size_label"]')?.innerText;
  if (sizeLabel) {
    const sizeValue = sizeLabel.replace(/size/i, '');
    productOptions.push(getOptionObject('Size', sizeValue));
  }

  const swatchGroup = Array.from(document.querySelectorAll<HTMLElement>('div[data-comp="SwatchGroup "]'));

  if (swatchGroup.length <= 1) return productOptions;

  const selectedElement = swatchGroup.find((element) => {
    const buttonWithAriaLabelSelected = element
      .querySelector<HTMLElement>('button[aria-selected="true"]');
    return buttonWithAriaLabelSelected !== null;
  });
  if (selectedElement) {
    const swatch = selectedElement.querySelector('p')?.innerText;
    if (swatch) productOptions.push(getOptionObject('Product group', swatch));
  }

  return productOptions;
};

export const getWalmartOptions = () => {
  const productOptions = [];
  const elements = [];
  for (let i = 0; i < 10; i++) {
    const element = document
      .querySelectorAll<HTMLElement>(`div[data-testid="variant-group-${i}"] span`);
    if (!element.length) break;
    elements.push(element);
  }
  const variants = elements.map((element) => {
    const category = element[0]?.innerText;
    const value = element[1]?.innerText;

    return [category, value];
  });

  for (const variant of variants) {
    productOptions.push(getOptionObject(variant[0], variant[1], 'walmart'));
  }

  return productOptions;
};

export const getAliExpressOptions = (): OptionType[] => {
  const productOptions = [];
  const elements = classSelectorByRegex('div', /sku-item--title/);

  for (const el of elements) {
    const keyValueMain = el.innerText.split(':');
    productOptions.push(getOptionObject(keyValueMain[0], keyValueMain[1], 'aliexpress'));
  }

  return productOptions;
};
