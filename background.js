var frequency = 60000; // 60 seconds
var weather_link = '';
var temperature;
var code;
var image = document.getElementById('image');
var canvas = document.getElementById('canvas');


function getWeather() {
    options = {'enableHighAccuracy': true, 'timeout': 10000, 'maximumAge': 0}
    navigator.geolocation.getCurrentPosition(getWeatherForLocation, null, options);
}


function getWeatherForLocation(location) {
    var location_request = new XMLHttpRequest();
    location_request.open('GET', 'http://where.yahooapis.com/geocode?location=' + location.coords.latitude + ','  + location.coords.longitude + '&gflags=R&appid=zHgnBS4m');
    location_request.onload = function() {

        var woeId = this.responseXML.getElementsByTagName("woeid")[0].childNodes[0].nodeValue;

        var weather_request = new XMLHttpRequest();
        weather_request.open('GET', 'http://weather.yahooapis.com/forecastrss?u=c&w=' + woeId);
        weather_request.onload = showWeather;
        weather_request.send()
    }
    location_request.send()
}


function showWeather() {
    var channelNode = this.responseXML.getElementsByTagName("channel")[0];
    var linkNode = channelNode.getElementsByTagName("link")[0];
    weather_link = linkNode.childNodes[0].nodeValue;
    var itemNode = channelNode.getElementsByTagName("item")[0];
    var conditionNode = itemNode.getElementsByTagNameNS("*", "condition")[0];
    var newTemperature = conditionNode.attributes.getNamedItem("temp").nodeValue;
    var newCode = conditionNode.attributes.getNamedItem("code").nodeValue;

    if (temperature != newTemperature) {
        chrome.browserAction.setBadgeText({text: newTemperature + "\u00B0C"});
        temperature = newTemperature;
    }

    if (code != newCode) {
        image.onload = function() {
            var context = canvas.getContext('2d');
            context.fillStyle = "white";
            context.fillRect(0,0,canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            chrome.browserAction.setIcon({imageData: imageData});
        };
        code = newCode;
    }
    image.src = 'http://l.yimg.com/a/i/us/we/52/' + code + '.gif';
}


function onInit() {
    getWeather();
    setInterval(getWeather, frequency);
}


function onClick() {
    chrome.tabs.create({'url': weather_link}, null)
}


chrome.runtime.onInstalled.addListener(onInit);
chrome.browserAction.onClicked.addListener(onClick);
