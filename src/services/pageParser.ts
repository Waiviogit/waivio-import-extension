import { getCurrentTab, sendMessageToTab } from './chromeHelper';

export const PARSE_COMMANDS = {
  TO_JSON: 'to_json',
  TO_CSV: 'to_csv',
  TO_CLIPBOARD: 'to_clipboard',
  SCAN_ASINS: 'scan_asins',
};

const validatePage = (url: string):boolean => {
  const regex = /^https:\/\/www\.amazon[^\/]+\/dp\//;

  const result = regex.test(url);
  if (!result) {
    alert('Url must be like https://www.amazon.com/dp/ASIN_NUMBER');
  }
  return result;
};

const validatePageForAsin = (url: string):boolean => {
  const regex = /^https:\/\/www\.amazon\./;

  const result = regex.test(url);
  if (!result) {
    alert('Url must has amazon domain https://www.amazon.com');
  }
  return result;
};

const urlValidation = (url: string, message: string):boolean => {
  const validationType = {
    [PARSE_COMMANDS.TO_JSON]: validatePage,
    [PARSE_COMMANDS.TO_CSV]: validatePage,
    [PARSE_COMMANDS.TO_CLIPBOARD]: validatePage,
    [PARSE_COMMANDS.SCAN_ASINS]: validatePageForAsin,
  };
  const type = message as keyof typeof PARSE_COMMANDS;

  return validationType[type](url);
};

export const sendMessageToContentScript = async (message: string): Promise<void> => {
  const tab = await getCurrentTab();
  const id = tab?.id;
  const url = tab?.url;
  if (!id || !url) return;

  if (!urlValidation(url, message)) return;

  await sendMessageToTab({ id, message });
};
