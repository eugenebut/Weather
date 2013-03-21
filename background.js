function WeatherUpdater() {
    if (arguments.callee._singletonInstance) {
        return arguments.callee._singletonInstance;
    }
    arguments.callee._singletonInstance = this;

    this.weatherLink = null;
    this._timeout = null;
}


WeatherUpdater.prototype.reload = function() {
    window.clearTimeout(this._timeout);

    var options = {"enableHighAccuracy": false, "timeout": 60000, "maximumAge": 60000}
    navigator.geolocation.getCurrentPosition(this._onLoadLocation, this.reload, options);
};


WeatherUpdater.prototype._onLoadLocation = function(location) {
    var weatherRequest = new YahooWeatherRequest();

    weatherRequest.onload = function(temperature, icon, link, ttl) {
        chrome.browserAction.setBadgeText({text: temperature + "\u00B0" + getDegrees().toUpperCase()});
        chrome.browserAction.setIcon({imageData: icon});
        this.weatherLink = link || this.weatherLink;
        this._timeout = window.setTimeout(getWeather, parseInt(ttl) * 1000);
    }

    weatherRequest.onerror = function() {
        this._timeout = window.setTimeout(getWeather, 10000);
    }

    weatherRequest.send(location, getDegrees());
}


function onInit() {
    var updater = new WeatherUpdater();
    updater.reload();
}


function onClick() {
    chrome.tabs.create({"url": WeatherUpdater().weatherLink}, null)
}


function onMessage(request, sender, sendResponse) {
    if (request.action == "reloadWeather") {
        WeatherUpdater().reload();
    }
}


chrome.runtime.onInstalled.addListener(onInit);
chrome.browserAction.onClicked.addListener(onClick);
chrome.extension.onMessage.addListener(onMessage);
