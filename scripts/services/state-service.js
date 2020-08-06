define([
    './launcher-service.js',
    './ingame-service.js',
    '../constants/states.js',
], function (
    LauncherService,
    InGameService,
    States,
) {

    let currentState = States.NONE;
    let _currentInChampSelectData = {};

    function init() {
        LauncherService.init();
        InGameService.init();
        LauncherService.addListener(onLauncherInfoUpdate);
    }

    async function getState() {
        // the game is running
        if (await InGameService.isLoLGameRunning()) {
            return States.IN_GAME;
        }

        // else the client in champ_select or idle
        return _getState(await LauncherService.getPhase());
    }

    function _getState(flow) {
        let state = States.NONE;
        console.log(flow);
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
        console.log(state);
        return state;
    }

    function addOnStateChangeListener(listener) {
        _stateChangedListeners.push(listener);
    }
    _stateChangedListeners = [];

    function onLauncherInfoUpdate(info) {
        if (info.feature === 'game_flow') {
            console.log('here');
            let state = _getState(flow);
            for (listener of _stateChangedListeners) {
                console.log(state);
                listener(state);
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

            for (listener of _champSelectListeners) {
                listener(data);
            }
        }
    }

    let _champSelectListeners = [];
    let _inGameListeners = [];
    function addChampSelectListener(listener) {
        _champSelectListeners.push(listener);
    }

    function addInGameListener(listener) {
        _inGameListeners.push(listener);
    }

    function onGameStarted() {

    }

    return {
        init,
        onLauncherInfoUpdate,
        getState,
        addChampSelectListener,
        addInGameListener,
        addOnStateChangeListener,
    }
});