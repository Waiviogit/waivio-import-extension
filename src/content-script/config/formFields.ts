import { FormFieldConfig } from '../types/form';

export const PRODUCT_FORM_FIELDS: FormFieldConfig[] = [
  {
    label: 'Avatar',
    name: 'primaryImageURLs',
    type: 'imageList',
    maxItems: 1,
    showPreview: true,
  },
  {
    label: 'Gallery',
    name: 'imageURLs',
    type: 'imageList',
    showPreview: true,
  },
  {
    label: 'Product Name',
    name: 'name',
    required: true,
    rules: [{ required: true, message: 'Product name is required' }],
  },
  { label: 'Brand', name: 'brand' },
  { label: 'Manufacturer', name: 'manufacturer' },
  { label: 'Description', name: 'fieldDescription', type: 'textarea' },
  { label: 'Price Amount', name: 'mostRecentPriceAmount' },
  { label: 'Price Currency', name: 'mostRecentPriceCurrency' },
  { label: 'Weight', name: 'weight' },
  { label: 'Rating', name: 'fieldRating' },
  { label: 'Group Id', name: 'groupId' },
  {
    label: 'Product Ids:',
    name: 'waivio_product_ids',
    type: 'keyValue',
    required: true,
    rules: [{ required: true, message: 'At least one product ID is required' }],
  },
  { label: 'Categories:', name: 'categories', type: 'list' },
  { label: 'Merchants', name: ['merchants', 0, 'name'] },
  { label: 'Features:', name: 'features', type: 'keyValue' },
  { label: 'Options:', name: 'waivio_options', type: 'categoryValue' },
];
