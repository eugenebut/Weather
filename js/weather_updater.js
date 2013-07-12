function WeatherUpdater() {
    if (arguments.callee._singletonInstance) {
        return arguments.callee._singletonInstance;
    }
    arguments.callee._singletonInstance = this;

    this.onupdate = function() {};
    this.onerror = function() {};
    this.retryTimeout = 10000;

    this._degrees = 'f';
    this._weatherLink = null;
    this._timeout = null;
}


WeatherUpdater.prototype = {
    get degrees() {
        return this._degrees;
    },
    set degrees(newDegrees) {
        if ('f' == newDegrees || 'c' == newDegrees) {
            this._degrees = newDegrees;
        }
    },
    get weatherLink() {
        return this._weatherLink;
    }
};


WeatherUpdater.prototype.reload = function() {
    window.clearTimeout(this._timeout);
    var options = {enableHighAccuracy: false, timeout: this.retryTimeout, maximumAge: 60000};
    var updater = this;
    navigator.geolocation.getCurrentPosition(
        function (location) {
            updater._onLoadLocation(location);
        },
        function() {
            updater.onerror();
            updater._reloadAfterTimeout(updater.retryTimeout);
        },
        options
    );
    console.log("reload");
};


WeatherUpdater.prototype._reloadAfterTimeout = function(timeout) {
    console.log("Reload scheduled in: " + timeout);
    this._timeout = window.setTimeout(this.reload.bind(this), timeout);
}


WeatherUpdater.prototype._onLoadLocation = function(location) {
    var updater = this;
    var appId = "7LIl5JvV34E1wo7ujvlh6ivuccahBqwykIMfQqn9j6abo535A64Hc7Zvqb3qZ7gxA5jhiFSCnEZQz04KBPnxYvY9kBAnDUs";
    var weatherRequest = new YahooWeatherRequest(appId);
    weatherRequest.onload = function(temperature, icon, link, ttl) {
        updater._weatherLink = link;
        updater.onupdate(temperature, icon);
        updater._reloadAfterTimeout(ttl * 1000);
    }
    weatherRequest.onerror = function() {
        console.log("Error from weather request");
        updater._reloadAfterTimeout(updater, updater.retryTimeout);
        updater.onerror();
    }

    weatherRequest.send(this.degrees, location);
    console.log("Did weatherRequest");
}
