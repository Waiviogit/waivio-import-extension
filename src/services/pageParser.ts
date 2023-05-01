import {getCurrentTab, sendMessageToTab} from "./chromeHelper";

export const PARSE_COMMANDS = {
    TO_JSON: 'to_json',
    TO_CSV: 'to_csv'
}

export const sendMessageToContentScript = async (message: string): Promise<void> => {
    const tab = await getCurrentTab()
    const id = tab?.id
    if(!id) return
    await sendMessageToTab({id, message})
};

