define([
    "../helpers/utils.js",
], function (
    Utils,
) {
    // features for launcher to subscribe to
    const REQUIRED_LAUNCHER_FEATURES = [
        "game_flow",
        "champ_select",
    ];

    const LAUNCHER_ID = 10902;
    const REGISTER_RETRY_TIMEOUT = 2000;
    let _listener = null;

    function init() {
        if (_getRunningLauncherInfo()) {
            _onLaunched();
        }

        overwolf.games.launchers.onLaunched.addListener(_onLaunched);
        overwolf.games.launchers.onTerminated.addListener(_onTerminated);
    }

    async function getPhase() {
        let launcherInfo = await _getLauncherInfo();
        return launcherInfo.res.game_flow.phase;
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


    // subscribe to features in LoL's launcher
    function _setRequiredFeautres() {
        return new Promise(resolve => {
            overwolf.games.launchers.events.setRequiredFeatures(LAUNCHER_ID, REQUIRED_LAUNCHER_FEATURES,
                async function (event) {
                    if (event.status == "error") {
                        await Utils.sleep(REGISTER_RETRY_TIMEOUT);
                        await _setRequiredFeautres();
                        return;
                    }
                    console.info("Service Registered: CLIENT");
                    resolve();
                }
            );
        });
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


    function _onLaunched() {
        _unRegisterEvents();
        _registerEvents();
        _setRequiredFeautres();
    }

    function _onTerminated() {
        _unRegisterEvents()
    }

    function _getRunningLauncherInfo() {
        return new Promise(resolve => {
            overwolf.games.launchers.getRunningLaunchersInfo((info) => {
                if (!info || !info.launchers[0] || info.classId !== LAUNCHER_ID) {
                    return resolve(false);
                }
                return resolve(info.launchers[0]);
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
        getPhase,
        getSummonerInfo,
        getChampSelectInfo,
        updateListener,
    }
});
