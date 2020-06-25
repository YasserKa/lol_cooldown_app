function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

$(document).ready(function() {

    // Settings modal
    initializeSettingModal();

    $('input[name="cooldown-display"]').click(function() {
        var cooldownDisplay = $("input[name='cooldown-display']:checked").val();
        setCookie('cooldownDisplay', cooldownDisplay, 360);
        setSetting('cooldownDisplay', cooldownDisplay);
        updateCooldownDisplaySetting();

    });

    $('input[name="theme"]').click(function() {
        var theme = $("input[name='theme']:checked").val();
        setCookie('theme', theme, 360);
        setSetting('theme', theme);
        updateThemeSetting( theme);
    });
    // $('#settings-modal').modal('show');
});


let settings = {}

function initializeSettingModal() {
    // Restoring cookies
    let cooldownDisplay = getCookie('cooldownDisplay') === null ? 'seconds' : getCookie('cooldownDisplay');
    var cooldownDisplayEl = $('input[value="'+cooldownDisplay+'"]');
    cooldownDisplayEl.prop("checked", true);
    cooldownDisplayEl.parent().addClass('active');


    let theme = getCookie('theme') === null ? 'light' : getCookie('theme');
    var themeEl = $('input[value="'+theme+'"]');
    themeEl.prop("checked", true);
    themeEl.parent().addClass('active');

    setSetting('cooldownDisplay', cooldownDisplay);
    setSetting('theme', theme);

}

function updateThemeSetting(theme) {
    $('body').removeClass('dark').removeClass('light');
    $('body').addClass(theme);
}

function updateCooldownDisplaySetting() {
    // Update the UI if in a match
    if (typeof map !== 'undefined')
        updateAllParticipantsUI();
}

function setSetting(setting, value) {
    settings[setting] = value;
}
