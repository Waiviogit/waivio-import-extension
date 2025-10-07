import { getActiveSiteList } from '../../clients/waivioApi';

export const activeSitesList: string[] = [];
let activeSitesPromise: Promise<string[]> | null = null;
let activeSitesClearTimer: number | null = null;

export const getActiveSites = async (): Promise<string[]> => {
  if (activeSitesList.length) return activeSitesList;
  if (activeSitesPromise) return activeSitesPromise;

  activeSitesPromise = (async () => {
    const list = await getActiveSiteList();
    const hosts = (list ?? []).map((el) => el.host);
    hosts.push('3speak.tv');
    activeSitesList.push(...hosts);

    if (activeSitesClearTimer) {
      clearTimeout(activeSitesClearTimer);
    }
    activeSitesClearTimer = window.setTimeout(() => {
      activeSitesList.length = 0;
      activeSitesPromise = null;
      activeSitesClearTimer = null;
    }, 5 * 60 * 1000);

    return activeSitesList;
  })();

  return activeSitesPromise;
};

export const generateUniqueId = (): string => `element_${Math.random().toString(36).substr(2, 9)}`;
