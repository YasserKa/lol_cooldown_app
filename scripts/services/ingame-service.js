define([
    '../helpers/utils.js',
    '../constants/states',
], function (
    Utils,
) {

    const REQUIRED_FEATURES = [
        'live_client_data'
    ];

    const REGISTER_RETRY_TIMEOUT = 3000;
    const NUMBER_OF_RETRIES = 20;
    const GAME_ID = 5426;

    let _retries = 0;
    let _infoListener = null;
    let _eventListener = null;

    async function init() {
        if (await isLoLGameRunning()) {
            await _onLaunched();
        }

        overwolf.games.onGameLaunched.addListener(async () => {
            if (await isLoLGameRunning()) {
                await _onLaunched();
            }
        });
    }

    async function isLoLGameRunning() {
        let info = await _getRunningGameInfo();
        return info && info.classId === GAME_ID;
    }

    async function isGameInFocus() {
        let info = await _getRunningGameInfo();
        return info && info.isInFocus;
    }


    async function getLiveClientData() {
        while (true) {
            let info = await _getInGameInfo();
            if (!info.res.hasOwnProperty('live_client_data')) {
                await Utils.sleep(1000);
                return await getLiveClientData();
            } else {
                return info.res.live_client_data;
            }
        }
    }

    async function getInGameInfo() {
        let gameInfo = await _getInGameInfo();
        return gameInfo;
    }

    function updateEventListener(listener) {
        _eventListener = listener;
    }

    function updateInfoListener(listener) {
        _infoListener = listener;
    }

    function _getInGameInfo() {
        return new Promise(resolve => {
            overwolf.games.events.getInfo(async function (info) {
                if (info.success && info.info !== null) {
                    resolve(info);
                }
            });
        });
    }

    async function _setRequiredFeatures() {
        let retries = 1;
        while (retries < NUMBER_OF_RETRIES) {
            let result = await new Promise(resolve => {
                overwolf.games.events.setRequiredFeatures(REQUIRED_FEATURES, resolve)
            });
            if (result.status === 'error') {
                if (_retries < NUMBER_OF_RETRIES) {
                    await Utils.sleep(REGISTER_RETRY_TIMEOUT);
                    _retries++;
                    continue;
                }
            } else {
                console.info("Service Registered: GAME");
                _onEventUpdate({'info': {'live_client_data': await getLiveClientData()}});
                return true;
            }
        }
    }

    function _getRunningGameInfo() {
        return new Promise(resolve => {
            overwolf.games.getRunningGameInfo(function (info) {
                resolve(info);
            });
        });
    }

    async function _onLaunched() {
        _unRegisterEvents();
        _registerEvents();
        await _setRequiredFeatures();
    }

    function _onTerminated() {
        _unRegisterEvents();
    }

    function _registerEvents() {
        overwolf.games.events.onInfoUpdates2.addListener(_onEventUpdate);
        overwolf.games.onGameInfoUpdated.addListener(_onInfoUpdate);
    }

    function _unRegisterEvents() {
        overwolf.games.events.onInfoUpdates2.removeListener(_onEventUpdate);
        overwolf.games.onGameInfoUpdated.removeListener(_onInfoUpdate);
    }

    function _onInfoUpdate(info) {
        if (_infoListener !== null) {
            _infoListener(info);
        }

        if (info && info.gameInfo &&
            info.gameInfo.runningChanged &&
            !info.gameInfo.isRunning) {
            _onTerminated()
        }
    }

    function _onEventUpdate(data) {
        if (_eventListener !== null) {
            _eventListener(data);
        }
    }

    return {
        init,
        getLiveClientData,
        getInGameInfo,
        isLoLGameRunning,
        isGameInFocus,
        updateEventListener,
        updateInfoListener,
    }
});
