import {
  getAvatarAmazon,
  getBrandAmazon,
  getDepartmentsAmazon,
  productTitleAmazon,
  getDescriptionAmazon,
  getOptions,
  getProductIdAmazon,
  getPriceAmazon,
  getProductDetailsAmazon,
  OptionType,
  priceType,
  getFeaturesAmazon,
  featuresType,
  getGalleryItemsAmazon,
  productTitleSephora,
  getAvatarSephora,
  getBrandSephora,
  getDepartmentsSephora,
  getPriceSephora,
  getSephoraOptions,
  getDescriptionSephora,
  getProductIdSephora,
  getGroupIdSephora,
  getAvatarWalmart,
  getGroupIdWalmart,
  productTitleWalmart,
  getDepartmentsWalmart,
  getDescriptionWalmart,
  getProductIdWalmart,
  getWalmartOptions,
  getPriceWalmart,
  getBrandWalmart,
  getFeaturesWalmart,
  getFeaturesSephora,
  getPossibleIdsWalmart,
  getAvatarAliexpress,
  getProductIdAliExpress,
  productTitleAliExpress,
  getFeaturesAliExpress,
  getDescriptionAliExpress, getPriceAliExpress, getDepartmentsFromProductDescription,
} from './parser';
import { productSchema } from './validation';
import { SOURCE_TYPES } from '../common/constants';

export type productIdType = {
  key: string
  value: string
}

export type parsedObjectType = {
  name: string
  avatar: string
  brand: string
  description: string
  departments: string[]
  options: OptionType[]
  price?: priceType
  features: featuresType[]
  productId?: string
  productIds?: productIdType[]
  dimension?: string
  groupId?: string
  manufacturer?: string
  weight?: string
  imageURLs?: string[]
  // gallery items
}

export type exportJsonType = {
  primaryImageURLs: string[]
  waivio_options: OptionType[]
  name: string
  asins?: string
  waivio_product_ids?: productIdType[]
  categories: string[]
  descriptions?: string[]
  brand?: string
  dimension?: string
  manufacturer?: string
  groupId?: string
  mostRecentPriceCurrency?: string
  mostRecentPriceAmount?: string
  features: featuresType[]
  weight?: string
  imageURLs?: string[]
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
  waivio_product_ids: string
  weight?: string
}

type getProductReturnedType = {
  product?: parsedObjectType
  error?: Error
}

const getProductFromAmazon = (): getProductReturnedType => {
  const object: parsedObjectType = {
    name: productTitleAmazon(),
    avatar: getAvatarAmazon(),
    brand: getBrandAmazon(),
    departments: getDepartmentsAmazon(),
    description: getDescriptionAmazon(),
    options: getOptions(),
    price: getPriceAmazon(),
    productId: getProductIdAmazon(),
    features: getFeaturesAmazon(),
    ...getProductDetailsAmazon(),
    imageURLs: getGalleryItemsAmazon(),
  };
  if (object.productId === object.groupId) {
    delete object.groupId;
  }

  const validation = productSchema.validate(object);
  if (validation.error) {
    alert(validation.error.message);
    return { error: validation.error };
  }

  return { product: object };
};

const getProductFromSephora = (): getProductReturnedType => {
  const { avatar, gallery } = getAvatarSephora();

  const productId1 = getProductIdSephora();

  const object: parsedObjectType = {
    name: productTitleSephora(),
    avatar,
    brand: getBrandSephora(),
    departments: getDepartmentsSephora(),
    description: getDescriptionSephora(),
    options: getSephoraOptions(),
    price: getPriceSephora(),
    productIds: [],
    features: getFeaturesSephora(),
    imageURLs: gallery,
    groupId: getGroupIdSephora(),
  };
  if (productId1) {
    object.productIds?.push(productId1);
  }

  const validation = productSchema.validate(object);
  if (validation.error) {
    alert(validation.error.message);
    return { error: validation.error };
  }

  return { product: object };
};

const getProductFromWalmart = (): getProductReturnedType => {
  const { avatar, gallery } = getAvatarWalmart();

  const productId1 = getProductIdWalmart();

  const allPossibleIds = getPossibleIdsWalmart();

  const object: parsedObjectType = {
    name: productTitleWalmart(),
    avatar,
    brand: getBrandWalmart(),
    departments: getDepartmentsWalmart(),
    description: getDescriptionWalmart(),
    options: getWalmartOptions(),
    price: getPriceWalmart(),
    productIds: [],
    features: getFeaturesWalmart(),
    imageURLs: gallery,
    groupId: getGroupIdWalmart(),
  };
  if (productId1) {
    object.productIds?.push(productId1);
  }

  if (allPossibleIds.length) {
    object.productIds?.push(...allPossibleIds);
  }

  const validation = productSchema.validate(object);
  if (validation.error) {
    alert(validation.error.message);
    return { error: validation.error };
  }

  return { product: object };
};

const getProductFromAliExpress = async (): Promise<getProductReturnedType> => {
  const { avatar, gallery } = getAvatarAliexpress();
  const name = productTitleAliExpress();

  const productId1 = getProductIdAliExpress();

  const description = await getDescriptionAliExpress();
  const departments = await getDepartmentsFromProductDescription(name);
  console.log('departments', departments);

  const object: parsedObjectType = {
    name, //+
    avatar,
    brand: '', // -
    departments,
    description, // +
    options: getSephoraOptions(), // -
    price: getPriceAliExpress(), // +
    productIds: [],
    features: getFeaturesAliExpress(), //+
    imageURLs: gallery, //+
    // groupId: getGroupIdSephora(),
  };
  if (productId1) {
    object.productIds?.push(productId1);
  }

  const validation = productSchema.validate(object);
  if (validation.error) {
    alert(validation.error.message);
    return { error: validation.error };
  }

  return { product: object };
};

export const getProduct = async (source: string): Promise<getProductReturnedType> => {
  switch (source) {
    case SOURCE_TYPES.AMAZON:
      return getProductFromAmazon();
    case SOURCE_TYPES.SEPHORA:
      return getProductFromSephora();
    case SOURCE_TYPES.WALMART:
      return getProductFromWalmart();
    case SOURCE_TYPES.ALIEXPRESS:
      return getProductFromAliExpress();

    default: return { error: new Error('Source not found') };
  }
};

export const formatToJsonObject = (object: parsedObjectType):exportJsonType => {
  const exportObject = {
    primaryImageURLs: [object.avatar],
    waivio_options: object.options,
    name: object.name,
    categories: object.departments,
    features: object.features,
  } as exportJsonType;
  if (object.description) {
    exportObject.descriptions = [object.description];
  }
  if (object.productId) {
    exportObject.asins = object.productId;
  }
  if (object.productIds) {
    exportObject.waivio_product_ids = object.productIds;
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
  if (object.weight) {
    exportObject.weight = object.weight;
  }
  if (object.imageURLs) {
    exportObject.imageURLs = object.imageURLs;
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
    imageURLs: (object.imageURLs ?? []).join(';'),
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
    waivio_product_ids: (object?.productIds ?? []).map((o) => `key:${o.key}; value:${o.value}*`).join(''),
    waivio_tags: '',
    weight: object.weight || '',
  } as exportCSVType;

  return exportObject;
};
