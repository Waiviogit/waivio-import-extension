import {
  getAvatar,
  getBrand,
  getDepartments,
  productTitle,
  getDescription,
  getOptions,
  getProductId,
  getPrice,
  getProductDetails,
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
  dimension?: string
  groupId?: string
  manufacturer?: string
  // gallery items
}

export type exportJsonType = {
  primaryImageURLs: string[]
  waivio_options: OptionType[]
  name: string
  asins: string
  categories: string[]
  descriptions?: string[]
  brand?: string
  dimension?: string
  manufacturer?: string
  groupId?: string
}

export type exportCSVType = {
  primaryImageURLs: string
  waivio_options: string
  name: string
  asins: string
  categories: string
  descriptions?: string
  brand?: string
  dimension?: string
  groupId?: string
  manufacturer?: string
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
    ...getProductDetails(),
  };
  // todo validation empty fields
  // name, departments, options, avatar, productId
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
  if (object.dimension) {
    exportObject.dimension = object.dimension;
  }
  if (object.manufacturer) {
    exportObject.manufacturer = object.manufacturer;
  }
  if (object.groupId) {
    exportObject.groupId = object.groupId;
  }

  return exportObject;
};

export const formatToCsvObject = (object: parsedObjectType):exportCSVType => {
  const exportObject = {
    primaryImageURLs: object.avatar,
    waivio_options: object.options.map((o) => `category:${o.category};\r\n value:${o.value};\r\n`).join(';'),
    name: object.name,
    categories: object.departments.join(','),
    asins: object.productId,
  } as exportCSVType;
  if (object.description) {
    exportObject.descriptions = object.description;
  }
  if (object.brand) {
    exportObject.brand = object.brand;
  }
  if (object.dimension) {
    exportObject.dimension = object.dimension;
  }
  if (object.manufacturer) {
    exportObject.manufacturer = object.manufacturer;
  }
  if (object.groupId) {
    exportObject.groupId = object.groupId;
  }

  return exportObject;
};
