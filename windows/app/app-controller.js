define([
    './app-view.js',
    "../../scripts/constants/states.js",
    "../../scripts/constants/window-names.js",
    "../../scripts/services/windows-service.js",
    "../../scripts/services/parser.js",
    "../../scripts/services/launcher-service.js",
    "../../scripts/services/ingame-service.js",
    "../../scripts/services/hotkeys-service.js",
    "../../scripts/helpers/utils.js",
    "../../scripts/services/testing.js",
], function (
    AppView,
    States,
    WindowNames,
    WindowService,
    Parser,
    LauncherService,
    InGameService,
    HotkeysService,
    Utils,
    Testing,
) {
    class AppController {

        constructor() {
            this._appView = new AppView();
            this._runesUpdated = false;
            this._participantRunes = [];
            this._mainWindow = overwolf.windows.getMainWindow();
            this._stateService = this._mainWindow.stateService;

            this._onStateUpdate = this._onStateUpdate.bind(this);
            this._inChampSelectEventUpdateListener = this._inChampSelectEventUpdateListener.bind(this);
            this._updateRunesUsingServer = this._updateRunesUsingServer.bind(this);
            this._onFocusChanged = this._updateRunesUsingServer.bind(this);
            this._inGameFocusChangeListener = this._inGameFocusChangeListener.bind(this);
            this._inGameEventUpdateListener = this._inGameEventUpdateListener.bind(this);
            this._updateHotkey = this._updateHotkey.bind(this);
        }

        // add listeners to services depending on the state (in-champselect/in-game)
        async run() {
            // send window below LoL
            overwolf.windows.setPosition({
                "relativeTo": {
                    "processName": "LeagueClientUx",
                    "windowTitle": "League of Legends"
                },
                "insertAbove": false,
            }, () => {});

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

            // update hotkey view and listen to changes
            this._updateHotkey();
            HotkeysService.addHotkeyChangeListener(this._updateHotkey);
        }

        _inGameFocusChangeListener(isInFocus) {
            if (isInFocus) {
                WindowService.restore(WindowNames.APP);
            } else {
                overwolf.windows.minimize(WindowNames.APP, () => {});
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

            if (!Testing.isTesting()) {
                if (!this._runesUpdated) {
                    // await this._updateRunesUsingServer((participantRunes) => {
                    //     this._participantRunes = participantRunes;
                    //     // this._participantRunes['Clumsy Gamer'] = {
                    //     //         perkIds: [5007, 8106, 8134, 8210, 8347],
                    //     //         perkStyle: 8000,
                    //     //         perkSubStyle: 8200,
                    //     // };
                    //     this._runesUpdated = true;
                    // }, data);
                }
                data.participantRunes = this._participantRunes;
                data.participantRunes = {
                    'Clumsy Gamer': {
                        perkIds: [5007, 8106, 8134, 8210, 8347],
                        perkStyle: 8000,
                        perkSubStyle: 8200,
                    }
                };
            }

            let parsedData = Parser.parseInGameData(data);

            this._appView.updateInGame(parsedData);
        }

        _inChampSelectEventUpdateListener(data) {
            if (data.hasOwnProperty('myTeam') && data.myTeam.length > 0) {
                let parsedData = Parser.parseInChampSelectData(data);
                this._appView.updateInChampSelect(parsedData);
            }
        }

        async _updateRunesUsingServer(callback, data) {
            let gameInfo = await InGameService.getInGameInfo();
            let region = gameInfo.res.summoner_info.region;
            let summonerName = JSON.parse(data.active_player).summonerName;
            if (Testing.isTesting()) {
                // summonerName = '#random';
            }
            summonerName = encodeURIComponent(summonerName);
            region = encodeURIComponent(region);
            let url = `https://www.lolcooldown.com/api/matchrunes?summonerName=${summonerName}&region=${region}`;

            await Utils.makeRequest(url, callback)
        }

        async _updateHotkey() {
            const hotkey = await HotkeysService.getToggleHotkey();
            this._appView.updateHotkey(hotkey);
        }
    }


    return AppController;
});
