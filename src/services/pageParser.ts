import { getCurrentTab, sendMessageToTab } from './chromeHelper';

export const sendMessageToContentScript = async (
  event: Event,
  action: string,
  source?: string,
): Promise<void> => {
  const tab = await getCurrentTab();
  const id = tab?.id;
  const url = tab?.url;
  if (!id || !url) return;

  const target = event.target as HTMLButtonElement;
  const buttonText = target.innerText;
  target.disabled = true;
  target.innerText = '';

  await sendMessageToTab({
    id,
    message: {
      action,
      payload: url,
      buttonId: target.id,
      buttonText,
      source,
    },
  });
};
