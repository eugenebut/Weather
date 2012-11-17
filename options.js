function restore_options() {
  // Restore degrees

    var degrees = localStorage["degrees"];
    if (!degrees) {
        alert('no default degrees');
        return;
    }

    document.getElementById("degrees_" + degrees).checked = "checked";
}


function set_degrees(sender) {
    localStorage["degrees"] = sender.target.value;
}


restore_options();

document.getElementById('degrees_c').addEventListener('click', set_degrees);
document.getElementById('degrees_f').addEventListener('click', set_degrees);
