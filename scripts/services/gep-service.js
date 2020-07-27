/**
 * Game Event Provider service
 * This will listen to events from the game provided by
 * Overwolf's Game Events Provider
 */
define([

],
  function () {

    const REQUIRED_FEATURES = [
      'live_client_data'
    ];
    const REGISTER_RETRY_TIMEOUT = 2000;
    const NUMBER_OF_RETRIES = 5;
    let _isRegisteredToGEP = false;
    let retries = 0;

    // get the current state of the launcher
    function getInGameInfo() {

      return new Promise((resolve => {
        overwolf.games.events.getInfo(async function (event) {
          if (!_isRegisteredToGEP) {
            await new Promise(r => setTimeout(r, 2000));
            return getInGameInfo();
          }
          resolve(event['res']['live_client_data']);
        });
      }));
    }

    function registerToGEP(listener) {
      overwolf.games.events.setRequiredFeatures(REQUIRED_FEATURES, function (response) {
        if (response.status === 'error') { 
          console.log(`Failed to register to GEP, retrying in ${REGISTER_RETRY_TIMEOUT / 1000}s...`);
          if (retries >= NUMBER_OF_RETRIES) {
            return;
          }
          setTimeout(registerToGEP, REGISTER_RETRY_TIMEOUT, listener);
          retries++;
          return;
        }
        _isRegisteredToGEP = true;
        console.log(`Successfully registered to GEP.`);

        overwolf.games.events.onInfoUpdates2.removeListener(listener);
        overwolf.games.events.onInfoUpdates2.addListener(listener);
      });
    }

    return {
      registerToGEP,
      getInGameInfo
    }
  });