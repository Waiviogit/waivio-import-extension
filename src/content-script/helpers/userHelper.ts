import { getUser } from './downloadWaivioHelper';
import Cookie = chrome.cookies.Cookie;

export type waivioUserType = {
    userName: string
    accessToken: string
    guestName: string
    auth: Cookie | undefined

}

export const getWaivioUserInfo = async (): Promise<waivioUserType|null> => {
  const backgroundResponse = await chrome.runtime.sendMessage({ action: 'getCookies', payload: '.waivio.com' });
  if (!backgroundResponse.cookies || !backgroundResponse.cookies.length) return null;
  const cookies = backgroundResponse.cookies as Cookie[];

  const accessTokenCookie = cookies.find((c) => c.name === 'access_token');
  if (!accessTokenCookie) {
    alert('Please sign in to Waivio in a separate tab.');
    return null;
  }

  const accessToken = accessTokenCookie?.value || '';
  const auth = cookies.find((c) => c.name === 'auth');
  const guestName = cookies.find((c) => c.name === 'guestName')?.value ?? '';
  const authString = auth?.value?.replace(/%22/g, '"').replace(/%2C/g, ',');

  const {
    result: hiveUser,
    error: userError,
  } = await getUser(accessToken, authString, guestName);
  if (userError) {
    alert('Please sign in to Waivio in a separate tab.');
    return null;
  }
  // eslint-disable-next-line no-underscore-dangle

  return {
    // eslint-disable-next-line no-underscore-dangle
    userName: hiveUser?._id ?? '',
    accessToken,
    auth,
    guestName,
  };
};
