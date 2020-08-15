define([
    'app-view.js',
    '../base-window-controller.js',
    "../../scripts/constants/states.js",
    "../../scripts/constants/window-names.js",
    "../../scripts/services/windows-service.js",
    "../../scripts/services/parser.js",
    "../../scripts/services/launcher-service.js",
    "../../scripts/services/ingame-service.js",
    "../../scripts/helpers/utils.js",
    "../../scripts/services/testing.js",
], function (
    AppView,
    BaseWindowController,
    States,
    WindowNames,
    WindowsService,
    Parser,
    LauncherService,
    InGameService,
    Utils,
    Testing,
) {
    class AppController extends BaseWindowController {

        constructor() {
            super(AppView);
            this._runesUpdated = false;
            this._participantRunes = [];
            this._mainWindow = overwolf.windows.getMainWindow();
            this._stateService = this._mainWindow.stateService;
            this.onDataLoaded = this.onDataLoaded.bind(this);

            this._inGameEventUpdateListener = this._inGameEventUpdateListener.bind(this);
            this._inChampSelectEventUpdateListener = this._inChampSelectEventUpdateListener.bind(this);
            this._inGameFocusChangeListener = this._inGameFocusChangeListener.bind(this);
        }

        async run() {
            this._view.displaySpinner();
            await super.run();
            // send window below LoL
            overwolf.windows.setPosition({
                "relativeTo": {
                    "processName": "LeagueClientUx",
                    "windowTitle": "League of Legends"
                },
                "insertAbove": false,
            }, () => {});

            try {
                await this._mainWindow.dataHandler.init();
            } catch(message) {
                this._view.removeSpinner();
                this._view.displayModal(message);
                this._view.updateHeaderMessage(`* ${message}`);

                // on reconnect rerun
                window.addEventListener('online', () => {
                    this.run();
                });
            }

            this.onDataLoaded();
        }

        async onDataLoaded() {
            if (Testing.isTesting()) {
                switch (Testing.getState()) {
                    case States.IN_CHAMPSELECT:
                        this._inChampSelectEventUpdateListener(Testing.getInChampSelectData());
                        break;
                    case States.IN_GAME:
                        this._inGameEventUpdateListener(Testing.getInGameData());
                        break;
                    case States.CHAMPSELECT_TO_GAME:
                        this._inChampSelectEventUpdateListener(Testing.getInChampSelectData());
                        setTimeout(() => {
                            this._inGameEventUpdateListener(Testing.getInGameData());
                        }, 2000);
                        break;
                }
            } else {
                this._stateService.addListener(this._stateService.LISTENERS.CHAMP_SELECT, this._inChampSelectEventUpdateListener);
                this._stateService.addListener(this._stateService.LISTENERS.IN_GAME, this._inGameEventUpdateListener);
                this._stateService.addListener(this._stateService.LISTENERS.IN_GAME_INFO, this._inGameFocusChangeListener);

                await this._onStateUpdate()
            }
            this._view.removeSpinner();
        }

        async _inGameFocusChangeListener(isInFocus) {
            if (!isInFocus) {
                WindowsService.minimize(WindowNames.APP);
                WindowsService.close(WindowNames.SETTINGS);
            }
        }

        async _onStateUpdate() {
            let state = await this._stateService.getState();
            switch (state) {
                case States.IN_CHAMPSELECT:
                    this._inChampSelectEventUpdateListener(await LauncherService.getChampSelectInfo());
                    break;
                case States.IN_GAME:
                    this._inGameEventUpdateListener(await InGameService.getLiveClientData());
                    this._inGameFocusChangeListener(await InGameService.isGameInFocus());
                    break;
            }
        }

        async _inGameEventUpdateListener(data) {
            // attributes to parse
            if (!data || (!data.hasOwnProperty('all_players') && !data.hasOwnProperty('events'))) {
                return;
            }

            // fetch runes from server
            if (!Testing.isTesting()) {
                if (!this._runesUpdated) {
                    this._participantRunes = await this._getRunesUsingServer();
                    this._runesUpdated = true;
                }
                data.participantRunes = this._participantRunes;
            }

            let parsedData = Parser.parseInGameData(data);

            this._view.updateInGame(parsedData);
        }

        _inChampSelectEventUpdateListener(data) {
            if (data.hasOwnProperty('myTeam') && data.myTeam.length > 0) {
                let parsedData = Parser.parseInChampSelectData(data);
                this._view.updateInChampSelect(parsedData);
            }
        }

        async _getRunesUsingServer() {
            let gameInfo = await InGameService.getInGameInfo();
            let region = gameInfo.res.summoner_info.region;
            let summonerName = JSON.parse(gameInfo.res.live_client_data.active_player).summonerName;

            if (Testing.isFakeRunes()) {
                summonerName = '#random';
                let rune = {
                    'Clumsy Gamer': {
                        perkIds: [5007, 8106, 8134, 8210, 8347],
                        perkStyle: 8000,
                        perkSubStyle: 8200,
                    }
                };
                return new Promise (resolve => {
                    return resolve(rune);
                });
            }

            summonerName = encodeURIComponent(summonerName);
            region = encodeURIComponent(region);
            let url = `https://www.lolcooldown.com/api/matchrunes?summonerName=${summonerName}&region=${region}`;

            let response = await Utils.makeRequest(url);
            if (response !== 200) {
                let html = `* runes not loaded: ${response.message}`;
                this._view.updateHeaderMessage(html);
            }
            return response.runes;
        }

    }


    return AppController;
});
