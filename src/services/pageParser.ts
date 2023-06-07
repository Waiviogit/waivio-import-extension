import { getCurrentTab, sendMessageToTab } from './chromeHelper';

export const sendMessageToContentScript = async (event: Event, message: string): Promise<void> => {
  const tab = await getCurrentTab();
  const id = tab?.id;
  const url = tab?.url;
  if (!id || !url) return;

  const target = event.target as HTMLButtonElement;
  target.disabled = true;

  await sendMessageToTab({ id, message: { action: message, payload: url, buttonId: target.id } });
};
