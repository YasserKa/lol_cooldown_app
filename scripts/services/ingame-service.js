define([
  '../helpers/utils.js',
],
  function (
    Utils
    ) {

    const REQUIRED_FEATURES = [
      'live_client_data'
    ];

    const REGISTER_RETRY_TIMEOUT = 3000;
    const NUMBER_OF_RETRIES = 10;
    const GAME_ID = 5426;
    let retries = 0;

    async function init() {
      if (await isLoLGameRunning()) {
        _onLaunched();
      }

      overwolf.games.onGameLaunched.addListener(_onLaunched);
      overwolf.games.onGameInfoUpdated.addListener(_onTerminated);
    }

    function _onLaunched() {
      _unRegisterEvents();
      _registerEvents();
      _setRequiredFeatures();
    }
 
    function _onTerminated() {
      _unRegisterEvents();
    }

    async function isLoLGameRunning() {
      let runningGameInfo = await _getRunningGameInfo();
      return runningGameInfo && runningGameInfo.classId === GAME_ID;
    }

    function _getRunningGameInfo() {
      return new Promise(resolve => {
        overwolf.games.getRunningGameInfo(function (info) {
            resolve(info);
        });
      });
    }

    function _registerEvents() {

    //  overwolf.games.events.onInfoUpdates2.addListener(listener);
    //  overwolf.games.onGameInfoUpdated.addListener(_onEventUpdate);
    }

    function _unRegisterEvents() {
    //  overwolf.games.events.onInfoUpdates2.removeListener(_onEvent);
    //   overwolf.games.onGameInfoUpdated.removeListener(_onEventUpdate);
    }

    // get the current state of the launcher
    function _getInGameInfo() {
      return new Promise(resolve => {
        overwolf.games.events.getInfo(async function (info) {
            if (info.success && info.info !== null) {
              resolve(info);
            }
        });
      });
    }

    async function getLiveClientData() {
      let gameInfo = await _getInGameInfo();
      return gameInfo.res.live_client_data;
    }

    async function _setRequiredFeatures(listener) {
      return new Promise(resolve => {
      overwolf.games.events.setRequiredFeatures(REQUIRED_FEATURES, 
        async function (response) {
            if (response.status === 'error') { 
              if (retries < NUMBER_OF_RETRIES) {
                await Utils.sleep(REGISTER_RETRY_TIMEOUT);
                _setRequiredFeatures(listener);
                retries++;
                return;
              }
            } else {
              resolve();
              console.log(`Successfully registered to InGame service.`);
            }
          }
        );
      });
    }

    return {
      init,
      getLiveClientData,
      isLoLGameRunning,
    }
  });