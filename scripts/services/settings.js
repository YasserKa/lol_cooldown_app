define([
], function (
) {
    const SETTINGS = {
       CD_TIME: 'cooldown_time',
        CD_RED_DISPLAY: 'cooldown_reduction_display',
        WINDOW_SCALE: 'window_scale',
        WINDOW_WIDTH: 'window_width',
        WINDOW_HEIGHT: 'window_height',
    }

    const DEFAULT_SETTINGS = {};
    DEFAULT_SETTINGS[SETTINGS.CD_TIME] = 'minutes';
    DEFAULT_SETTINGS[SETTINGS.CD_RED_DISPLAY] = true;
    DEFAULT_SETTINGS[SETTINGS.WINDOW_SCALE] = 1;

    let _settings = {};
    let _listeners = {};

    function setSetting(setting, value) {
        _update();
        _settings[setting] = value;
        localStorage.setItem("settings", JSON.stringify(_settings));
        if (
            setting.substring(0,12) !== SETTINGS.WINDOW_WIDTH &&
            setting.substring(0,13) !== SETTINGS.WINDOW_HEIGHT
        ) {
            onSettingsUpdate(_settings);
        }
    }


    function addListener(key, listener) {
        _listeners[key] = listener;
    }

    function removeListener(key) {
        delete _listeners[key];
    }

    function onSettingsUpdate(settings) {
        Object.values(_listeners).forEach((listener) => {
            listener(settings);
        });
    }

    function getSettingWindowWidth(setting, value) {
        _update();
        setting = SETTINGS.WINDOW_WIDTH+setting;
        if (!_settings.hasOwnProperty(setting)) {
            setSetting(setting, value);
        }
        return _settings[setting];
    }

    function getSettingWindowHeight(setting, value) {
        _update();
        setting = SETTINGS.WINDOW_HEIGHT+setting;
        if (!_settings.hasOwnProperty(setting)) {
            setSetting(setting, value);
        }
        return _settings[setting];
    }


    function getSetting(setting) {
        _update();
        return _settings[setting];
    }

    // an update is needed to get settings from local storage
    function _update() {
        // background-controller is giving error that localStorage is null for
        // an unknown reason
        if (localStorage === null) {
            return;
        }

        _settings = JSON.parse(localStorage.getItem("settings"));
        _settings = _settings === null ? {} : _settings;

        for (let [key, value] of Object.entries(DEFAULT_SETTINGS)) {
            if (!_settings.hasOwnProperty(key)) {
                _settings[key] = value;
            }
        }
    }

    return {
        SETTINGS,
        setSetting,
        getSetting,
        addListener,
        removeListener,
        getSettingWindowHeight,
        getSettingWindowWidth,
    }
});
