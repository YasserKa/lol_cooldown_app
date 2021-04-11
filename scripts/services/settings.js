define([
], function (
) {
    const SETTINGS = {
       CD_TIME: 'cooldown_time',
        CD_RED_DISPLAY: 'cooldown_reduction_display',
        WINDOW_SCALE: 'window_scale',
        WINDOW_WIDTH: 'window_width',
        WINDOW_HEIGHT: 'window_height',
        FIRST_RUN: 'first_run',
        RESIZE: 'resize',
        TIMER_SOUND: 'timer_sound',
    }

    const TIMER_SOUND = {
        None : "none",
        Bell : "bell",
        Speech : "speech",
    }

    const DEFAULT_SETTINGS = {};
    DEFAULT_SETTINGS[SETTINGS.CD_TIME] = 'minutes';
    DEFAULT_SETTINGS[SETTINGS.CD_RED_DISPLAY] = true;
    DEFAULT_SETTINGS[SETTINGS.WINDOW_SCALE] = 1;
    DEFAULT_SETTINGS[SETTINGS.FIRST_RUN] = true;
    DEFAULT_SETTINGS[SETTINGS.RESIZE] = false;
    DEFAULT_SETTINGS[SETTINGS.TIMER_SOUND] = TIMER_SOUND.Bell;

    let _settings = {};
    let _listeners = {};

    function setSetting(setting, value) {
        _update();
        _settings[setting] = value;
        localStorage.setItem("settings", JSON.stringify(_settings));
        if (
            setting.substring(0,12) !== SETTINGS.WINDOW_WIDTH &&
            setting.substring(0,13) !== SETTINGS.WINDOW_HEIGHT &&
            setting.substring(0,9) !== SETTINGS.FIRST_RUN &&
            setting.substring(0,6) !== SETTINGS.RESIZE
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
        TIMER_SOUND,
        setSetting,
        getSetting,
        addListener,
        removeListener,
        getSettingWindowHeight,
        getSettingWindowWidth,
    }
});
