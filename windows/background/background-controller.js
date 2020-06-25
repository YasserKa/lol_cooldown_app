define([
  "../../scripts/constants/window-names.js",
  "../../scripts/constants/states.js",
  "../../scripts/services/client-service.js",
  "../../scripts/services/windows-service.js",
  "../../scripts/services/gep-service.js",
  "../../scripts/services/event-bus.js",
], function (
  WindowNames,
  States,
  ClientService,
  WindowsService,
  GepService,
  EventBus,
) {
  class BackgroundController {
    static async run() {
      window.ow_eventBus = EventBus;

      await this._initialize();

      ClientService.addStateChangedListener(this._onStateChanged);
      ClientService.addChampSelectChangedListener(this._triggerBus);
    }

    static _onStateChanged(state) {
      this._updateWindows(state);
    }

    /**
     * Open the relevant window on app launch
     * @private
     */
    static async _initialize() {
      const state = await ClientService.getState();
      this._updateWindows(state)
    }

    static async _updateWindows(state) {
      const openWindows = await WindowsService.getOpenWindows();

      switch (state) {
        case States.IDLE:
          // State could be already IDLE
          if (openWindows.hasOwnProperty(WindowNames.MAIN)) {
            return;
          }
          await WindowsService.restore(WindowNames.MAIN);
          await WindowsService.close(WindowNames.APP);
          break;
        case States.IN_CHAMPSELECT:
          await WindowsService.restore(WindowNames.APP);
          await WindowsService.close(WindowNames.MAIN);

          break;
        case States.IN_GAME:
          GepService.registerToGEP(this._triggerBus);
          break;
      }
    }

    static _triggerBus(data) {
      window.ow_eventBus.trigger(data);
    }
  }

  return BackgroundController;
});