import Tab = chrome.tabs.Tab;
import { EXTENSION_COMMANDS } from '../common/constants';

type messageType = {
  action: string,
  payload: string
  buttonId: string
  buttonText: string
  source?: string | undefined
}

interface sendMessageToTabInterface {
    id: number;
    message: messageType;
}

type extensionMessageType = {
  action: string
  id: string
  buttonText: string
  source?: string | undefined
}

const enableButton = (id:string, buttonText:string): void => {
  const button = document.querySelector<HTMLButtonElement>(`#${id}`);
  if (!button) return;
  button.disabled = false;
  button.innerText = buttonText;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const data = message as extensionMessageType;
  switch (data.action) {
    case EXTENSION_COMMANDS.ENABLE:
      enableButton(
        data.id,
        data.buttonText,
      );
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
