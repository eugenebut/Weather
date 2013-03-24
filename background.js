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
    var options = {enableHighAccuracy: false, timeout: 60000, maximumAge: 60000}
    navigator.geolocation.getCurrentPosition(this._onLoadLocation.bind(this),
                                             this._reloadAfterTimeout.bind(this, 10000),
                                             options);
    console.log("Did getCurrentPosition");
};


WeatherUpdater.prototype._reloadAfterTimeout = function(timeout) {
    console.log("Reload scheduled");
    this._timeout = window.setTimeout(this.reload.bind(this), timeout);
}

WeatherUpdater.prototype._onLoadLocation = function(location) {
    var updater = this;
    var weatherRequest = new YahooWeatherRequest();
    weatherRequest.onload = function(temperature, icon, link, ttl) {
        chrome.browserAction.setBadgeText({text: temperature + "\u00B0" + getDegrees().toUpperCase()});
        chrome.browserAction.setIcon({imageData: icon});
        if (link) {
            updater.weatherLink = link;
        }
        updater._reloadAfterTimeout(10000);
    }
    weatherRequest.onerror = this._reloadAfterTimeout.bind(this, 10000);
    weatherRequest.send(getDegrees(), location);
    console.log("Did weatherRequest");
}


function onInit() {
    var updater = new WeatherUpdater();
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
