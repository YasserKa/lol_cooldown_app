define([
  '../../windows/app/app-view.js',
  "../../scripts/constants/states.js",
  "../../scripts/services/parser.js",
  "../../scripts/services/gep-service.js",
  "../../scripts/services/client-service.js",
], function (
  AppView,
  States,
  Parser,
  GepService,
  ClientService,
  ) {
  class AppController {

    constructor() {
      this.appView = new AppView();

      this._inChampSelectEventUpdateListener = this._inChampSelectEventUpdateListener.bind(this);
      this._registerEvents = this._registerEvents.bind(this);
      this._inGameEventUpdateListener = this._inGameEventUpdateListener.bind(this);
    }

    // add listeners to services depending on the state (in-champselect/in-game)
    async run() {
      ClientService.updateStateChangedForAppListener(this._registerEvents);
      this._registerEvents();
    }

    async _registerEvents() {
      const state = await ClientService.getState();
      switch (state) {
        case States.IN_CHAMPSELECT:
          ClientService.updateChampSelectChangedListener(this._inChampSelectEventUpdateListener);
          this._inChampSelectEventUpdateListener(await ClientService.getChampSelectInfo());
          break;
        case States.IN_GAME:
          GepService.registerToGEP(this._inGameEventUpdateListener);
          this._inGameEventUpdateListener(await GepService.getInGameInfo());
          break;
      }
    }

    _inGameEventUpdateListener(data) {
      // TODO: get JSON.parse(data['game_data'])['mapNumber']
      // Using it from registering the function
      if (data.hasOwnProperty('feature') && data['feature'] === 'live_client_data') {
        data = data['info']['live_client_data'];
      }

      let parsedData = Parser.parseInGameData(data);

      if (Object.keys(parsedData).length > 0) {
        this.appView.updateInGame(parsedData);
      }
    }

    _inChampSelectEventUpdateListener(data) {
      if (data.hasOwnProperty('myTeam') && data['myTeam'].length > 0) {
        let parsedData = Parser.parseInChampSelectData(data);
        this.appView.updateInChampSelect(parsedData);
      }
    }
  }

  return AppController;
});
