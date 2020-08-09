define([
    './launcher-service',
    './ingame-service.js',
    '../constants/states.js',
], function (
    LauncherService,
    InGameService,
    States,
) {

    const LISTENERS = {
        STATE_CHANGE: 'state_change',
        GAME_START: 'game_start',
        CHAMP_SELECT: 'champ_select',
        IN_GAME: 'in_game',
    }

    let _currentInChampSelectData = {};
    let _listeners = {};

    async function init() {
        LauncherService.updateListener(_onLauncherInfoUpdate);
        InGameService.updateListener(_onInGameInfoUpdate);
        InGameService.updateOnStartListener(_onGameStart);
        await LauncherService.init();
        await InGameService.init();
    }

    async function getState() {
        // the game is running
        if (await InGameService.isLoLGameRunning()) {
            return States.IN_GAME;
        }

        // else the client in champ_select or idle
        return await LauncherService.getState();
    }

    function addListener(key, listener) {
        _listeners[key] = listener;
    }


    // on game update
    function _onInGameInfoUpdate(info) {
        if (info && info.feature === 'live_client_data') {
            if (_listeners.hasOwnProperty(LISTENERS.IN_GAME)) {
                _listeners[LISTENERS.IN_GAME](info.info.live_client_data);
            }
        }
    }

    function _onGameStart() {
        if (_listeners.hasOwnProperty(LISTENERS.GAME_START)) {
            _listeners[LISTENERS.GAME_START]();
        }
    }

    // on launcher state & champselect update
    async function _onLauncherInfoUpdate(info) {
        console.log(info);
        if (info.feature === 'game_flow') {
            let state = await LauncherService.getState();
            if (_listeners.hasOwnProperty(LISTENERS.STATE_CHANGE)) {
                _listeners[LISTENERS.STATE_CHANGE](state);
            }
        } else if (info.feature === 'champ_select') {

            let data = JSON.parse(info.info.champ_select.raw);
            let teamData = {
                'myTeam': data['myTeam'],
                'theirTeam': data['theirTeam'],
            }

            // if duplicated data ignore it
            if (JSON.stringify(teamData) === JSON.stringify(_currentInChampSelectData)) {
                return;
            }

            _currentInChampSelectData = teamData;

            if (_listeners.hasOwnProperty(LISTENERS.CHAMP_SELECT)) {
                _listeners[LISTENERS.CHAMP_SELECT](teamData);
            }
        }
    }

    return {
        init,
        LISTENERS,
        getState,
        addListener,
    }
});
