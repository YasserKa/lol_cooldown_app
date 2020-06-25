define([
  '../../windows/app/app-view.js',
  "../../scripts/services/parser.js",
], function (
  AppView,
  Parser,
  ) {
  class AppController {

    constructor() {
      this.appView = new AppView();

      this._infoUpdateHandler = this._infoUpdateHandler.bind(this);
      this._eventListener = this._eventListener.bind(this);
    }

    run() {
      // listen to events from the event bus from the main window,
      // the callback will be run in the context of the current window
      let mainWindow = overwolf.windows.getMainWindow();
      mainWindow.ow_eventBus.addListener(this._eventListener);
      console.log('ending run');
    }

    async _updateHotkey() {
      this.AppView.updateHotkey(hotkey);
    }

    _eventListener(data) {
      console.log('triggering listener');
      this._infoUpdateHandler(data);
    }

    // Logs info updates
    _infoUpdateHandler(data) {
      console.log(data);
      if (data.hasOwnProperty('myTeam') && data['myTeam'].length > 0) {
        let parsedData = {
          'myTeam': {
            'participants': Parser.getTeamData(data['myTeam']),
            'color': data['myTeam'][0]['team'] === 1 ? 'blue' : 'red',
          }
          ,
          'theirTeam': { 
            'participants': Parser.getTeamData(data['theirTeam']),
            // theirTeam can be empty, so take the opposite of the myTeam
            'color': data['myTeam'][0]['team'] === 1 ? 'red' : 'blue',
          }
        }
        this.appView.updateInChampSelect(parsedData);
      }
      if (data.hasOwnProperty('feature') && data['feature'] === 'live_client_data') {
        this.appView.updateInGame(data);
      }
    }
  }

  return AppController;
});
