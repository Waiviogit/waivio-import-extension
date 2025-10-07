import { EXTERNAL_URL } from '../content-script/constants';

export type ActiveSite = {
    host: string
}

export const getActiveSiteList = async (): Promise<ActiveSite[]> => {
  try {
    const response = await fetch(EXTERNAL_URL.WAIVIO_ACTIVE_SITES_LIST);
    const result = await response.json();
    return result as ActiveSite[];
  } catch (error) {
    return [];
  }
};
