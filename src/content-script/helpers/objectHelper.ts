import socketClient from '../../services/socketClient';
import { getWaivioUserInfo } from './userHelper';
import { downloadToWaivio } from './downloadWaivioHelper';
import { EXTERNAL_URL } from '../constants';
import Cookie = chrome.cookies.Cookie;
import { Product } from '../types/product';

type userImportResultType = {
    result: boolean
}

type objectExistResultType = {
   result: boolean
}

type recipeType = {
  name: string
  fieldDescription: string
  fieldCalories: string
  fieldCookingTime: string
  fieldBudget: string
  categories: string[]
  fieldRecipeIngredients: string[]
}

type updateType = {
  name: string
  body: string
  locale: string
}

type generateRecipeType = {
  result: recipeType | null
}

type extractIdType = {
  result: string
}

type importProductErrorType = {
    error: {
        message: string
    }
}

type createObjectType = {
  result: {
    transactionId: string
    parentAuthor: string
    parentPermlink: string
    author: string
    permlink: string
  }
}

type objectForPostType = {
  name: string
  permlink: string
}

type validateUserImportType = userImportResultType|importProductErrorType;
type generateObjectFromDescriptionType = generateRecipeType|importProductErrorType;
type generateObjectFromURLType = {result: Product}|importProductErrorType;
type createWaivioObjectType = createObjectType|importProductErrorType;
type checkObjectExistType = objectExistResultType|importProductErrorType;

type extractIdResponseType = extractIdType|importProductErrorType;

const validateUserImport = async (user:string): Promise<validateUserImportType> => {
  try {
    const url = new URL(EXTERNAL_URL.WAIVIO_IMPORT_VALIDATE);
    url.search = new URLSearchParams({ user }).toString();

    const response = await fetch(url);

    const data = await response.json();
    return {
      result: data.result,
    };
  } catch (error) {
    return { error } as importProductErrorType;
  }
};

interface GenerateObjectFromDescriptionI {
  description: string
  user: string
  accessToken: string
  guestName: string
  auth: Cookie|undefined
}

interface ExtractIdFromUrl {
  url: string
  user: string
  accessToken: string
  guestName: string
  auth: Cookie|undefined
}

interface GenerateObjectFromURLImageI {
  url: string
  user: string
  accessToken: string
  guestName: string
  auth: Cookie|undefined
}

interface GetUpdateBodyI {
  author: string
  parentAuthor: string
  parentPermlink: string
  field : updateType
}

const generateObjectFromDescription = async (
  {
    description, user, accessToken, guestName, auth,
  }: GenerateObjectFromDescriptionI,
): Promise<generateObjectFromDescriptionType> => {
  try {
    const url = new URL(EXTERNAL_URL.WAIVIO_GENERATE_RECIPE);

    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Token': accessToken,
          'Hive-Auth': auth ? 'true' : 'false',
          'Waivio-Auth': guestName ? 'true' : 'false',
        },
        body: JSON.stringify({ user, description }),
      },
    );

    const data = await response.json();
    return {
      result: data.result,
    };
  } catch (error) {
    return { error } as importProductErrorType;
  }
};

export const extractIdFromUrlRequest = async (
  {
    url, user, accessToken, guestName, auth,
  }: ExtractIdFromUrl,
): Promise<extractIdResponseType> => {
  try {
    const requestUrl = new URL(EXTERNAL_URL.WAIVIO_EXTRACT_ID);

    const response = await fetch(
      requestUrl,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Token': accessToken,
          'Hive-Auth': auth ? 'true' : 'false',
          'Waivio-Auth': guestName ? 'true' : 'false',
        },
        body: JSON.stringify({ user, url }),
      },
    );

    const data = await response.json();
    return {
      result: data.id,
    };
  } catch (error) {
    return { error } as importProductErrorType;
  }
};

