function WeatherUpdater() {
    if (arguments.callee._singletonInstance) {
        return arguments.callee._singletonInstance;
    }
    arguments.callee._singletonInstance = this;

    this.onupdate = function() {};
    this.degrees = 'f';
    this.weatherLink = null;
    this.retryTimeout = 10000;

    this._timeout = null;
}


WeatherUpdater.prototype.reload = function() {
    window.clearTimeout(this._timeout);
    var options = {enableHighAccuracy: false, timeout: this.retryTimeout, maximumAge: 60000}
    navigator.geolocation.getCurrentPosition(this._onLoadLocation.bind(this),
        this._reloadAfterTimeout.bind(this, this.retryTimeout),
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
        this.weatherLink = link;
        updater.onupdate(temperature, icon);
        updater._reloadAfterTimeout(ttl * 1000);
    }
    weatherRequest.onerror = this._reloadAfterTimeout.bind(this, this.retryTimeout);
    weatherRequest.send(this.degrees, location);
    console.log("Did weatherRequest");
}
