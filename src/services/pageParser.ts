import { getCurrentTab, sendMessageToTab } from './chromeHelper';

export const PARSE_COMMANDS = {
  TO_JSON: 'to_json',
  TO_CSV: 'to_csv',
  TO_CLIPBOARD: 'to_clipboard',
  SCAN_ASINS: 'scan_asins',
  IMPORT_WAIVIO: 'import_waivio',
};

export const sendMessageToContentScript = async (message: string): Promise<void> => {
  const tab = await getCurrentTab();
  const id = tab?.id;
  const url = tab?.url;
  if (!id || !url) return;

  await sendMessageToTab({ id, message: { action: message, payload: url } });
};
