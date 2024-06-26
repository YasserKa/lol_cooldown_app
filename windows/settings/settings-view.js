define([
    '../base-view.js',
    '../../scripts/services/settings.js',
    '../../scripts/helpers/utils.js',
], function (
    BaseView,
    Settings,
    Utils,
) {

    class SettingsView extends BaseView {
        constructor() {
            super();

            this._version = document.getElementById("version");
            this._mainWindow = overwolf.windows.getMainWindow();
            this._settings = this._mainWindow.settings;

            this._initCooldownTime = this._initCooldownTime.bind(this);

            // minute/second cooldown display
            this._initCooldownTime();
            // show hide cooldownreduction elements
            // this._initCooldownRedDisplay();
            // on off ult relevant Cd
            this._initRelevantUltCd();
            // ui mode
            this._initUIMode();
            // show hide cooldownreduction elements
            this._initWindowScale();
            // timer sound
            this._initTimerSound();

            this._updateVersion();

            // updating tool-top package
            tippy('[data-toggle="tooltip"]', {
                appendTo: 'parent',
                allowHTML: true,
            });
        }

        _initCooldownTime() {
            let settingValue = this._settings.getSetting(this._settings.SETTINGS.CD_TIME);
            this._activateSettingEl(settingValue);
            let elements = document.querySelectorAll('input[name="cooldown-time"]');

            Array.from(elements).forEach(el => {
                el.addEventListener("click", () => {
                    let cooldownTime = $("input[name='cooldown-time']:checked").val();
                    this._settings.setSetting(this._settings.SETTINGS.CD_TIME, cooldownTime)
                });
            });
        }


        _initWindowScale() {
            let  settingValue = this._settings.getSetting(this._settings.SETTINGS.WINDOW_SCALE);
            this._activateSettingEl(settingValue);
            let elements = document.querySelectorAll('input[name="window-scale"]');

            Array.from(elements).forEach(el => {
                el.addEventListener("click", () => {
                    let windowScale = $("input[name='window-scale']:checked").val();
                    this._settings.setSetting(this._settings.SETTINGS.WINDOW_SCALE, windowScale)
                });
            });
        }

        _initTimerSound() {
            let  settingValue = this._settings.getSetting(this._settings.SETTINGS.TIMER_SOUND);
            this._activateSettingEl(settingValue);
            let elements = document.querySelectorAll('input[name="timer-sound"]');

            Array.from(elements).forEach(el => {
                el.addEventListener("click", () => {
                    let timerSound = $("input[name='timer-sound']:checked").val();
                    switch (timerSound) {
                        case Settings.TIMER_SOUND.None:
                            break;
                        case Settings.TIMER_SOUND.Bell:
                            Utils.makeBellSound();
                            break;
                        case Settings.TIMER_SOUND.Speech:
                            Utils.makeSoundAfterSummonerSpellIsUp("Annie", "Flash");
                            break;
                    }

                    this._settings.setSetting(this._settings.SETTINGS.TIMER_SOUND, timerSound)
                });
            });
        }

        _initCooldownRedDisplay() {
            let settingValue = this._settings.getSetting(this._settings.SETTINGS.CD_RED_DISPLAY) ? 'show' : 'hide';
            this._activateSettingEl(settingValue);
            let elements = document.querySelectorAll('input[name="cooldown-reduction-display"]');

            Array.from(elements).forEach(el => {
                el.addEventListener("click", () => {
                    let cooldownRedDisplay = $("input[name='cooldown-reduction-display']:checked").val() === 'show' ? true : false;
                    this._settings.setSetting(this._settings.SETTINGS.CD_RED_DISPLAY, cooldownRedDisplay)
                });
            });
        }

        _initRelevantUltCd() {
            let settingValue = this._settings.getSetting(this._settings.SETTINGS.RELEVANT_ULT_CD) ? "on" : "off" ;
            this._activateSettingEl(settingValue);
            let elements = document.querySelectorAll('input[name="relevant-ult-cd"]');

            Array.from(elements).forEach(el => {
                el.addEventListener("click", () => {
                    let relevantUltCd = $("input[name='relevant-ult-cd']:checked").val() === "on" ? true : false;
                    this._settings.setSetting(this._settings.SETTINGS.RELEVANT_ULT_CD, relevantUltCd)
                });
            });
        }

        _initUIMode() {
            let  settingValue = this._settings.getSetting(this._settings.SETTINGS.UI_MODE);
            this._activateSettingEl(settingValue);
            let elements = document.querySelectorAll('input[name="ui-mode"]');

            Array.from(elements).forEach(el => {
                el.addEventListener("click", () => {
                    let uiMode = $("input[name='ui-mode']:checked").val();

                    this._settings.setSetting(this._settings.SETTINGS.UI_MODE, uiMode)
                });
            });
        }


        _activateSettingEl(settingValue) {
            let cooldownRedDisplayEl = $('input[value="' + settingValue + '"]');
            cooldownRedDisplayEl.prop("checked", true);
            cooldownRedDisplayEl.parent().addClass('active');
        }

        async _updateVersion() {
            const version = await Utils.getAppVersion();
            this._version.textContent = `v ${version}`;
        }
    }

    return SettingsView;
});
