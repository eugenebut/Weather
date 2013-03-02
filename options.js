function restoreOptions() {
  // Restore degrees

    var degrees = localStorage["degrees"];
    if (degrees) {
        document.getElementById("degrees_" + degrees).checked = "checked";
    }
}


function setDegrees(sender) {
    localStorage["degrees"] = sender.target.value;
    chrome.extension.sendMessage({action: "reloadWeather"});
}


restoreOptions();

document.getElementById("degrees_c").addEventListener("click", setDegrees);
document.getElementById("degrees_f").addEventListener("click", setDegrees);
