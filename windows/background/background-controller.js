define([
  "../../scripts/constants/states.js",
  "../../scripts/constants/window-names.js",
  "../../scripts/services/client-service.js",
  "../../scripts/services/windows-service.js",
], function (
  States,
  WindowNames,
  ClientService,
  WindowsService,
) {
  class BackgroundController {
    static async run() {
      // open the appropriate window depending on the state
      await this._initialize();
      // close/open windows upon state change
      ClientService.updateStateChangedListener(this._onStateChanged);
    }

    // Initialize app
    static async _initialize() {
      const state = await ClientService.getState();
      BackgroundController._updateWindows(state)
    }

    // On client state change (idle/in-champselect/in-game)
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
          WindowsService.openWindowOnlyIfNotOpen(WindowNames.APP);
          break;
      }
    }
  }

  return BackgroundController;
});