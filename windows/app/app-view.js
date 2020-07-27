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
        if (!this._inGameUpdate) {
          this._init(data);
          this._inGameUpdate = true;
        }
        this.update(data);
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
