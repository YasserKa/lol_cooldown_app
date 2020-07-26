define([
  "../SampleAppView.js", 
"../../scripts/services/htmlHandler.js",
"../../scripts/classes/Game.js",
],
  function (
    SampleAppView,
    HtmlHandler,
    Game) {
    class AppView extends SampleAppView {

      _initialized = false;
      _inGameUpdate = false;

      constructor() {
        super();

        this.update = this.update.bind(this);
      }

      _init(data) {
        this.game = new Game(data);
        HtmlHandler.initializeView(this.game);

        this._initialized = true;
      }

      updateInChampSelect(data) {
        this.update(data);
      }

      updateInGame(data) {
        this.update(data);
        if (!this._inGameUpdate &&
          (
            (data['redTeam'].length > 0 && data['redTeam'][0].hasOwnProperty('summonerName')) ||
            (data['blueTeam'].length > 0 && data['blueTeam'][0].hasOwnProperty('summonerName')))
        ) {
          this.game.updateForInGame(data);
          this.game.update(data);
          HtmlHandler.updateViewForInGame(this.game);
          this.update(data);
          this._inGameUpdate = true;
        }
      }

      update(data) {
        if (!this._initialized) {
          this._init(data);
        }
        this.game.update(data);
        HtmlHandler.update(this.game);
      }
    }

    return AppView;
  });
