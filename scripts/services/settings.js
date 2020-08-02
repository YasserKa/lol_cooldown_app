define([
  "../../scripts/constants/window-names.js",
],
  function (
      WindowNames
    ) {

    const DEFAULT_SETTINGS = {
        cooldownDisplay: 'minutes',
        cooldownReductionDisplay: true,
    };

    let _settings = {};

    function setSetting(setting, value) {
        _update();
        _settings[setting] = value;
        localStorage.setItem("settings", JSON.stringify(_settings));
        overwolf.windows.sendMessage(WindowNames.APP, '1', 'hello second window', ()=>{})
    }

    function getSetting(setting) {
        _update();
        return _settings[setting];
    }

    function _update() {
      _settings = JSON.parse(localStorage.getItem("settings"));
      _settings = _settings === null ? DEFAULT_SETTINGS : _settings;
    }

    return {
        setSetting,
        getSetting,
    }
  });