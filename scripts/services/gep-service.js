/**
 * Game Event Provider service
 * This will listen to events from the game provided by
 * Overwolf's Game Events Provider
 */
define([

],
  function () {

    const REQUIRED_FEATURES = [
      'summoner_info',
      'gameMode',
      'teams',
      'matchState',
      'kill',
      'death',
      'respawn',
      'assist',
      'minions',
      'level',
      'abilities',
      'announcer',
      'counters',
      'match_info',
      'damage',
      'heal',
      'live_client_data'
      // 'gold'
    ];
    const REGISTER_RETRY_TIMEOUT = 10000;
    const NUMBER_OF_RETRIES = 5;

    // Get the current state of the launcher
    function getInGameInfo() {
      // await init();

      return new Promise((resolve => {
        overwolf.games.events.getInfo(function (event) {
          resolve(event['res']['live_client_data']);
        });
      }));
    }

    function registerToGEP(listener) {
      let retries = 0;
      overwolf.games.events.setRequiredFeatures(REQUIRED_FEATURES, function (response) {
        if (response.status === 'error') { console.log(`Failed to register to GEP, retrying in ${REGISTER_RETRY_TIMEOUT / 1000}s...`);

        console.log(retries);
          if (retries >= NUMBER_OF_RETRIES) {
            return;
          }
          setTimeout(registerToGEP, REGISTER_RETRY_TIMEOUT, listener);
          retries++;

          return;
        }

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