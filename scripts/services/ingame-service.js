define([
    '../helpers/utils.js',
], function (
    Utils
) {

    const REQUIRED_FEATURES = [
        'live_client_data'
    ];

    const REGISTER_RETRY_TIMEOUT = 3000;
    const NUMBER_OF_RETRIES = 10;
    const GAME_ID = 5426;
    let _retries = 0;
    let _listener = null;

    async function init() {
        if (await isLoLGameRunning()) {
            _onLaunched();
        }

        overwolf.games.onGameLaunched.addListener(async () => {
            if (await isLoLGameRunning()) {
                _onLaunched();
            }
        });
        overwolf.games.onGameInfoUpdated.addListener((info) => {
            if (info && info.isRunning) {
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

    function _getInGameInfo() {
        return new Promise(resolve => {
            overwolf.games.events.getInfo(async function (info) {
                if (info.success && info.info !== null) {
                    resolve(info);
                }
            });
        });
    }

    async function _setRequiredFeatures(listener) {
        return new Promise(resolve => {
            overwolf.games.events.setRequiredFeatures(REQUIRED_FEATURES,
                async function (response) {
                    if (response.status === 'error') {
                        if (_retries < NUMBER_OF_RETRIES) {
                            await Utils.sleep(REGISTER_RETRY_TIMEOUT);
                            _setRequiredFeatures(listener);
                            _retries++;
                            resolve();
                        }
                    } else {
                        console.info("Service Registered: GAME");
                        resolve();
                    }
                }
            );
        });
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


    return {
        init,
        getLiveClientData,
        updateListener,
        isLoLGameRunning,
    }
});
