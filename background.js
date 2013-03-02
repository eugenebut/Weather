var weatherLink = "";
var temperature;
var code;
var timeout;

function getWeather() {
    var options = {"enableHighAccuracy": true, "timeout": 10000, "maximumAge": 0}
    navigator.geolocation.getCurrentPosition(getWeatherForLocation, null, options);
}


function getWeatherForLocation(location) {
    var locationRequest = new XMLHttpRequest();
    var latituteAndLongitude = location.coords.latitude + ","  + location.coords.longitude;
    var woeId = localStorage["location-coordinates" + latituteAndLongitude];
    if (woeId) {
        getWeatherForWoeID(woeId);
        return;
    }

    locationRequest.open("GET", "http://where.yahooapis.com/geocode?location=" + latituteAndLongitude + "&gflags=R&appid=zHgnBS4m");
    locationRequest.onload = function() {
        var woeId = this.responseXML.getElementsByTagName("woeid")[0].childNodes[0].nodeValue;
        localStorage["location-coordinates" + latituteAndLongitude] = woeId;
        getWeatherForWoeID(woeId);
    }
    locationRequest.send()
}


function getWeatherForWoeID(woeId) {
    var weatherRequest = new XMLHttpRequest();
    weatherRequest.open("GET", "http://weather.yahooapis.com/forecastrss?u=" + localStorage["degrees"] + "&w=" + woeId);
    weatherRequest.onload = showWeather;
    weatherRequest.onerror = function () {
        // try to reload the weather again in 10 seconds
        timeout = window.setTimeout(getWeather, 10000);
    }
    weatherRequest.send();
}

function showWeather() {
    var channelNode = this.responseXML.getElementsByTagName("channel")[0];

    // get link and ttl
    var newWeatherLink = channelNode.getElementsByTagName("link")[0].childNodes[0].nodeValue;
    if ("" != newWeatherLink) {
        weatherLink = newWeatherLink
    }
    var ttl = channelNode.getElementsByTagName("ttl")[0].childNodes[0].nodeValue;

    // get temperature and code
    var itemNode = channelNode.getElementsByTagName("item")[0];
    var conditionNode = itemNode.getElementsByTagNameNS("*", "condition")[0];
    var newTemperature = conditionNode.attributes.getNamedItem("temp").nodeValue;
    var newCode = conditionNode.attributes.getNamedItem("code").nodeValue;

    // update temperature if necessary
    if (temperature != newTemperature) {
        chrome.browserAction.setBadgeText({text: newTemperature + "\u00B0" + localStorage["degrees"].toUpperCase()});
        temperature = newTemperature;
    }

    // update image if necessary
    if (code != newCode) {
        var image = document.getElementById("image");
        var canvas = document.getElementById("canvas");

        image.onload = function() {
            var context = canvas.getContext("2d");
//            context.fillStyle = "white";
//            context.fillRect(0,0,canvas.width, canvas.height);
//            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            context.drawImage(image, 0, 0, 27, 19);

            var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            chrome.browserAction.setIcon({imageData: imageData});
        };
        code = newCode;
//        image.src = "http://l.yimg.com/a/i/us/we/52/" + code + ".gif";

        image.src = "http://l.yimg.com/a/i/us/nws/weather/gr/" + code + "d.png";
    }

    // reload weather after cache is expired
    timeout = window.setTimeout(getWeather, parseInt(ttl) * 1000);
}


function updateDefaults() {
  var degrees = localStorage["degrees"];
  if (!degrees || degrees != "f" || degrees != "c") {
    localStorage["degrees"] = "f";
  }
}


function onInit() {
    updateDefaults();
    getWeather();
}


function onClick() {
    chrome.tabs.create({"url": weatherLink}, null)
}


function onMessage(request, sender, sendResponse) {
    if (request.action == "reloadWeather") {
        clearTimeout(timeout);
        temperature = "";
        getWeather();
    }
}


chrome.runtime.onInstalled.addListener(onInit);
chrome.browserAction.onClicked.addListener(onClick);
chrome.extension.onMessage.addListener(onMessage);
