console.log('i Am here')


function downloadObjectAsJson(exportObj, exportName){
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);
    console.log(sender);

    downloadObjectAsJson({test: 'test'}, 'test')
})
