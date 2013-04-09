function WeatherUpdater() {
    if (arguments.callee._singletonInstance) {
        return arguments.callee._singletonInstance;
    }
    arguments.callee._singletonInstance = this;

    this.onupdate = function() {};
    this.weatherLink = null;
    this._timeout = null;
    this._retryTimeout = 10000;
}


WeatherUpdater.prototype.reload = function() {
    window.clearTimeout(this._timeout);
    var options = {enableHighAccuracy: false, timeout: this._retryTimeout, maximumAge: 60000}
    navigator.geolocation.getCurrentPosition(this._onLoadLocation.bind(this),
        this._reloadAfterTimeout.bind(this, this._retryTimeout),
        options);
    console.log("Did getCurrentPosition");
};


WeatherUpdater.prototype._reloadAfterTimeout = function(timeout) {
    console.log("Reload scheduled in: " + timeout);
    this._timeout = window.setTimeout(this.reload.bind(this), timeout);
}


WeatherUpdater.prototype._onLoadLocation = function(location) {
    var updater = this;
    var weatherRequest = new YahooWeatherRequest();
    weatherRequest.onload = function(temperature, icon, link, ttl) {
        updater.onupdate(temperature, icon, link, ttl);
        updater._reloadAfterTimeout(ttl * 1000);
    }
    weatherRequest.onerror = this._reloadAfterTimeout.bind(this, this._retryTimeout);
    weatherRequest.send(getDegrees(), location);
    console.log("Did weatherRequest");
}