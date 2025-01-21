export const AVATAR_SELECTOR = {
  MAIN: '#imgTagWrapperId img',
  ALTERNATIVE_1: '#img-wrapper img:not(#sitbLogoImg)',
  ALTERNATIVE_2: '#ebooks-img-wrapper img',
};

export const BRAND_SELECTOR = {
  MAIN: '#productOverview_feature_div .po-brand span',
  V2: '#nic-po-expander-content table td',
  SEPHORA: '[data-at="brand_name"]',
};

export const DEPARTMENT_SELECTOR = {
  MAIN: '#wayfinding-breadcrumbs_feature_div li:not(.a-breadcrumb-divider)',
  SEPHORA: '[data-at="pdp_bread_crumb"]',
};

export const PRICE_SELECTOR = {
  AMAZON: '#corePrice_desktop .a-offscreen',
  SEPHORA: '[data-comp="Price "] b',
  ALIEXPRESS: '[data-pl="product-price"] span',
};

export const DESCRIPTION_SELECTOR = {
  MAIN: '#featurebullets_feature_div li span',
  V2: '#feature-bullets li span',
};

export const NAME_SELECTOR = {
  MAIN: '#productTitle',
  SEPHORA: '[data-at="product_name"]',
  WALMART: '#main-title',
  ALIEXPRESS: 'h1[data-pl="product-title"]',
};

export const OPTION_SELECTOR = {
  TWISTER_ID: '#twister .a-row',
  OPTION_NAME: '.a-form-label',
  OPTION_VALUE: '.selection',
  INLINE_OPTION: '#twister-plus-inline-twister-card span div div div span:not(.inline-twister-dim-title-value-truncate)',
  TMM_OPTION: '#tmmSwatches .selected span span span span:not(.olp-from, .a-declarative, .a-color-base, .kcpAppsPopOver, .price, .a-color-price, .a-size-base, .kcpAppBaseBox_, .audible_mm_title, .a-color-secondary, .audible_mm_price)',
};

export const DETAILS_SELECTOR = {
  MAIN: '#detailBullets_feature_div li span span',
  TABLE: '#prodDetails tr',
};

export const GALLERY_SELECTOR = {
  MAIN: '.imgTagWrapper img',
  ALT_IMAGES: '#altImages li.a-spacing-small.item.imageThumbnail.a-declarative',
};
