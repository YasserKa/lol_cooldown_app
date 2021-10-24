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

            this.displayAd();
            // update view when settings are updated
            this._settings.addListener('app_view', () => {
                HtmlHandler.initializeView(this.game);
                this._resizeWindow();
            });
        }

        // 550 180
        _resizeWindow() {
            let uiMode = this._settings.getSetting(this._settings.SETTINGS.UI_MODE)
            let scale = this._settings.getSetting(this._settings.SETTINGS.WINDOW_SCALE)

            if (uiMode === this._settings.UI_MODES.BASIC && this.game.isInGame()) {
                this.updateHeightWidthScale(0.29, 0.5);
                this.removeAd();
                this._updateWindowScale(scale);
            } else {
                this.updateHeightWidthScale(1, 1);
                this._ad.refreshAd();
                this._updateWindowScale(scale);
            }

        }

        updateInChampSelect(data) {
            if (!this._firstChampSelectUpdate) {
                this._initGame(data);
                this._firstChampSelectUpdate = true;
                // don't display hotkey in-champ-select
                // $(this._hotkeyEl).css('display', 'none');
                this.removeSpinner();
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
                this.removeSpinner();
            }

            this._update(data);
        }

        _initGame(data) {
            this.game = new Game(data);
            HtmlHandler.initializeView(this.game);
            this._resizeWindow();
        }

        _update(data) {
            this.game.update(data);
            HtmlHandler.update(this.game);
        }
    }

    return AppView;
});
