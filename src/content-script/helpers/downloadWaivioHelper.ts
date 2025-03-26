import axios from 'axios';
import { formatToJsonObject, getProduct } from '../getProduct';
import Cookie = chrome.cookies.Cookie;
import { EXTERNAL_URL } from '../constants';
import { randomNameGenerator } from './commonHelper';
import { detectLanguage } from './detectLanguageHelper';
import { getWaivioUserInfo } from './userHelper';

type userType = {
  _id: string
}
type getUserType = {
  result?: userType
  error?: unknown
}

export const getUser = async (
  token: string,
  authString?:string,
  guestName?: string,
): Promise<getUserType> => {
  try {
    if (guestName) {
      return { result: { _id: guestName } };
    }
    if (authString) {
      const parsedData = JSON.parse(authString);

      return { result: { _id: parsedData?.username } };
    }

    const res = await fetch(EXTERNAL_URL.HIVE_SIGNER_ME, {
      headers: {
        Authorization: token,
      },
      method: 'POST',
    });

    const result = await res.json();

    return { result };
  } catch (error) {
    return { error };
  }
};

interface downloadToWaivioInterface {
  object: any
  objectType: string
  language?: string
  addDatafinityData?: boolean
}

type validateUserImportType = {
  valid: boolean
  message: string
}

export const validateWaivioImport = async (): Promise<validateUserImportType> => {
  const backgroundResponse = await chrome.runtime.sendMessage({ action: 'getCookies', payload: '.waivio.com' });
  if (!backgroundResponse?.cookies || !backgroundResponse.cookies.length) return { valid: false, message: 'Please sign in to Waivio in a separate tab.' };
  const cookies = backgroundResponse.cookies as Cookie[];

  const accessTokenCookie = cookies.find((c) => c.name === 'access_token');
  if (!accessTokenCookie) {
    return { valid: false, message: 'Please sign in to Waivio in a separate tab.' };
  }

  const accessToken = accessTokenCookie?.value || '';
  const auth = cookies.find((c) => c.name === 'auth');
  const guestName = cookies.find((c) => c.name === 'guestName')?.value;
  const authString = auth?.value?.replace(/%22/g, '"').replace(/%2C/g, ',');

  const {
    result: hiveUser,
    error: userError,
  } = await getUser(accessToken, authString, guestName);

  // eslint-disable-next-line no-underscore-dangle
  if (!hiveUser?._id || userError) {
    return { valid: false, message: 'Please sign in to Waivio in a separate tab.' };
  }

  return { valid: true, message: 'ok' };
};

export const getLinkByBody = async (body: string, objectType?: string): Promise<string> => {
  try {
    const resp = await axios.post(
      EXTERNAL_URL.WAIVIO_PERMLINK_BY_FIELD_BODY,
      {
        body,
        objectType,
      },
      {
        timeout: 15000,
      },
    );

    return resp?.data?.result || '';
  } catch (error) {
    return '';
  }
};

export const downloadToWaivio = async ({
  object, objectType, addDatafinityData, language,
}:downloadToWaivioInterface): Promise<void> => {
  const exportName = randomNameGenerator(8);

  const userInfo = await getWaivioUserInfo();
  if (!userInfo) return;
  const {
    userName, guestName, auth, accessToken,
  } = userInfo;

  const jsonData = JSON.stringify(object);

  const formData = new FormData();
  const jsonBlob = new Blob([jsonData], { type: 'application/json' });
  formData.append('file', jsonBlob, `${exportName}.json`);
  formData.append('user', userName);
  formData.append('authority', 'administrative');
  formData.append('objectType', objectType);
  formData.append('useGPT', 'true');
  formData.append('forceImport', 'true');

  if (addDatafinityData) {
    formData.append('addDatafinityData', 'true');
  }
  if (language) {
    formData.append('locale', language);
  }

  const headers = new Headers();
  headers.append('access-token', accessToken);
  headers.append('hive-auth', auth ? 'true' : 'false');
  headers.append('waivio-auth', guestName ? 'true' : 'false');

  fetch(EXTERNAL_URL.WAIVIO_IMPORT, {
    method: 'POST',
    body: formData,
    headers,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result?.message) {
        alert(result.message);
        return;
      }
      alert(`Import successfully started by ${userName}!`);
    })
    .catch((error) => {
      alert(error.message);
    });
};

export const downloadProductToWaivio = async (source: string): Promise<void> => {
  const { product: exportObj, error } = await getProduct(source);
  if (!exportObj || error) return;

  const jsonFormat = formatToJsonObject(exportObj);

  const language = detectLanguage(
    `${jsonFormat.categories.join('')}${(jsonFormat?.descriptions ?? []).join('')}`,
  );

  const objectType = exportObj.departments
    .some((el) => ['Kindle Store', 'Books', 'Audible Books & Originals'].includes(el))
    ? 'book'
    : 'product';

  await downloadToWaivio({
    object: jsonFormat,
    objectType,
    language,
    addDatafinityData: true,
  });
};

export const loadImageBase64 = async (file:Blob, size?: string) => {
  try {
    const bodyFormData = new FormData();

    bodyFormData.append('file', file);
    if (size) {
      bodyFormData.append('size', size);
    }
    const resp = await axios.post(
      EXTERNAL_URL.WAIVIO_IMAGE,
      bodyFormData,
      {
        timeout: 15000,
      },
    );
    const result = resp?.data?.image;
    if (!result) return { error: new Error('Internal server error') };
    return { result };
  } catch (error) {
    return { error };
  }
};

export const getPostImportHost = async (user: string): Promise<string> => {
  try {
    const resp = await axios.get(
      EXTERNAL_URL.WAIVIO_POST_IMPORT_HOST,
      {
        timeout: 15000,
        params: {
          user,
        },
      },
    );

    return resp?.data?.host || '';
  } catch (error) {
    return '';
  }
};

 interface postImportWaivioInterface {
  title: string
  body: string
  host: string
  tags: string[]
}

export const postImportWaivio = async ({
  title, body, tags, host,
}: postImportWaivioInterface): Promise<void> => {
  const userInfo = await getWaivioUserInfo();
  if (!userInfo) return;
  const {
    userName, guestName, auth, accessToken,
  } = userInfo;

  try {
    await axios.post(
      EXTERNAL_URL.WAIVIO_POST_IMPORT,
      {
        user: userName,
        host,
        posts: [{
          title, body, tags,
        }],

      },
      {
        headers: {
          'access-token': accessToken,
          'hive-auth': auth ? 'true' : 'false',
          'waivio-auth': guestName ? 'true' : 'false',
        },
      },
    );
    alert('The post has been added to the queue and will be published soon.');
  } catch (error) {
    // @ts-ignore
    alert(`${error?.message} ${error?.response?.data?.message}`);
  }
};
