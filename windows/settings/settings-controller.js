define([
    '../../windows/settings/settings-view.js',
    "../../scripts/services/settings.js",
    "../../scripts/helpers/utils.js",
], function (
    SettingsView,
    Settings,
    Utils,
) {

    class SettingsController {
        constructor() {
            this._settingsView = new SettingsView();
        }

        async run() {
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
    }

    return SettingsController;
});
