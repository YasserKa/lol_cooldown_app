define([
    "../base-view.js",
    "../../scripts/classes/Game.js",
    "../../scripts/services/htmlHandler.js",
], function (
    BaseView,
    Game,
    HtmlHandler,
) {
    class AppView extends BaseView {

        constructor() {
            super();
            this._firstInGameUpdate = false;
            this._firstChampSelectUpdate = false;

            this._update = this._update.bind(this);
            this._hotkeyEl = document.getElementById("hotkey-wrapper");

            // update view when settings are updated
            this._settings.addListener('app_view', (settings) => {
                HtmlHandler.update(this.game);
            });
        }

        updateInChampSelect(data) {
            if (!this._firstChampSelectUpdate) {
                this._initGame(data);
                this._firstChampSelectUpdate = true;
                // don't display hotkey in-champ-select
                $(this._hotkeyEl).css('display', 'none');
            }

            this._update(data);
        }

        updateInGame(data) {
            if (!this._firstInGameUpdate && (
                data.blueTeam.length > 0 || data.redTeam.length > 0)
            ) {
                this._initGame(data);
                this._firstInGameUpdate = true;
                // display hotkey in-game
                $(this._hotkeyEl).css('display', 'block');
            }

            this._update(data);
        }

        _initGame(data) {
            this.game = new Game(data);
            HtmlHandler.initializeView(this.game);
        }

        _update(data) {
            this.game.update(data);
            HtmlHandler.update(this.game);
        }
    }

    return AppView;
});
