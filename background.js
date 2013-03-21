var weatherLink = null;
var timeout = null;

function getWeather() {
    var options = {"enableHighAccuracy": false, "timeout": 60000, "maximumAge": 60000}
    navigator.geolocation.getCurrentPosition(getWeatherForLocation, getWeather, options);
}


function getWeatherForLocation(location) {
    var weatherRequest = new YahooWeatherRequest();

    weatherRequest.onload = function(temperature, icon, link, ttl) {
        chrome.browserAction.setBadgeText({text: temperature + "\u00B0" + getDegrees().toUpperCase()});
        chrome.browserAction.setIcon({imageData: icon});
        weatherLink = link || weatherLink;
        timeout = window.setTimeout(getWeather, parseInt(ttl) * 1000);
    }

    weatherRequest.onerror = function() {
        // try to reload the weather again in 10 seconds
        timeout = window.setTimeout(getWeather, 10000);
    }

    weatherRequest.send(location, getDegrees());
}


function onInit() {
    getWeather();
}


function onClick() {
    chrome.tabs.create({"url": weatherLink}, null)
}


function onMessage(request, sender, sendResponse) {
    if (request.action == "reloadWeather") {
        clearTimeout(timeout);
        getWeather();
    }
}


chrome.runtime.onInstalled.addListener(onInit);
chrome.browserAction.onClicked.addListener(onClick);
chrome.extension.onMessage.addListener(onMessage);
