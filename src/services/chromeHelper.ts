import Tab = chrome.tabs.Tab;
import { EXTENSION_COMMANDS } from '../common/constants';
import { getGooglePlace, getGooglePlaceId } from './createGoogleObject';

type messageType = {
  action: string,
  payload: string
  buttonId?: string
  buttonText?: string
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
  payload?: string | undefined
}

const enableButton = (id:string, buttonText:string): void => {
  const button = document.querySelector<HTMLButtonElement>(`#${id}`);
  if (!button) return;
  button.disabled = false;
  button.innerText = buttonText;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const data = message as extensionMessageType;

  if (data.action === EXTENSION_COMMANDS.ENABLE) {
    enableButton(
      data.id,
      data.buttonText,
    );
    return true;
  }

  if (data.action === EXTENSION_COMMANDS.CREATE_GOOGLE_OBJECT) {
    getGooglePlace(message.payload)
      .then((res) => sendResponse(res))
      .catch((err) => { console.log(err); sendResponse(); });

    return true; // Indicates that sendResponse will be called asynchronously
  }

  if (data.action === EXTENSION_COMMANDS.GET_GOOGLE_OBJECT_ID) {
    getGooglePlaceId(message.payload)
      .then((res) => sendResponse(res))
      .catch((err) => { console.log(err); sendResponse(); });

    return true; // Indicates that sendResponse will be called asynchronously
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

export const getStorageKey = async (key = 'googleApiKey'): Promise<string> => {
  const object = await chrome.storage.local.get('googleApiKey');
  return object[key];
};

export const captureVisibleTab = async (): Promise<string | undefined> => {
  try {
    const response = await chrome.runtime.sendMessage({ action: EXTENSION_COMMANDS.CAPTURE_VISIBLE_TAB });
    if (response && response.dataUrl) return response.dataUrl as string;
    if (response && response.error) {
      console.error('captureVisibleTab error:', response.error);
    }
  } catch (error) {
    console.error(error);
  }
};
