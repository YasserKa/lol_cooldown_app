define([
  '../../windows/app/app-view.js',
  "../../scripts/constants/states.js",
  "../../scripts/services/parser.js",
  "../../scripts/services/gep-service.js",
  "../../scripts/services/client-service.js",
  "../../scripts/services/hotkeys-service.js",
  "../../scripts/services/testing.js",
], function (
  AppView,
  States,
  Parser,
  GepService,
  ClientService,
  HotkeysService,
  Testing,
) {
  class AppController {

    constructor() {
      this._appView = new AppView();
      this._participantRunes = {};

      this._inChampSelectEventUpdateListener = this._inChampSelectEventUpdateListener.bind(this);
      this._registerEvents = this._registerEvents.bind(this);
      this._inGameEventUpdateListener = this._inGameEventUpdateListener.bind(this);
      this._updateHotkey = this._updateHotkey.bind(this);
    }

    // add listeners to services depending on the state (in-champselect/in-game)
    async run() {
      if (Testing.isTesting()) {
        switch (Testing.getState()) {
          case States.IN_CHAMPSELECT:
            this._inChampSelectEventUpdateListener(Testing.getInChampSelectData());
            break;
          case States.IN_GAME:
            this._inGameEventUpdateListener(Testing.getInGameData());
            break;
          case States.CHAMPSELECT_TO_GAME:
            this._inChampSelectEventUpdateListener(Testing.getInChampSelectData());
            setTimeout(() => {
              this._inGameEventUpdateListener(Testing.getInGameData());
            }, 2000);
            break;
        }
      } else {
        ClientService.updateStateChangedForAppListener(this._registerEvents);
        const state = await ClientService.getState();
        this._registerEvents(state);

      }

      // update hotkey view and listen to changes
      this._updateHotkey();
      HotkeysService.addHotkeyChangeListener(this._updateHotkey);
    }

    async _registerEvents(state) {
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
      // using it from registering the function
      if (data.hasOwnProperty('feature') && data['feature'] === 'live_client_data') {
        data = data['info']['live_client_data'];
      }

      // attributes to parse
      if (!data.hasOwnProperty('all_players') && !data.hasOwnProperty('events')) {
        return;
      }

      if (!Testing.isTesting()) {
        // if (Object.keys(this._participantRunes).length === 0) {
        //   _updateRunesUsingServer((participantRunes) => {
        //     this._participantRunes = JSON.parse(participantRunes);
        //   });
        // }
        data.participantRunes = {
          'Clumsy Gamer': {
            perkIds: [5007, 8106, 8134, 8210, 8347],
            perkStyle: 8000,
            perkSubStyle: 8200,
          }
        };
      }

      let parsedData = Parser.parseInGameData(data);

      this._appView.updateInGame(parsedData);
    }

    _inChampSelectEventUpdateListener(data) {
      if (data.hasOwnProperty('myTeam') && data['myTeam'].length > 0) {
        let parsedData = Parser.parseInChampSelectData(data);
        this._appView.updateInChampSelect(parsedData);
      }
    }

    async _updateRunesUsingServer(callback) {
      let summonerInfo = await ClientService.getSummonerInfo();
      summonerInfo['summonerName'] = '#random';
      let summonerName = encodeURIComponent(summonerInfo['summonerName']);
      let region = encodeURIComponent(summonerInfo['region']);
      let path = `https://www.lolcooldown.com/api/matchrunes?summonerName=${summonerName}&region=${region}`;

      let xhr = new XMLHttpRequest();

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            callback(xhr.response);
          } else {
            callback({});
          }
        }
      };

      xhr.open("GET", path, false);
      xhr.send();
    }

    async _updateHotkey() {
      const hotkey = await HotkeysService.getToggleHotkey();
      this._appView.updateHotkey(hotkey);
    }
  }


  return AppController;
});
