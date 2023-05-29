import { EXTERNAL_URL } from '../constants';

export const extractASINs = (links:string[]): string[] => {
  const asins = links.map((link) => {
    const match = link.match(/\/dp\/([A-Z0-9]+)/);
    return match ? match[1] : null;
  });

  return asins
    .filter((asin) => asin !== null)
    .filter((el, index, self) => index === self.indexOf(el)) as string[];
};
export const formatAsins = (array: string[]): string => array.map((item) => `asins:${item}`).join(' OR ');

export const fetchData = async (url:string, data: any) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
  }
};

export const getAsinsFromPage = async (): Promise<string> => {
  const asins = Array.from(document.querySelectorAll('li'))
    .map((li) => li.getAttribute('data-asin'))
    .filter((el) => !!el);

  const links = Array.from(document.querySelectorAll('a'))
    .map((anchor) => anchor.href)
    .filter((el) => !!el);

  const jointAsins = [...asins, ...extractASINs(links)]
    .filter((el, index, self) => index === self.indexOf(el));

  const notImported = await fetchData(
    EXTERNAL_URL.WAIVIO_IMPORT_NOT_PUBLISHED,
    { asins: jointAsins },
  );

  return formatAsins(notImported);
};
