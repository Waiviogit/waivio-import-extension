import formBusinessObject from './formBusinessObject';
import { randomNameGenerator } from '../helpers/commonHelper';
import { EXTERNAL_URL } from '../constants';
import { getUser } from '../helpers/downloadWaivioHelper';
import Cookie = chrome.cookies.Cookie;

const uploadBusinessToWaivio = async (type?: string):Promise<void> => {
  const business = await formBusinessObject();
  if (!business) return;

  const exportName = randomNameGenerator(8);

  const objectType = type || 'business';

  const backgroundResponse = await chrome.runtime.sendMessage({ action: 'getCookies', payload: '.waivio.com' });
  if (!backgroundResponse.cookies || !backgroundResponse.cookies.length) return;
  const cookies = backgroundResponse.cookies as Cookie[];

  const accessTokenCookie = cookies.find((c) => c.name === 'access_token');
  if (!accessTokenCookie) {
    alert('Please sign in to Waivio in a separate tab.');
    return;
  }

  const accessToken = accessTokenCookie?.value || '';

  const auth = cookies.find((c) => c.name === 'auth');
  const authString = auth?.value?.replace(/%22/g, '"').replace(/%2C/g, ',');

  const { result: hiveUser, error: userError } = await getUser(accessToken, authString);
  if (userError) {
    alert('Please sign in to Waivio in a separate tab.');
    return;
  }
  // eslint-disable-next-line no-underscore-dangle
  const user = hiveUser?._id ?? '';

  const jsonData = JSON.stringify(business);

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
  headers.append('hive-auth', auth ? 'true' : 'false');

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

export default uploadBusinessToWaivio;
