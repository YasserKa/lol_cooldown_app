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
      _firstInGameUpdate = false;

      constructor() {
        super();

        this._update = this._update.bind(this);
      }

      _init(data) {
        this.game = new Game(data);
        HtmlHandler.initializeView(this.game);

        this._initialized = true;
      }

      updateInChampSelect(data) {
        this._update(data);
      }

      updateInGame(data) {
        if (!this._firstInGameUpdate) {
          this._init(data);
          this._firstInGameUpdate = true;
        }
        this._update(data);
      }

      _update(data) {
        if (!this._initialized) {
          this._init(data);
        }
        this.game.update(data);
        HtmlHandler.update(this.game);
      }
    }

    return AppView;
  });
