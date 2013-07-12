function getDegrees() {
    var result = localStorage["degrees"];
    if (!result || (result != "f" && result != "c")) {
        result = "f";
        localStorage["degrees"] = result;
    }
    return result;
}

function setDegrees(newValue) {
    localStorage["degrees"] = newValue;
}
