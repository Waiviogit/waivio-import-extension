import formBusinessObject from './formBusinessObject';
import { randomNameGenerator } from '../helpers/commonHelper';
import { EXTERNAL_URL } from '../constants';
import { getUser } from '../helpers/downloadWaivioHelper';
import Cookie = chrome.cookies.Cookie;

const uploadBusinessToWaivio = async ():Promise<void> => {
  const business = await formBusinessObject();
  if (!business) return;

  const exportName = randomNameGenerator(8);

  const objectType = 'business';

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
