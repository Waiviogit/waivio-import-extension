import { getAvatarAmazon, getAvatarSephora, getAvatarWalmart } from './avatar';
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
