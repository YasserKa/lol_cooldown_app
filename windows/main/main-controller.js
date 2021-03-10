define([
    'main-view.js',
    '../base-window-controller',
    '../../scripts/constants/states.js',
    "../../scripts/constants/window-names.js",
], function (
    MainView,
    BaseWindowController,
    States,
    WindowNames,
) {

    class MainController extends BaseWindowController {
        constructor() {
            super(MainView);
            this._mainWindow = overwolf.windows.getMainWindow();
            this._stateService = this._mainWindow.stateService;
            this._hotkeyEl = document.getElementById("hotkey-wrapper");
            $(this._hotkeyEl).css('display', 'block');
        }

        async run() {
            await super.run();
        }

        doBeforeWindowRestore() {
            super.doBeforeWindowRestore();
            // if player was in game display
            let prevState = this._stateService.getAppWindowPreviousState();
            // show ad after finishing a game
            // if (prevState === States.IN_GAME) {
            this._view.displayAd();
            // }
            // disable window flashing in taskbar
            overwolf.windows.flash(WindowNames.MAIN, overwolf.windows.enums.FlashBehavior.off);
            // this._view.setWindowPosition();
        }

    }

    return MainController;
});
