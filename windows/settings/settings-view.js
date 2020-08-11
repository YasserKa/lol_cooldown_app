define([
    '../base-view.js',
    '../../scripts/helpers/utils.js',
], function (
    BaseView,
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
            this._initCooldownRedDisplay();
            // show hide cooldownreduction elements
            this._initWindowScale();

            this._updateVersion();
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

        _activateSettingEl(settingValue) {
            let cooldownRedDisplayEl = $('input[value="' + settingValue + '"]');
            cooldownRedDisplayEl.prop("checked", true);
            cooldownRedDisplayEl.parent().addClass('active');
        }

        async _updateVersion() {
            const version = await Utils.getAppVersion();
            this._version.textContent = version;
        }
    }

    return SettingsView;
});
