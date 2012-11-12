var frequency = 60000; // 60 seconds
var request;
var link = '';
var temperature;
var code;
var image = document.getElementById('image');
var canvas = document.getElementById('canvas');


function getWeather() {
    request = new XMLHttpRequest();
    request.open('GET', 'http://weather.yahooapis.com/forecastrss?w=2502265&u=c');
    request.onload = showWeather;
    request.send()
}


function showWeather() {
    var channelNode = request.responseXML.getElementsByTagName("channel")[0];
    var linkNode = channelNode.getElementsByTagName("link")[0];
    link = linkNode.childNodes[0].nodeValue;
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
    chrome.tabs.create({'url': link}, null)
}


chrome.runtime.onInstalled.addListener(onInit);
chrome.browserAction.onClicked.addListener(onClick);
