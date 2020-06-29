define(["../SampleAppView.js", "../../scripts/services/htmlHandler.js"],
  function (SampleAppView,
    HtmlHandler) {
    class AppView extends SampleAppView {

      _initialized = false;

      constructor() {
        super();

        this.updateInGame = this.updateInGame.bind(this);
        this.updateInChampSelect = this.updateInChampSelect.bind(this);
      }

      _init(data) {
        HtmlHandler.initializeView(data);
        this._initialized = true;
      }

      /**
       * updates the page using this data
       * @param {myTeam:
       * , yourTeam:...}
       */
      updateInChampSelect(data) {
        if (!this._initialized) {
          this._init(data);
        }
        HtmlHandler.update(data);
      }
      // TODO: Parse data from champ select
      // TODO: Parse data from in-game
      // TODO: feed parsed data to html handler

      /**
       * updates the page using this data
       * @param {myTeam:
       * , yourTeam:...}
       */
      updateInGame(data) {
        if (!this._initialized) {
          this._init(data);
        }
        HtmlHandler.update(data);
      }
    }

    return AppView;
  });
