define([
    "../../scripts/constants/states.js",
    "../../scripts/constants/window-names.js",
    "../../scripts/services/windows-service.js",
    "../../scripts/services/hotkeys-service.js",
    "../../scripts/services/state-service.js",
    "../../scripts/services/settings.js",
    "../../scripts/services/dataHandler.js",
    "../../scripts/services/testing.js",
], function (
    States,
    WindowNames,
    WindowsService,
    HotkeysService,
    StateService,
    Settings,
    DataHandler,
    Testing,
) {
    class BackgroundController {

        static async run() {
            // saving stateService instance for app-controller
            window.stateService = StateService;
            window.settings = Settings;
            window.dataHandler = DataHandler;

            this._registerHotkeys();

            // testing
            if (Testing.isTesting()) {
                await this._onStateChanged(Testing.getState());
            } else {
                // close/open windows upon state change
                StateService.addListener(StateService.LISTENERS.STATE_CHANGE, this._onStateChanged);
                await StateService.init();
                this._onStateChanged(await StateService.getState());
            }

            overwolf.windows.onStateChanged.addListener(this._onWindowStateChanged);
        }

        // on client state change (idle/in-champselect/in-game)
        static async _onStateChanged(state) {
            await BackgroundController._updateWindows(state);
        }

        static async _updateWindows(state) {
            switch (state) {
                case States.IDLE:
                    console.log("ERE");
                    await WindowsService.restoreWindowOnlyIfNotOpen(WindowNames.MAIN);
                    break;
                case States.IN_CHAMPSELECT:
                case States.IN_GAME:
                    // a state used for testing
                case States.CHAMPSELECT_TO_GAME:
                    await WindowsService.restoreWindowOnlyIfNotOpen(WindowNames.APP);
                    break;
            }
        }

        static _onWindowStateChanged(state) {
            // don't refresh/remove ad when dealing with setting window
            if (state.window_state_ex === 'closed') {
                Settings.removeListener(`${state.window_name}_view_scale`);
            }
        }

        static _registerHotkeys() {
            HotkeysService.setToggleHotkey(async () => {
                const state = await WindowsService.getWindowState(WindowNames.APP);
                if (state === "minimized" || state === "closed") {
                    WindowsService.restore(WindowNames.APP);
                } else if (state === "normal" || state === "maximized") {
                    WindowsService.minimize(WindowNames.APP);
                    WindowsService.close(WindowNames.SETTINGS);
                    WindowsService.close(WindowNames.FEEDBACK);
                }
            });
        }
    }

    return BackgroundController;
});
