import {
  getAvatar,
  getBrand,
  getDepartments,
  productTitle,
  getDescription,
  getOptions,
  getProductId,
  getPrice,
  OptionType,
} from './parser';

export type parsedObjectType = {
  name: string
  avatar: string
  brand: string
  description: string
  departments: string[]
  options: OptionType[]
  price: string
  productId: string
}

export type exportJsonType = {
  primaryImageURLs: string[]
  waivio_options: OptionType[]
  name: string
  asins: string
  categories: string[]
  descriptions?: string[]
  brand?: string
}

export const getProduct = (): parsedObjectType => {
  const object: parsedObjectType = {
    name: productTitle(),
    avatar: getAvatar(),
    brand: getBrand(),
    departments: getDepartments(),
    description: getDescription(),
    options: getOptions(),
    price: getPrice(),
    productId: getProductId(),
  };
  // todo validation empty fields
  // name, departments, options, avatar, productId
  console.log(object);
  return object;
};

export const formatToJsonObject = (object: parsedObjectType):exportJsonType => {
  const exportObject = {
    primaryImageURLs: [object.avatar],
    waivio_options: object.options,
    name: object.name,
    categories: object.departments,
    asins: object.productId,
  } as exportJsonType;
  if (object.description) {
    exportObject.descriptions = [object.description];
  }
  if (object.brand) {
    exportObject.brand = object.brand;
  }

  return exportObject;
};
