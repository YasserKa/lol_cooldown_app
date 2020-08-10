define([
    '../../windows/settings/settings-view.js',
    "../../scripts/services/settings.js",
    "../../scripts/services/hotkeys-service.js",
    "../../scripts/helpers/utils.js",
], function (
    SettingsView,
    Settings,
    HotkeysService,
    Utils,
) {

    class SettingsController {
        constructor() {
            this._settingsView = new SettingsView();

            this._updateVersion = this._updateVersion.bind(this);
        }

        async run() {
            this._updateHotkey = this._updateHotkey.bind(this);
            // update hotkey view and listen to changes
            this._updateHotkey();
            this._updateVersion();

            HotkeysService.addHotkeyChangeListener(this._updateHotkey);

            // minute/second cooldown display
            let cooldownDisplay = Settings.getSetting('cooldownDisplay');
            var cooldownDisplayEl = $('input[value="' + cooldownDisplay + '"]');
            cooldownDisplayEl.prop("checked", true);
            cooldownDisplayEl.parent().addClass('active');
            $('input[name="cooldown-display"]').click(function () {
                let cooldownDisplay = $("input[name='cooldown-display']:checked").val();
                Settings.setSetting('cooldownDisplay', cooldownDisplay)
            });

            // show hide cooldownreduction elements
            let cooldownRedDisplay = Settings.getSetting('cooldownReductionDisplay') ? 'show' : 'hide';
            var cooldownRedDisplayEl = $('input[value="' + cooldownRedDisplay + '"]');
            cooldownRedDisplayEl.prop("checked", true);
            cooldownRedDisplayEl.parent().addClass('active');
            $('input[name="cooldown-reduction-display"]').click(function () {
                let cooldownRedDisplay = $("input[name='cooldown-reduction-display']:checked").val() === 'show' ? true : false;
                Settings.setSetting('cooldownReductionDisplay', cooldownRedDisplay)
            });

        }

        async _updateHotkey() {
            const hotkey = await HotkeysService.getToggleHotkey();
            this._settingsView.updateHotkey(hotkey);
        }

        _updateVersion() {
            const version = Utils.getAppVersion();
            this._settingsView.updateVersion(version);
        }
    }

    return SettingsController;
});
