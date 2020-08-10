define([
    "../../scripts/constants/states.js",
    "../../scripts/constants/window-names.js",
    "../../scripts/services/windows-service.js",
    "../../scripts/services/hotkeys-service.js",
    "../../scripts/services/state-service.js",
    "../../scripts/services/testing.js",
], function (
    States,
    WindowNames,
    WindowsService,
    HotkeysService,
    StateService,
    Testing,
) {
    class BackgroundController {

        static async run() {
            // saving stateService instance for app-controller
            window.stateService = StateService;

            this._registerHotkeys();

            // testing
            if (Testing.isTesting()) {
                BackgroundController._updateWindows(Testing.getState());
            } else {
                // close/open windows upon state change
                StateService.addListener(StateService.LISTENERS.STATE_CHANGE, this._onStateChanged);
                await StateService.init();
                this._onStateChanged(await StateService.getState());
            }
        }

        // on client state change (idle/in-champselect/in-game)
        static _onStateChanged(state) {
            BackgroundController._updateWindows(state);
        }

        static async _updateWindows(state) {
            switch (state) {
                case States.IDLE:
                    WindowsService.openWindowOnlyIfNotOpen(WindowNames.MAIN);
                    break;
                case States.IN_CHAMPSELECT:
                case States.IN_GAME:
                    // a state used for testing
                case States.CHAMPSELECT_TO_GAME:
                    WindowsService.openWindowOnlyIfNotOpen(WindowNames.APP);
                    break;
            }
            this._currentState = state;
        }

        static _registerHotkeys() {
            HotkeysService.setToggleHotkey(async () => {
                const state = await WindowsService.getWindowState(WindowNames.APP);
                if (state === "minimized" || state === "closed") {
                    WindowsService.restore(WindowNames.APP);
                } else if (state === "normal" || state === "maximized") {
                    WindowsService.minimize(WindowNames.APP);
                    WindowsService.close(WindowNames.SETTINGS);
                }
            });
        }
    }

    return BackgroundController;
});
