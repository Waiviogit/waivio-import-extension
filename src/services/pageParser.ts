
// @ts-ignore
function getCurrentTab(callback){ //Take a callback
    chrome.tabs.query({active:true, currentWindow:true},function(tab){
        callback(tab[0]); //call the callback with argument
    });
}

// @ts-ignore
function displayTab (tab){
    console.log(tab)//define your callback function
   chrome.tabs.sendMessage(tab.id, 'ssdfsasdf')
}



export const parseProductPage = ():void => {
    getCurrentTab(displayTab);
}
