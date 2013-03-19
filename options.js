function restoreOptions() {
  // Restore degrees
  document.getElementById("degrees_" + getDegrees()).checked = "checked";
}


function updateDegrees(sender) {
    setDegrees(sender.target.value);
    chrome.extension.sendMessage({action: "reloadWeather"});
}


restoreOptions();

document.getElementById("degrees_c").addEventListener("click", updateDegrees);
document.getElementById("degrees_f").addEventListener("click", updateDegrees);
