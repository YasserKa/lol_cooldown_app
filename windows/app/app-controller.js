define([
  '../../windows/app/app-view.js',
  "../../scripts/constants/states.js",
  "../../scripts/services/parser.js",
  "../../scripts/services/gep-service.js",
  "../../scripts/services/client-service.js",
  "../../scripts/services/testing.js",
], function (
  AppView,
  States,
  Parser,
  GepService,
  ClientService,
  Testing,
  ) {
  class AppController {

    constructor() {
      this.appView = new AppView();
      this._participantRunes = {};

      this._inChampSelectEventUpdateListener = this._inChampSelectEventUpdateListener.bind(this);
      this._registerEvents = this._registerEvents.bind(this);
      this._inGameEventUpdateListener = this._inGameEventUpdateListener.bind(this);
    }

    // add listeners to services depending on the state (in-champselect/in-game)
    async run() {
      if (Testing.isTesting()) {
        if (Testing.getState() === States.IN_CHAMPSELECT) {
          this._inChampSelectEventUpdateListener(Testing.getData());
        } else if (Testing.getState() === States.IN_GAME) {
          this._inGameEventUpdateListener(Testing.getData());
        }
      } else {
        ClientService.updateStateChangedForAppListener(this._registerEvents);
        const state = await ClientService.getState();
        this._registerEvents(state);

      }
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
      // TODO: get JSON.parse(data['game_data'])['mapNumber']
      // Using it from registering the function
      if (data.hasOwnProperty('feature') && data['feature'] === 'live_client_data') {
        data = data['info']['live_client_data'];
      }

      // attributes to parse
      if (!data.hasOwnProperty('all_players') && !data.hasOwnProperty('events')) {
        return;
      }

      // if (Object.keys(this._participantRunes).length === 0) {
      //   _updateRunesUsingServer((participantRunes) => {
      //     this._participantRunes = JSON.parse(participantRunes);
      //   });
      // }
      this._participantRunes = {
        'Clumsy Gamer': {
          perkIds: [5007, 8106, 8134, 8210, 8347],
          perkStyle: 8000,
          perkSubStyle: 8200,
        }
      };

      data['participantRunes'] = this._participantRunes;

      let parsedData = Parser.parseInGameData(data);

      this.appView.updateInGame(parsedData);
    }

    _inChampSelectEventUpdateListener(data) {
      if (data.hasOwnProperty('myTeam') && data['myTeam'].length > 0) {
        let parsedData = Parser.parseInChampSelectData(data);
        this.appView.updateInChampSelect(parsedData);
      }
    }
  }

  async function _updateRunesUsingServer(callback) {
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


  return AppController;
});
