define([
    'settings-view.js',
    '../base-window-controller',
], function (
    SettingsView,
    BaseWindowController,
) {

    class SettingsController extends BaseWindowController{
        constructor() {
            super(SettingsView);
        }

        async run() {
            await super.run();
        }
    }

    return SettingsController;
});
