export const SOURCE_TYPES = {
  AMAZON: 'amazon',
  SEPHORA: 'sephora',
  WALMART: 'walmart',
  OPENSTREETMAP: 'openstreetmap',
  GOOGLE_MAP: 'google_map',
  LINK_ALL: 'link_all',
  RECIPE_DRAFT: 'recipe_draft',
  DRAFT_YOUTUBE: 'draft_youtube',
  RECIPE_DRAFT_INSTAGRAM: 'recipe_draft_instagram',
  DRAFT_INSTAGRAM: 'draft_instagram',
  DRAFT_TIKTOK: 'draft_tiktok',
  RECIPE_DRAFT_TIKTOK: 'recipe_draft_tiktok',
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok',
  INSTAGRAM: 'instagram',
  ALIEXPRESS: 'aliexpress',
  INSTACART: 'instacart',
  TUTORIAL_INSTAGRAM: 'tutorial_instagram',
  TUTORIAL_YOUTUBE: 'tutorial_youtube',
  TUTORIAL_TIKTOK: 'tutorial_tiktok',
  RECIPE_DRAFT_HIVE: 'recipe_draft_hive',
  TUTORIAL_DRAFT_HIVE: 'tutorial_draft_hive',
  REVIEW_DRAFT_HIVE: 'review_draft_hive',
  EDIT_AI_PRODUCT: 'edit_ai_product',
  EDIT_AI_PERSON: 'edit_ai_person',
  EDIT_AI_BUSINESS: 'edit_ai_business',
};

export const RECIPE_SOURCE_TYPES = [
  SOURCE_TYPES.RECIPE_DRAFT_TIKTOK,
  SOURCE_TYPES.RECIPE_DRAFT_INSTAGRAM,
  SOURCE_TYPES.RECIPE_DRAFT,
  SOURCE_TYPES.RECIPE_DRAFT_HIVE,
];

export const TUTORIAL_SOURCE_TYPES = [
  SOURCE_TYPES.TUTORIAL_INSTAGRAM,
  SOURCE_TYPES.TUTORIAL_YOUTUBE,
  SOURCE_TYPES.TUTORIAL_TIKTOK,
  SOURCE_TYPES.TUTORIAL_DRAFT_HIVE,
];

export const REVIEW_SOURCE_TYPES = [
  SOURCE_TYPES.DRAFT_YOUTUBE,
  SOURCE_TYPES.DRAFT_INSTAGRAM,
  SOURCE_TYPES.DRAFT_TIKTOK,
  SOURCE_TYPES.REVIEW_DRAFT_HIVE,
];
