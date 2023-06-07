import Tab = chrome.tabs.Tab;
import { EXTENSION_COMMANDS } from '../common/constants';

type messageType = {
  action: string,
  payload: string
  buttonId: string
}

interface sendMessageToTabInterface {
    id: number;
    message: messageType;
}

type extensionMessageType = {
  action: string
  id: string
}

const enableButton = (id:string): void => {
  const button = document.querySelector<HTMLButtonElement>(`#${id}`);
  if (!button) return;
  button.disabled = false;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const data = message as extensionMessageType;
  switch (data.action) {
    case EXTENSION_COMMANDS.ENABLE:
      enableButton(data.id);
      break;
    default: break;
  }
});

export const getCurrentTab = async (): Promise<Tab | undefined> => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  } catch (error) {
    console.error(error);
  }
};

export const sendMessageToTab = async ({
  id, message,
}:sendMessageToTabInterface): Promise<void> => {
  try {
    await chrome.tabs.sendMessage(id, message);
  } catch (error) {
    console.error(error);
  }
};
