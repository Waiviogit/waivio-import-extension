import { getAvatarAmazon } from './avatar';
import { make2dArray } from '../helpers/commonHelper';
import { OPTION_SELECTOR } from '../constants';

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
    option.image = getAvatarAmazon();
  }
  return option;
};

const getTmmOptions = () => {
  const productOptions = [] as OptionType[];

  const options = Array
    .from(document.querySelectorAll<HTMLElement>(OPTION_SELECTOR.TMM_OPTION))
    .map((el) => el.innerText.trim())
    .filter((el) => !!el && !/free/.test(el.toLowerCase()))
    .filter((el, index, self) => index === self.indexOf(el));

  for (const option of options) {
    if (!option) continue;
    productOptions.push(getOptionObject('Format', option));
  }
  return productOptions;
};

const getInlineOptions = (): OptionType[] => {
  const productOptions = [] as OptionType[];
  const inlineOptions = Array
    .from(document.querySelectorAll<HTMLElement>(OPTION_SELECTOR.INLINE_OPTION))
    .map((el) => el?.innerText);
  if (!inlineOptions.length) return getTmmOptions();

  const arr2d = make2dArray(inlineOptions);

  for (const element of arr2d) {
    const [category, value] = element;
    if (!category || !value) continue;
    if (/select/.test(value.toLowerCase())) {
      const searchCategory = category.trim()
        .replace(/[.,%?+*|{}[\]()<>“”^'"\\\-_=!&$:]/g, '')
        .replace(/  +/g, ' ').toLocaleLowerCase();

      const dynamicSelector = `#inline-twister-expander-content-${searchCategory}_name li span span span span`;

      const values = Array.from(document.querySelectorAll<HTMLElement>(dynamicSelector))
        .map((el) => el.innerText.trim())
        .filter((el) => !!el)
        .filter((el, index, self) => index === self.indexOf(el));

      if (!values.length) continue;

      for (const selectValue of values) {
        productOptions.push(getOptionObject(category, selectValue));
      }
      continue;
    }
    productOptions.push(getOptionObject(category, value));
  }

  return productOptions;
};

export const getOptions = (): OptionType[] => {
  const options = Array.from(document.querySelectorAll<HTMLElement>(OPTION_SELECTOR.TWISTER_ID));
  if (!options.length) return getInlineOptions();

  const productOptions = [];
  for (const option of options) {
    const nameNode = option.querySelector<HTMLElement>(OPTION_SELECTOR.OPTION_NAME);
    const valueNode = option.querySelector<HTMLElement>(OPTION_SELECTOR.OPTION_VALUE);
    const category = nameNode?.innerText ?? '';
    const value = valueNode?.innerText ?? '';
    if (!category || !value) continue;

    productOptions.push(getOptionObject(category, value));
  }

  return productOptions;
};
