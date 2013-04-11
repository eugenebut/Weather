function onInit() {
    var updater = new WeatherUpdater();
    updater.degrees = getDegrees();
    updater.onupdate = function(temperature, icon) {
        chrome.browserAction.setBadgeText({text: temperature + "\u00B0" + getDegrees().toUpperCase()});
        chrome.browserAction.setIcon({imageData: icon});
    }
    updater.reload();
}


function onClick() {
    chrome.tabs.create({url: WeatherUpdater().weatherLink}, null)
}


function onMessage(request, sender, sendResponse) {
    if (request.action == "reloadWeather") {
        WeatherUpdater().degrees = getDegrees();
        WeatherUpdater().reload();
    }
}


chrome.runtime.onInstalled.addListener(onInit);
chrome.browserAction.onClicked.addListener(onClick);
chrome.extension.onMessage.addListener(onMessage);
