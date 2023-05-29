import Tab = chrome.tabs.Tab;

type messageType = {
  action: string,
  payload: string
}

interface sendMessageToTabInterface {
    id: number;
    message: messageType;
}

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
