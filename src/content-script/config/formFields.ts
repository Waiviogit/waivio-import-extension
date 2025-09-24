import { FormFieldConfig } from '../types/form';

export const PRODUCT_FORM_FIELDS: FormFieldConfig[] = [
  {
    label: 'Name',
    name: 'name',
    required: true,
    rules: [{ required: true, message: 'Name is required' }],
  },
  {
    label: 'Type',
    name: 'objectType',
    type: 'select',
    options: [
      { value: 'product', label: 'Product' },
      { value: 'book', label: 'Book' },
    ],
    required: true,
    rules: [{ required: true, message: 'Object type is required' }],
  },
  {
    label: 'Avatar',
    name: 'primaryImageURLs',
    type: 'imageList',
    maxItems: 1,
    showPreview: true,
  },
  {
    label: 'Gallery item',
    name: 'imageURLs',
    type: 'imageList',
    showPreview: true,
  },
  { label: 'Brand', name: 'brand' },
  { label: 'Manufacturer', name: 'manufacturer' },
  { label: 'Description', name: 'fieldDescription', type: 'textarea' },
  { label: 'Price amount', name: 'mostRecentPriceAmount' },
  { label: 'Compare price amount', name: 'compareAtPriceAmount' },
  { label: 'Price currency', name: 'mostRecentPriceCurrency' },
  { label: 'Weight', name: 'weight' },
  { label: 'Rating', name: 'fieldRating' },
  {
    label: 'Website', name: ['websites', 0],
  },
  { label: 'Group ID', name: 'groupId' },
  {
    label: 'Product IDs',
    name: 'waivio_product_ids',
    type: 'keyValue',
    required: true,
    rules: [{ required: true, message: 'At least one product ID is required' }],
  },
  { label: 'Categories', name: 'categories', type: 'list' },
  { label: 'Merchants', name: ['merchants', 0, 'name'] },
  { label: 'Features', name: 'features', type: 'keyValue' },
  { label: 'Options', name: 'waivio_options', type: 'categoryValue' },
  {
    label: 'List permlinks', name: 'listAssociations', type: 'list',
  },
];
