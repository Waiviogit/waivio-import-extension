import { FormFieldConfig } from '../types/form';

export const PRODUCT_FORM_FIELDS: FormFieldConfig[] = [
  {
    label: 'Name',
    name: 'name',
    required: true,
    rules: [{ required: true, message: 'Name is required' }],
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

export const PERSON_FORM_FIELDS: FormFieldConfig[] = [
  {
    label: 'Name',
    name: 'name',
    required: true,
    rules: [{ required: true, message: 'Name is required' }],
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
  { label: 'Description', name: 'fieldDescription', type: 'textarea' },
  { label: 'Address', name: 'address' },
  {
    label: 'Latitude',
    name: 'latitude',
    type: 'number',
    dependencies: ['longitude'],
    rules: [
      ({ getFieldValue }: any) => ({
        validator(_: any, value: any) {
          const longitude = getFieldValue('longitude');
          if (longitude != null && value == null) {
            return Promise.reject(new Error('Latitude is required when Longitude is set'));
          }
          if (value != null && (value < -90 || value > 90)) {
            return Promise.reject(new Error('Latitude must be between -90 and 90'));
          }
          return Promise.resolve();
        },
      }),
    ],
  },
  {
    label: 'Longitude',
    name: 'longitude',
    type: 'number',
    dependencies: ['latitude'],
    rules: [
      ({ getFieldValue }: any) => ({
        validator(_: any, value: any) {
          const latitude = getFieldValue('latitude');
          if (latitude != null && value == null) {
            return Promise.reject(new Error('Longitude is required when Latitude is set'));
          }
          if (value != null && (value < -180 || value > 180)) {
            return Promise.reject(new Error('Longitude must be between -180 and 180'));
          }
          return Promise.resolve();
        },
      }),
    ],
  },
  { label: 'Working hours', name: 'workingHours' },
  { label: 'Phone', name: 'phone' },
  {
    label: 'Website', name: ['websites', 0],
  },
  {
    label: 'Email', name: ['emails', 0],
  },
  {
    label: 'Product IDs',
    name: 'waivio_product_ids',
    type: 'keyValue',
    required: true,
    rules: [{ required: true, message: 'At least one product ID is required' }],
  },
  {
    label: 'List permlinks', name: 'listAssociations', type: 'list',
  },
];

export const BUSINESS_FORM_FIELDS: FormFieldConfig[] = [
  {
    label: 'Name',
    name: 'name',
    required: true,
    rules: [{ required: true, message: 'Name is required' }],
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
  { label: 'Description', name: 'fieldDescription', type: 'textarea' },
  { label: 'Address', name: 'address' },
  {
    label: 'Latitude',
    name: 'latitude',
    type: 'number',
    dependencies: ['longitude'],
    rules: [
      ({ getFieldValue }: any) => ({
        validator(_: any, value: any) {
          const longitude = getFieldValue('longitude');
          if (longitude != null && value == null) {
            return Promise.reject(new Error('Latitude is required when Longitude is set'));
          }
          if (value != null && (value < -90 || value > 90)) {
            return Promise.reject(new Error('Latitude must be between -90 and 90'));
          }
          return Promise.resolve();
        },
      }),
    ],
  },
  {
    label: 'Longitude',
    name: 'longitude',
    type: 'number',
    dependencies: ['latitude'],
    rules: [
      ({ getFieldValue }: any) => ({
        validator(_: any, value: any) {
          const latitude = getFieldValue('latitude');
          if (latitude != null && value == null) {
            return Promise.reject(new Error('Longitude is required when Latitude is set'));
          }
          if (value != null && (value < -180 || value > 180)) {
            return Promise.reject(new Error('Longitude must be between -180 and 180'));
          }
          return Promise.resolve();
        },
      }),
    ],
  },
  { label: 'Working hours', name: 'workingHours' },
  { label: 'Phone', name: 'phone' },
  {
    label: 'Website', name: ['websites', 0],
  },
  {
    label: 'Email', name: ['emails', 0],
  },
  {
    label: 'Company IDs',
    name: 'waivio_company_ids',
    type: 'keyValue',
    required: true,
    rules: [{ required: true, message: 'At least one company ID is required' }],
  },
  {
    label: 'List permlinks', name: 'listAssociations', type: 'list',
  },
];
