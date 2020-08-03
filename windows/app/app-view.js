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
        this.updateHotkey = this.updateHotkey.bind(this);
        this._hotkey = document.getElementById("hotkey");
        // message sent after a change in settings to update the view
        overwolf.windows.onMessageReceived.addListener((message)=>{
            HtmlHandler.update(this.game);
        });
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

      updateHotkey(hotkey) {
        this._hotkey.textContent = hotkey;
      }
    }

    return AppView;
  });
