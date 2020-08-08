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
        CHAMP_SELECT: 'champ_select',
        IN_GAME: 'in_game',
    }

    let _currentInChampSelectData = {};
    let _listeners = {};

    function init() {
        LauncherService.init();
        InGameService.init();
        LauncherService.updateListener(_onLauncherInfoUpdate);
        InGameService.updateListener(_onInGameInfoUpdate);
    }

    async function getState() {
        // the game is running
        if (await InGameService.isLoLGameRunning()) {
            return States.IN_GAME;
        }

        // else the client in champ_select or idle
        return _getState(await LauncherService.getPhase());
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

    // on launcher state & champselect update
    function _onLauncherInfoUpdate(info) {
        if (info.feature === 'game_flow') {
            let state = _getState(info.info.game_flow.phase);
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

    function _getState(flow) {
        let state = States.NONE;
        switch (flow) {
            case 'ChampSelect':
                state = States.IN_CHAMPSELECT;
                break;
            case 'GameStart':
            case 'InProgress':
            case 'Reconnect':
                return;
            default:
                state = States.IDLE;
                break;
        }
        return state;
    }


    return {
        init,
        LISTENERS,
        getState,
        addListener,
    }
});
