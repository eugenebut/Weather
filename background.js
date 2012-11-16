var weather_link = '';
var temperature;
var code;


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

    // get link and ttl
    weather_link = channelNode.getElementsByTagName("link")[0].childNodes[0].nodeValue;
    ttl = channelNode.getElementsByTagName("ttl")[0].childNodes[0].nodeValue;

    // get temperature and code
    var itemNode = channelNode.getElementsByTagName("item")[0];
    var conditionNode = itemNode.getElementsByTagNameNS("*", "condition")[0];
    var newTemperature = conditionNode.attributes.getNamedItem("temp").nodeValue;
    var newCode = conditionNode.attributes.getNamedItem("code").nodeValue;

    // update temperature if necessary
    if (temperature != newTemperature) {
        chrome.browserAction.setBadgeText({text: newTemperature + "\u00B0C"});
        temperature = newTemperature;
    }

    // update image if necessary
    if (code != newCode) {
        var image = document.getElementById('image');
        var canvas = document.getElementById('canvas');

        image.onload = function() {
            var context = canvas.getContext('2d');
//            context.fillStyle = "white";
//            context.fillRect(0,0,canvas.width, canvas.height);
//            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            context.drawImage(image, 0, 0, 27, 19);

            var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            chrome.browserAction.setIcon({imageData: imageData});
        };
        code = newCode;
//        image.src = 'http://l.yimg.com/a/i/us/we/52/' + code + '.gif';

        image.src = 'http://l.yimg.com/a/i/us/nws/weather/gr/' + code + 'd.png';
    }

    // reload weather after cache is expired
    window.setTimeout(getWeather, parseInt(ttl) * 1000);
}


function onInit() {
    getWeather();
}


function onClick() {
    chrome.tabs.create({'url': weather_link}, null)
}


chrome.runtime.onInstalled.addListener(onInit);
chrome.browserAction.onClicked.addListener(onClick);
