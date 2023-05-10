import { getAvatar } from './avatar';
import { make2dArray } from '../helpers/commonHelper';

const SELECTOR = {
  TWISTER_ID: '#twister .a-row',
  OPTION_NAME: '.a-form-label',
  OPTION_VALUE: '.selection',
  INLINE_OPTION: '#twister-plus-inline-twister-card span div div div span:not(.inline-twister-dim-title-value-truncate)',
};

export type OptionType = {
  category: string
  value: string
  image?: string
}

const capitalizeEachWord = (string: string): string => {
  const arr = string.split(' ');
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  return arr.join(' ');
};

const getOptionObject = (category: string, value: string): OptionType => {
  const option = {
    category: capitalizeEachWord(category
      .trim()
      .replace(/[.,%?+*|{}[\]()<>“”^'"\\\-_=!&$:]/g, '')
      .replace(/  +/g, ' ')),
    value: value.trim(),
  } as OptionType;
  if (option.category === 'Color') {
    option.image = getAvatar();
  }
  return option;
};

const getInlineOptions = (): OptionType[] => {
  const productOptions = [] as OptionType[];
  const inlineOptions = Array
    .from(document.querySelectorAll<HTMLElement>('#twister-plus-inline-twister-card span div div div span:not(.inline-twister-dim-title-value-truncate)'))
    .map((el) => el?.innerText);

  const arr2d = make2dArray(inlineOptions);

  for (const element of arr2d) {
    const [category, value] = element;
    if (!category || !value) continue;
    if (/select/.test(value.toLowerCase())) continue;
    productOptions.push(getOptionObject(category, value));
  }

  return productOptions;
};

export const getOptions = (): OptionType[] => {
  const options = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR.TWISTER_ID));
  if (!options.length) return getInlineOptions();

  const productOptions = [];
  for (const option of options) {
    const nameNode = option.querySelector<HTMLElement>(SELECTOR.OPTION_NAME);
    const valueNode = option.querySelector<HTMLElement>(SELECTOR.OPTION_VALUE);
    const category = nameNode?.innerText ?? '';
    const value = valueNode?.innerText ?? '';
    if (!category || !value) continue;

    productOptions.push(getOptionObject(category, value));
  }

  return productOptions;
};
