define([
    '../../windows/settings/settings-view.js',
], function (
    SettingsView,
) {

    class SettingsController {
        constructor() {
            this._settingsView = new SettingsView();
        }

        async run() {
        }
    }

    return SettingsController;
});
