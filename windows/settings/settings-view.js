define([
    '../base-view.js',
    '../../scripts/helpers/utils.js',
    "../../scripts/services/settings.js",
], function (
    BaseView,
    Utils,
    Settings,
) {

    class SettingsView extends BaseView {
        constructor() {
            super();

            this._version = document.getElementById("version");

            // minute/second cooldown display
            this._initCooldownDisplaySetting();
            // show hide cooldownreduction elements
            this._initCooldownRedDisplay();

            this._updateVersion();
        }

        _initCooldownDisplaySetting() {
            let cooldownDisplay = Settings.getSetting('cooldownDisplay');
            this._activateSettingEl(cooldownDisplay);
            $('input[name="cooldown-display"]').click(function () {
                let cooldownDisplay = $("input[name='cooldown-display']:checked").val();
                Settings.setSetting('cooldownDisplay', cooldownDisplay)
            });
        }

        _initCooldownRedDisplay() {
            let cooldownRedDisplay = Settings.getSetting('cooldownReductionDisplay') ? 'show' : 'hide';
            this._activateSettingEl(cooldownRedDisplay);
            $('input[name="cooldown-reduction-display"]').click(function () {
                let cooldownRedDisplay = $("input[name='cooldown-reduction-display']:checked").val() === 'show' ? true : false;
                Settings.setSetting('cooldownReductionDisplay', cooldownRedDisplay)
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
