define([
    "../helpers/utils.js",
    "../constants/states.js",
], function (
    Utils,
    States,
) {
    // features for launcher to subscribe to
    const REQUIRED_LAUNCHER_FEATURES = [
        "game_flow",
        "champ_select",
    ];

    const LAUNCHER_ID = 10902;
    const REGISTER_RETRY_TIMEOUT = 2000;
    const NUMBER_OF_RETRIES = 10;

    let _listener = null;

    async function init() {
        if (await _getRunningLauncherInfo()) {
            await _onLaunched();
        }

        overwolf.games.launchers.onLaunched.addListener(async () => {
            await _onLaunched();
        });
        overwolf.games.launchers.onTerminated.addListener(_onTerminated);
    }

    async function getState() {
        let launcherInfo = await _getLauncherInfo();
        return _getState(launcherInfo.res.game_flow.phase);
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
                state = States.IN_GAME;
                break;
            default:
                state = States.IDLE;
                break;
        }
        return state;
    }



    async function getSummonerInfo() {
        let launcherInfo = await _getLauncherInfo();
        return launcherInfo.res.summoner_info;
    }

    // get the current state of the launcher
    async function getChampSelectInfo() {
        let launcherInfo = await _getLauncherInfo();
        return JSON.parse(launcherInfo.res.champ_select.raw);
    }

    async function _setRequiredFeatures() {
        let retries = 1;
        while (retries < NUMBER_OF_RETRIES) {
            let result = await new Promise(resolve => {
                overwolf.games.launchers.events.setRequiredFeatures(LAUNCHER_ID, REQUIRED_LAUNCHER_FEATURES, resolve)
            });
            if (result.status == "error") {
                await Utils.sleep(REGISTER_RETRY_TIMEOUT);
                retries++;
                continue;
            }
            console.info("Service Registered: LAUNCHER");
            return (result.supportedFeatures.length > 0);
        }
    }

    // get the current state of the launcher
    function _getLauncherInfo() {
        return new Promise(resolve => {
            overwolf.games.launchers.events.getInfo(LAUNCHER_ID, function (info) {
                if (info.success && info.info !== null) {
                    resolve(info);
                }
            });
        });
    }


    async function _onLaunched() {
        _unRegisterEvents();
        _registerEvents();
        await _setRequiredFeatures();
    }

    function _onTerminated() {
        _unRegisterEvents()
    }

    function _getRunningLauncherInfo() {
        return new Promise(resolve => {
            overwolf.games.launchers.getRunningLaunchersInfo((info) => {
                if (!info || !info.launchers[0] || info.launchers[0].classId !== LAUNCHER_ID) {
                    resolve(false);
                }
                resolve(info.launchers[0]);
            });
        });
    }

    function _registerEvents() {
        overwolf.games.launchers.events.onInfoUpdates.addListener(_onInfoUpdate);
    }

    function _unRegisterEvents() {
        overwolf.games.launchers.events.onInfoUpdates.removeListener(_onInfoUpdate);
    }

    function _onInfoUpdate(data) {
        if (_listener !== null) {
            _listener(data);
        }
    }

    function updateListener(listener) {
        _listener = listener;
    }

    return {
        init,
        getState,
        getSummonerInfo,
        getChampSelectInfo,
        updateListener,
    }
});
