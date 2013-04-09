function onInit() {
    var updater = new WeatherUpdater();
    updater.onupdate = function(temperature, icon, link, ttl) {
        chrome.browserAction.setBadgeText({text: temperature + "\u00B0" + getDegrees().toUpperCase()});
        chrome.browserAction.setIcon({imageData: icon});
        if (link) {
            updater.weatherLink = link;
        }
    }
    updater.reload();
}


function onClick() {
    chrome.tabs.create({url: WeatherUpdater().weatherLink}, null)
}


function onMessage(request, sender, sendResponse) {
    if (request.action == "reloadWeather") {
        WeatherUpdater().reload();
    }
}


chrome.runtime.onInstalled.addListener(onInit);
chrome.browserAction.onClicked.addListener(onClick);
chrome.extension.onMessage.addListener(onMessage);
