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

      constructor() {
        super();

        this.update = this.update.bind(this);
      }

      /**
       * @param {:
       *   blueTeam: [{
       *   name,
       *   champion,
       *   position,
       *   level,
       *   spells,
       *   perks,
       *   items,
       * }, ...]
       * , redTeam:...}
       */
      _init(data) {
        this.game = new Game(data);
        HtmlHandler.initializeView(this.game);

        this._initialized = true;
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
