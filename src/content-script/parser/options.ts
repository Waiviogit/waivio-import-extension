import { getAvatar } from './avatar';

const SELECTOR = {
  TWISTER_ID: '#twister .a-row',
  OPTION_NAME: '.a-form-label',
  OPTION_VALUE: '.selection',
};

interface getOptionValuesFromNodesInterface {
  nameNode: HTMLElement
  valueNode:HTMLElement
}

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

const getOptionValuesFromNodes = (
  { nameNode, valueNode }: getOptionValuesFromNodesInterface,
): OptionType| undefined => {
  try {
    const name = nameNode.innerText;
    const value = valueNode.innerText;

    return {
      category: capitalizeEachWord(name
        .trim()
        .replace(/[.,%?+*|{}[\]()<>“”^'"\\\-_=!&$:]/g, '')
        .replace(/  +/g, ' ')),
      value: value.trim(),
    };
  } catch (error) {
    console.log(error);
  }
};

export const getOptions = () => {
  const options = document.querySelectorAll(SELECTOR.TWISTER_ID);

  const productOptions = [];
  // @ts-ignore
  for (const option of options) {
    const nameNode = option.querySelector(SELECTOR.OPTION_NAME);
    const valueNode = option.querySelector(SELECTOR.OPTION_VALUE);
    const formattedValues = getOptionValuesFromNodes({ nameNode, valueNode });
    if (!formattedValues || !formattedValues.category || !formattedValues.value) continue;
    if (formattedValues.category === 'Color') {
      formattedValues.image = getAvatar();
    }
    productOptions.push(formattedValues);
  }

  return productOptions;
};
