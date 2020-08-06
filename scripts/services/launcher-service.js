define([
  "../constants/states.js",
  "../helpers/utils.js",
],
  function (
    States,
    Utils,
  ) {

    // features for launcher to subscribe to
    const REQUIRED_LAUNCHER_FEATURES = [
      "game_flow",
      "champ_select",
    ];

    const LAUNCHER_ID = 10902;
    const REGISTER_RETRY_TIMEOUT = 2000;

    async function init() {
      if (await _getRunningLauncherInfo()) {
        _onLaunched();
      }

      overwolf.games.launchers.onLaunched.addListener(_onLaunched);
      overwolf.games.launchers.onTerminated.addListener(_onTerminated);
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
            console.log("Setting required features for client");
            resolve();
          }
        );
      });
    }

    function _onEventUpdate(event) {
      if (event.gameChanged || event.runningChanged) {
        _onGameStateChanged(event);
      } else if (event['feature'] === 'game_flow') {
        // client state change
        _onStateChanged(event);
      } else if (event['feature'] === 'champ_select') {
        // champselect change
        _onChampSelectChanged(event);
      }
    }

    function _onGameStateChanged(event) {
      if (event.gameInfo && event.gameInfo.isRunning) {
        if (_onStateChangedListener !== null) {
          _onStateChangedListener(States.IN_GAME);
        }
        if (_onStateChangedForAppListener !== null) {
          _onStateChangedForAppListener(States.IN_GAME);
        }
      }
    }


    async function getSummonerInfo() {
      let gameInfo = await _getLauncherInfo();
      return gameInfo.res.summoner_info;
    }

    // get the current state of the launcher
    async function getChampSelectInfo() {
      let launcherInfo = await _getLauncherInfo();
      return JSON.parse(launcherInfo.res.champ_select.raw);
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

    async function getPhase() {
      let launcherInfo = await _getLauncherInfo();
      return launcherInfo.res.game_flow.phase;
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
          return resolve(res.launchers[0]);
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
      for (listener of _listeners) {
        listener(data);
      }
    }

    let _listeners = [];
    function addListener(listener) {
      _listeners.push(listener);
    }

    return {
      init,
      getPhase,
      getSummonerInfo,
      getChampSelectInfo,
      addListener,
    }
  });