export const generateObjectFromImage = async (
  {
    url, user, accessToken, guestName, auth,
  }: GenerateObjectFromURLImageI,
): Promise<generateObjectFromURLType> => {
  try {
    const requestUrl = new URL(EXTERNAL_URL.WAIVIO_GENERATE_PRODUCT);

    const response = await fetch(
      requestUrl,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Access-Token': accessToken,
          'Hive-Auth': auth ? 'true' : 'false',
          'Waivio-Auth': guestName ? 'true' : 'false',
        },
        body: JSON.stringify({ user, url }),
      },
    );

    const data = await response.json();
    console.log('response object', data);
    return {
      result: data,
    };
  } catch (error) {
    return { error } as importProductErrorType;
  }
};

const getIdFromUrl = (url:string) => {
  const patterns = [
    // YouTube Shorts: https://www.youtube.com/shorts/ID
    { regex: /youtube\.com\/shorts\/([^?\/]+)/, group: 1 },
    // YouTube watch: https://www.youtube.com/watch?v=ID
    { regex: /youtube\.com\/watch\?v=([^&]+)/, group: 1 },
    // Instagram post: https://www.instagram.com/p/ID/
    { regex: /instagram\.com\/p\/([^\/]+)/, group: 1 },
    // TikTok video: https://www.tiktok.com/@user/video/ID
    { regex: /tiktok\.com\/@[^\/]+\/video\/(\d+)/, group: 1 },
  ];

  for (const { regex, group } of patterns) {
    const m = url.match(regex);
    if (m) return m[group];
  }

  // fallback: strip protocol
  return url.replace(/^https?:\/\//, '');
};

const getRecipeProductId = (name: string) => ([{
  key: 'instacart',
  // value: name.replace(/[.,%?+*|{}[\]()<>“”^'"\\\-_=!&$:]/g, '')
  //   .replace(/ +/g, '-').trim().toLocaleLowerCase(),
  value: getIdFromUrl(document.URL),
}]);

const PERMLINK_MAX_LEN = 255;

const genRandomString = (stringLength: number) => {
  let randomString = '';
  let randomAscii;
  const asciiLow = 65;
  const asciiHigh = 90;

  for (let i = 0; i < stringLength; i += 1) {
    randomAscii = Math.floor(Math.random() * (asciiHigh - asciiLow) + asciiLow);
    randomString += String.fromCharCode(randomAscii);
  }
  return randomString;
};

const permlinkGenerator = (string: string) => {
  const permlink = `${genRandomString(3)}-${string}`
    .toLowerCase()
    .replace(/[ _]/g, '-')
    .replace(/[.]/g, '')
    .replace(/[^a-z0-9-]+/g, '');

  return permlink.length > PERMLINK_MAX_LEN ? permlink.substring(0, PERMLINK_MAX_LEN) : permlink;
};

const checkObjectExist = async (authorPermlink:string): Promise<checkObjectExistType> => {
  try {
    const url = new URL(`https://www.waivio.com/api/wobject/${authorPermlink}/exist`);
    const response = await fetch(url);
    const data = await response.json();
    return { result: !!data.exist };
  } catch (error) {
    return { error } as importProductErrorType;
  }
};

const generateUniquePermlink = async (name:string): Promise<string> => {
  let permlink;
  let exist = false;

  do {
    permlink = permlinkGenerator(name);
    const checkExistResponse = await checkObjectExist(permlink);
    if ('error' in checkExistResponse) {
      break;
    }

    exist = checkExistResponse.result;
  } while (exist);

  return permlink;
};

const getRecipeCreateBody = async (name: string, author: string) => ({
  permlink: await generateUniquePermlink(name),
  objectName: name,
  author,
  title: `${name} - waivio object`,
  body: `Waivio object "${name}" has been created`,
  locale: 'en-US',
  type: 'recipe',
  isExtendingOpen: true,
  isPostingOpen: true,
  parentAuthor: 'waivio.updates08',
  parentPermlink: 'fpw-recipe',
});

const createWaivioObject = async (
  body: object,
): Promise<createWaivioObjectType> => {
  try {
    const url = new URL(EXTERNAL_URL.WAIVIO_CREATE_OBJECT);

    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    return {
      result: data,
    };
  } catch (error) {
    return { error } as importProductErrorType;
  }
};

const createWaivioUpdate = async (
  body: object,
): Promise<createWaivioObjectType> => {
  try {
    const url = new URL(EXTERNAL_URL.WAIVIO_CREATE_UPDATE);

    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    return {
      result: data,
    };
  } catch (error) {
    return { error } as importProductErrorType;
  }
};

const getUpdateBody = ({
  author, parentAuthor, parentPermlink, field,
}: GetUpdateBodyI) => ({
  author,
  permlink: permlinkGenerator(author),
  parentAuthor,
  parentPermlink,
  body: `@${author} added ${field.name} (English): ${JSON.stringify(field.body)}`,
  title: '',
  field,
});

/**
 * 1 validate user import
 * 2 create gpt object from description
 * 3 create product_id
 * 4 create object
 * check success socket
 * 5 create product id
 * check success socket
 * 6 start import
 */
export const createObjectForPost = async (postBody: string)
    : Promise<objectForPostType| undefined> => {
  const userInfo = await getWaivioUserInfo();
  if (!userInfo) {
    alert('No user info');
    return;
  }
  const {
    userName, accessToken, auth, guestName,
  } = userInfo;
  const validateResponse = await validateUserImport(userName);
  if ('error' in validateResponse) {
    alert(`Validate import error: ${validateResponse.error}`);
    return;
  }
  const generationResponse = await generateObjectFromDescription({
    description: postBody,
    user: userName,
    accessToken,
    auth,
    guestName,
  });
  if ('error' in generationResponse) {
    alert(`Generation recipe error: ${generationResponse.error}`);
    return;
  }
  if (!generationResponse.result) {
    alert('Generation recipe error try again');
    return;
  }
  const recipe = generationResponse.result;
  const productId = getRecipeProductId(recipe.name);
  const recipeCreateBody = await getRecipeCreateBody(recipe.name, userName);

  const createObjectResponse = await createWaivioObject(recipeCreateBody);
  if ('error' in createObjectResponse) {
    alert(`Create object error: ${createObjectResponse.error}`);
    return;
  }

  const { transactionId, parentPermlink, parentAuthor } = createObjectResponse.result;

  const resultSocket = await socketClient.sendMessage({
    id: transactionId,
    method: 'subscribeTransactionId',
    params: [`create-obj-${userName}`, transactionId],
  });

  const successCreteObj = resultSocket?.data?.success;
  if (!successCreteObj) {
    alert(`socket subscribeTransactionId create object error ${transactionId}`);
    return;
  }

  const updateBody = getUpdateBody({
    author: userName,
    parentAuthor,
    parentPermlink,
    field: {
      body: JSON.stringify({
        productIdType: productId[0].key,
        productId: productId[0].value,
      }),
      locale: 'en-US',
      name: 'productId',
    },
  });

  const createUpdateResponse = await createWaivioUpdate(updateBody);
  if ('error' in createUpdateResponse) {
    alert(`Create object error: ${createUpdateResponse.error}`);
    return;
  }
  const resultSocketUpdate = await socketClient.sendMessage({
    id: createUpdateResponse.result.transactionId,
    method: 'subscribeTransactionId',
    params: [`create-upd-${userName}`, createUpdateResponse.result.transactionId],
  });
  const successCreteUpdate = resultSocketUpdate?.data?.success;
  if (!successCreteUpdate) {
    alert(`socket subscribeTransactionId create update error ${createUpdateResponse.result.transactionId}`);
    return;
  }
  await downloadToWaivio({
    object: {
      ...recipe,
      waivio_product_ids: productId,
    },
    objectType: 'recipe',
  });

  return {
    name: recipe.name,
    permlink: createObjectResponse.result.parentPermlink,
  };
};
