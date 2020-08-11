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
                this._headerTitle = document.getElementById("header-title");
                // message sent after a change in settings to update the view
                overwolf.windows.onMessageReceived.addListener(()=>{
                    HtmlHandler.update(this.game);
                });
            }

            updateInChampSelect(data) {
                if (!this._firstChampSelectUpdate) {
                    this._init(data);
                    this._firstChampSelectUpdate = true;
                    $(this._headerTitle).find('#game-state').text('Champ Select');
                    $(this._headerTitle).find('#hotkey-wrapper').css('display', 'none');
                }

                this._update(data);
            }

            updateInGame(data) {
                if (!this._firstInGameUpdate && (
                    data.blueTeam.length > 0 || data.redTeam.length > 0)
                ) {
                    this._init(data);
                    this._firstInGameUpdate = true;
                    $(this._headerTitle).find('#game-state').text('In-Game');
                    $(this._headerTitle).find('#hotkey-wrapper').css('display', 'block');
                }

                this._update(data);
            }

            _init(data) {
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
