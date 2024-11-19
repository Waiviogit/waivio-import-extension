const USER_AGENT_STRING = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)';

export const fetchTiktok = async (url:string): Promise<string> => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT_STRING,
    },
  });

  return response.text();
};

export const getTikTokDesc = (content: string): string => {
  const split = content.split('{"itemInfo":{"itemStruct":')[1];
  const cutTo = split.indexOf(',"video":');
  const jsonString = split.slice(0, cutTo);
  return JSON.parse(`${jsonString}}`).desc;
};
