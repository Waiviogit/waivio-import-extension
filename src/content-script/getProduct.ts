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
  OptionType, priceType, getFeatures, featuresType,
} from './parser';
import { productSchema } from './validation';

export type parsedObjectType = {
  name: string
  avatar: string
  brand: string
  description: string
  departments: string[]
  options: OptionType[]
  price?: priceType
  features: featuresType[]
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
  mostRecentPriceCurrency?: string
  mostRecentPriceAmount?: string
  features: featuresType[]
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
  mostRecentPriceCurrency?: string
  mostRecentPriceAmount?: string
  brandLink?: string
  colors?: string
  dateAdded?: string
  dateUpdated?: string
  dontFetchAmazonOptions?: string
  features?: string
  imageURLs?: string
  isbn?: string
  manufacturerLink?: string
  merchants?: string
  merchantLink?: string
  sizes?: string
  waivio_tags?: string
  weight?: string
}

type getProductReturnedType = {
  product?: parsedObjectType
  error?: Error
}

export const getProduct = (): getProductReturnedType => {
  const object: parsedObjectType = {
    name: productTitle(),
    avatar: getAvatar(),
    brand: getBrand(),
    departments: getDepartments(),
    description: getDescription(),
    options: getOptions(),
    price: getPrice(),
    productId: getProductId(),
    features: getFeatures(),
    ...getProductDetails(),
  };

  const validation = productSchema.validate(object);
  if (validation.error) {
    alert(validation.error.message);
    return { error: validation.error };
  }

  return { product: object };
};

export const formatToJsonObject = (object: parsedObjectType):exportJsonType => {
  const exportObject = {
    primaryImageURLs: [object.avatar],
    waivio_options: object.options,
    name: object.name,
    categories: object.departments,
    asins: object.productId,
    features: object.features,
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
  if (object?.price?.mostRecentPriceAmount) {
    const { mostRecentPriceAmount, mostRecentPriceCurrency } = object.price;
    exportObject.mostRecentPriceAmount = mostRecentPriceAmount;
    exportObject.mostRecentPriceCurrency = mostRecentPriceCurrency;
  }

  return exportObject;
};

export const formatToCsvObject = (object: parsedObjectType):exportCSVType => {
  const { mostRecentPriceAmount = '', mostRecentPriceCurrency = '' } = object?.price ?? {};

  const exportObject = {
    asins: object.productId,
    brand: object.brand || '',
    brandLink: '',
    categories: object.departments.join(';'),
    colors: '',
    dateAdded: '',
    dateUpdated: '',
    descriptions: object.description || '',
    dimension: object.dimension || '',
    dontFetchAmazonOptions: '',
    features: object.features.map((o) => `key:${o.key}; value:${o.value[0]}*`).join(''),
    groupId: object.groupId || '',
    imageURLs: '',
    isbn: '',
    manufacturer: object.manufacturer || '',
    manufacturerLink: '',
    merchants: '',
    merchantLink: '',
    mostRecentPriceAmount,
    mostRecentPriceCurrency,
    name: object.name,
    primaryImageURLs: object.avatar,
    sizes: '',
    waivio_options: object.options.map((o) => `category:${o.category};${o.image ? `image:${o.image};` : ''} value:${o.value}*`).join(''),
    waivio_tags: '',
    weight: '',
  } as exportCSVType;

  return exportObject;
};
