define([
    '../helpers/utils.js',
    '../constants/states',
], function (
    Utils,
    States,
) {

    const REQUIRED_FEATURES = [
        'live_client_data'
    ];

    const REGISTER_RETRY_TIMEOUT = 3000;
    const NUMBER_OF_RETRIES = 10;
    const GAME_ID = 5426;

    let _retries = 0;
    let _listener = null;
    let _onStartListener = null;

    async function init() {
        if (await isLoLGameRunning()) {
            await _onLaunched();
        }

        overwolf.games.onGameLaunched.addListener(async () => {
            if (await isLoLGameRunning()) {
                await _onLaunched();
            }
        });
        overwolf.games.onGameInfoUpdated.addListener((info) => {
            if (info && info.gameInfo && !info.gameInfo.isRunning) {
                _onTerminated()
            }
        });
    }

    async function isLoLGameRunning() {
        let runningGameInfo = await _getRunningGameInfo();
        return runningGameInfo && runningGameInfo.classId === GAME_ID;
    }


    function updateListener(listener) {
        _listener = listener;
    }

    async function getLiveClientData() {
        let gameInfo = await _getInGameInfo();
        return gameInfo.res.live_client_data;
    }
    async function getInGameInfo() {
        let gameInfo = await _getInGameInfo();
        console.log(gameInfo);
        return gameInfo;
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
            }
            console.info("Service Registered: INGAME");
            console.info("Service Registered: GAME");
            return true;
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
        if (_onStartListener !== null)
            _onStartListener();
    }

    function _onTerminated() {
        _unRegisterEvents();
    }

    function _registerEvents() {
        overwolf.games.events.onInfoUpdates2.addListener(_onInfoUpdate);
    }

    function _unRegisterEvents() {
        overwolf.games.events.onInfoUpdates2.removeListener(_onInfoUpdate);
    }

    function _onInfoUpdate(data) {
        if (_listener !== null) {
            _listener(data);
        }
    }

    function updateOnStartListener(listener) {
        _onStartListener = listener;
    }


    return {
        init,
        getLiveClientData,
        getInGameInfo,
        isLoLGameRunning,
        updateListener,
        updateOnStartListener,
    }
});
