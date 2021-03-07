define([
    'settings-view.js',
    '../base-window-controller',
    "../../scripts/constants/window-names.js",
    "../../scripts/services/windows-service.js",
], function (
    SettingsView,
    BaseWindowController,
    WindowNames,
    WindowsService,
) {

    class SettingsController extends BaseWindowController{
        constructor() {
            super(SettingsView);
        }

        async run() {
            await super.run();

            // WindowsService.centerWindow(WindowNames.SETTINGS);
        }
    }

    return SettingsController;
});
