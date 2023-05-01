import Tab = chrome.tabs.Tab;

interface sendMessageToTabInterface {
    id: number;
    message: string;
}

export const PARSE_COMMANDS = {
    TO_JSON: 'to_json',
    TO_CSV: 'to_csv'
}

const getCurrentTab = async (): Promise<Tab | undefined> => {
    try {
        const [tab] = await  chrome.tabs.query({active:true, currentWindow:true});
        return tab
    } catch (error) {
        console.error(error)
    }
}

const sendMessageToTab = async ({id, message}:sendMessageToTabInterface): Promise<void> => {
    try {
        await chrome.tabs.sendMessage(id, message)
    } catch (error) {
        console.error(error)
    }
}

export const parsePage = async (message: string): Promise<void> => {
    const tab = await getCurrentTab()
    const id = tab?.id
    if(!id) return
    await sendMessageToTab({id, message})
};

