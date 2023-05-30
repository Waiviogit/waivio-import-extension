import { formatToJsonObject, parsedObjectType } from '../getProduct';
import Cookie = chrome.cookies.Cookie;
import { EXTERNAL_URL } from '../constants';

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

export const downloadToWaivio = async (
  exportObj: parsedObjectType,
  exportName: string,
): Promise<void> => {
  const objectType = exportObj.departments.includes('Books') ? 'book' : 'product';
  const backgroundResponse = await chrome.runtime.sendMessage({ action: 'getCookies', payload: '.waivio.com' });
  if (!backgroundResponse.cookies || !backgroundResponse.cookies.length) return;
  const cookies = backgroundResponse.cookies as Cookie[];

  const accessTokenCookie = cookies.find((c) => c.name === 'access_token');
  if (!accessTokenCookie) {
    alert('Information about user not found, please login waivio');
  }

  const accessToken = accessTokenCookie?.value || '';

  const { result, error: userError } = await getUser(accessToken);
  if (userError) {
    alert(userError.message);
    return;
  }
  // eslint-disable-next-line no-underscore-dangle
  const user = result?._id ?? '';

  const jsonFormat = formatToJsonObject(exportObj);
  const jsonData = JSON.stringify(jsonFormat);

  const formData = new FormData();
  const jsonBlob = new Blob([jsonData], { type: 'application/json' });
  formData.append('file', jsonBlob, `${exportName}.json`);
  formData.append('user', user);
  formData.append('authority', 'administrative');
  formData.append('objectType', objectType);
  formData.append('useGPT', 'true');
  formData.append('forceImport', 'true');

  const headers = new Headers();
  headers.append('access-token', accessToken);

  fetch(EXTERNAL_URL.WAIVIO_IMPORT, {
    method: 'POST',
    body: formData,
    headers,
  })
    .then((response) => response.json())
    .then((result) => {
      alert('Import successfully started!');
    })
    .catch((error) => {
      alert(error.message);
    });
};
