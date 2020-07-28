define([
  "../../scripts/constants/states.js",
  "../../scripts/constants/window-names.js",
  "../../scripts/services/client-service.js",
  "../../scripts/services/windows-service.js",
  "../../scripts/services/testing.js",
], function (
  States,
  WindowNames,
  ClientService,
  WindowsService,
  Testing,
) {
  class BackgroundController {

    static async run() {
      this._initialized = false
      this._currentState = States.NONE;


      if (Testing.isTesting()) {
        BackgroundController._updateWindows(Testing.getState());
      } else {
        // open the appropriate window depending on the state
        await this._init();
        // close/open windows upon state change
        ClientService.updateStateChangedListener(this._onStateChanged);
      }
    }

    static async _init() {
      const state = await ClientService.getState();
      BackgroundController._updateWindows(state)
      this._initialized = true;
    }

    // on client state change (idle/in-champselect/in-game)
    static _onStateChanged(state) {
      BackgroundController._updateWindows(state);
    }

    static async _updateWindows(state) {
      switch (state) {
        case States.IDLE:
          // open at the start or if transitioning from another state
          if (!this._initialized || this._currentState !== States.IDLE) {
            WindowsService.openWindowOnlyIfNotOpen(WindowNames.MAIN);
          }
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
  }

  return BackgroundController;
});