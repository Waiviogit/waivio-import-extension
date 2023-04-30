import Tab = chrome.tabs.Tab;

const getCurrentTab = (callback: (tab: Tab) => void): void => {
    chrome.tabs.query({active:true, currentWindow:true},(tab) => {
        callback(tab[0]); //call the callback with argument
    });
}

const saveJSON = (tab: Tab): void => {
   chrome.tabs.sendMessage(tab?.id ?? 1, 'saveJSON')
}

const saveCSV = (tab: Tab): void => {
    chrome.tabs.sendMessage(tab?.id ?? 1, 'saveJSON')
}

export const parsePageJSON = ():void => getCurrentTab(saveJSON);

export const parsePageCSV = ():void => getCurrentTab(saveCSV);

