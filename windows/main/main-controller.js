define([
    'main-view.js',
    '../base-window-controller',
    "../../scripts/constants/window-names.js",
], function (
    MainView,
    BaseWindowController,
    WindowNames,
) {

    class MainController extends BaseWindowController {
        constructor() {
            super(MainView);
        }

        async run() {
            await super.run();
        }

        doBeforeWindowRestore() {
            super.doBeforeWindowRestore();
            // disable window flashing in taskbar
            overwolf.windows.flash(WindowNames.MAIN, overwolf.windows.enums.FlashBehavior.off);
            this._view.setWindowPosition();
        }

    }

    return MainController;
});
