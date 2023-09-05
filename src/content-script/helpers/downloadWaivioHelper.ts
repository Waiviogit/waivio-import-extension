import { formatToJsonObject, getProduct } from '../getProduct';
import Cookie = chrome.cookies.Cookie;
import { EXTERNAL_URL } from '../constants';
import { randomNameGenerator } from './commonHelper';
import { detectLanguage } from './detectLanguageHelper';

type userType = {
  _id: string
}
type getUserType = {
  result?: userType
  error?: Error
}

const getUser = (token: string): Promise<getUserType> => fetch(EXTERNAL_URL.HIVE_SIGNER_ME, {
  headers: {
    Authorization: token,
  },
  method: 'POST',
})
  .then((res) => res.json())
  .then((result) => ({ result }))
  .catch((error) => ({ error }));

export const downloadToWaivio = async (source: string): Promise<void> => {
  const { product: exportObj, error } = getProduct(source);
  if (!exportObj || error) return;
  const exportName = randomNameGenerator(8);

  const objectType = exportObj.departments.includes('Books') ? 'book' : 'product';
  const backgroundResponse = await chrome.runtime.sendMessage({ action: 'getCookies', payload: '.waivio.com' });
  if (!backgroundResponse.cookies || !backgroundResponse.cookies.length) return;
  const cookies = backgroundResponse.cookies as Cookie[];

  const accessTokenCookie = cookies.find((c) => c.name === 'access_token');
  if (!accessTokenCookie) {
    alert('The information about the user was not found. Please login to Waivio.');
  }

  const accessToken = accessTokenCookie?.value || '';

  const { result: hiveUser, error: userError } = await getUser(accessToken);
  if (userError) {
    alert(userError.message);
    return;
  }
  // eslint-disable-next-line no-underscore-dangle
  const user = hiveUser?._id ?? '';

  const jsonFormat = formatToJsonObject(exportObj);

  const language = detectLanguage(
    `${jsonFormat.categories.join('')}${(jsonFormat?.descriptions ?? []).join('')}`,
  );

  const jsonData = JSON.stringify(jsonFormat);

  const formData = new FormData();
  const jsonBlob = new Blob([jsonData], { type: 'application/json' });
  formData.append('file', jsonBlob, `${exportName}.json`);
  formData.append('user', user);
  formData.append('authority', 'administrative');
  formData.append('objectType', objectType);
  formData.append('useGPT', 'true');
  formData.append('forceImport', 'true');
  formData.append('addDatafinityData', 'true');
  formData.append('locale', language);

  const headers = new Headers();
  headers.append('access-token', accessToken);

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
      alert(`Import successfully started by ${user}!`);
    })
    .catch((error) => {
      alert(error.message);
    });
};
