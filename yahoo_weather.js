function YahooWeatherRequest(appId) {
    this.onload = function() {};
    this.onerror = function() {};
    this.appId = appId;
}


YahooWeatherRequest.prototype.send = function(degrees, location) {
    // we don't need extremely high precision here
    var latitude = Math.round(location.coords.latitude * 1000) / 1000;
    var longitude = Math.round(location.coords.longitude * 1000) / 1000;
    var latituteAndLongitude = latitude + ","  + longitude;
    // lets check if we cached location woeID
    var storageKey = "location-coordinates" + latituteAndLongitude;
    var woeID = localStorage[storageKey];
    if (woeID) {
        this._requestWeatherForWoeID(degrees, woeID);
        return;
    }

    // lets find out location woid
    var locationRequest = new XMLHttpRequest();
    locationRequest.open("GET", "http://where.yahooapis.com/geocode?location=" + latituteAndLongitude + "&gflags=R&appid=" + this.appId);
    locationRequest.onload = this._onLoadLocation.bind(this, locationRequest, degrees, storageKey);
    locationRequest.onerror = this.onerror.bind(this);
    locationRequest.ontimeout = this.onerror.bind(this);
    locationRequest.send();
    console.log("Did locationRequest");
};


YahooWeatherRequest.prototype._requestWeatherForWoeID = function(degrees, woeId) {
    var weatherRequest = new XMLHttpRequest();
    weatherRequest.open("GET", "http://weather.yahooapis.com/forecastrss?u=" + degrees + "&w=" + woeId);
    weatherRequest.onload = this._onLoadWeather.bind(this, weatherRequest);
    weatherRequest.onerror = this.onerror.bind(this);
    weatherRequest.ontimeout = this.onerror.bind(this);
    weatherRequest.send();
    console.log("Did weatherRequest");
};


YahooWeatherRequest.prototype._onLoadLocation = function(request, degrees, storageKey) {
    if (request.status != 200) {
        this.onerror();
        return;
    }
    var woeIdNode = request.responseXML.getElementsByTagName("woeid")[0].childNodes[0];
    if (!woeIdNode) {
        this.onerror();
        return;
    }

    var woeId = woeIdNode.nodeValue;
    localStorage[storageKey] = woeId;
    this._requestWeatherForWoeID(degrees, woeId);
}


YahooWeatherRequest.prototype._onLoadWeather = function(request) {
    if (request.status != 200) {
        this.onerror();
        return;
    }

    var channelNode = request.responseXML.getElementsByTagName("channel")[0];

    // get link and ttl
    var link = channelNode.getElementsByTagName("link")[0].childNodes[0].nodeValue;
    var ttl = channelNode.getElementsByTagName("ttl")[0].childNodes[0].nodeValue;

    // get temperature and code
    var itemNode = channelNode.getElementsByTagName("item")[0];
    var conditionNode = itemNode.getElementsByTagNameNS("*", "condition")[0];
    var temperature = conditionNode.attributes.getNamedItem("temp").nodeValue;
    var code = conditionNode.attributes.getNamedItem("code").nodeValue;

    // create image
    var reportWeatherCallback = this.onload.bind(this);
    var image = new Image();
    image.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.height = 19;
        canvas.width = 19;
        var context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, 27, 19);
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        reportWeatherCallback(temperature, imageData, link, ttl);
    }
    image.onerror = this.onerror.bind();
    image.src = "http://l.yimg.com/a/i/us/nws/weather/gr/" + code + "d.png";
    console.log("Did image.src");
}
