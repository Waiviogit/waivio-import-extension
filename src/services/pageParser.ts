import { getCurrentTab, sendMessageToTab } from './chromeHelper';

export const PARSE_COMMANDS = {
  TO_JSON: 'to_json',
  TO_CSV: 'to_csv',
  TO_CLIPBOARD: 'to_clipboard',
};

const validatePage = (url: string):boolean => {
  const regex = /^https:\/\/www\.amazon[^\/]+\/dp\//;
  return regex.test(url);
};

export const sendMessageToContentScript = async (message: string): Promise<void> => {
  const tab = await getCurrentTab();
  const id = tab?.id;
  const url = tab?.url;
  if (!id || !url) return;

  if (!validatePage(url)) return alert('Url must be like https://www.amazon.com/dp/ASIN_NUMBER');

  await sendMessageToTab({ id, message });
};
