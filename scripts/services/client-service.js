define(["../../scripts/constants/states.js",],
  function (States) {

    // features for launcher to subscribe to
    const REQUIRED_LAUNCHER_FEATURES = [
      "game_flow",
      "champ_select",
    ];

    // league of Legends launcher ID
    const LAUNCHER_ID = 10902;

    const REGISTER_RETRY_TIMEOUT = 2000;

    // listeners for client state/champ select change
    let _onStateChangedListener = null;
    let _onStateChangedForAppListener = null;
    let _onChampSelectChangedListener = null;

    let _initialized = false;

    // Used to not trigger champSelectChangedListeners with duplicated data
    let _currentData = {};

    async function init() {
      if (_initialized)
        return;
      registerEvents();
      await setFeatures();
      _initialized = true;
    }

    // Registering events for champselect & client state change
    function registerEvents() {
      overwolf.games.launchers.events.onInfoUpdates.removeListener(_onEventUpdate);
      overwolf.games.launchers.events.onInfoUpdates.addListener(_onEventUpdate);
      overwolf.games.onGameInfoUpdated.removeListener(_onEventUpdate);
      overwolf.games.onGameInfoUpdated.addListener(_onEventUpdate);
    }

    async function getSummonerInfo() {
      await init();
      return new Promise((resolve => {
        overwolf.games.launchers.events.getInfo(LAUNCHER_ID, function (event) {
          resolve(event['res']['summoner_info']);
        });
      }));
    }

    // Subscribe to features in LoL's launcher
    function setFeatures() {
      return new Promise((resolve => {
        overwolf.games.launchers.events.setRequiredFeatures(
          LAUNCHER_ID,
          REQUIRED_LAUNCHER_FEATURES,
          function (event) {
            if (event.status == "error") {
              window.setTimeout(async function () {
                resolve(await setFeatures());
              }, REGISTER_RETRY_TIMEOUT);
              return;
            }
            console.log("Setting required features for client:");
            console.log(JSON.stringify(event));
            resolve();
          }
        );
      }));
    }

    function _onEventUpdate(event) {
      if (event.gameChanged || event.runningChanged) {
        _onGameStateChanged(event);
      } else if (event['feature'] === 'game_flow') {
        // Client state change
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

    // let currentState = States.NONE;
    // trigger listeners on state change for the launcher
    function _onStateChanged(event) {
      const phase = event['info']['game_flow']['phase'];
      let state = ''

      switch (phase) {
        case 'ChampSelect':
          state = States.IN_CHAMPSELECT;
          break;
        case 'GameStart':
        case 'InProgress':
        case 'Reconnect':
          return;
          // state = States.IN_GAME;
          break;
        default:
          state = States.IDLE;
          break;
      }

      // if (state === currentState) {
      //   return;
      // }
      currentState = state;

      if (_onStateChangedListener !== null) {
        _onStateChangedListener(state);
      }
      if (_onStateChangedForAppListener !== null) {
        _onStateChangedForAppListener(state);
      }
    }

    // get the current state of the launcher
    async function getState() {
      let isGameRunning = await _isGameRunning();
      if (isGameRunning) {
        // if game is running, initialize the client service upon exiting the game
        overwolf.games.onGameInfoUpdated.addListener(async (info) => {
          if (info.gameInfo && info.gameInfo.isRunning) {
            await init();
          }
        });
        return States.IN_GAME;
      }

      await init();

      return new Promise((resolve => {
        overwolf.games.launchers.events.getInfo(LAUNCHER_ID, function (event) {
          const phase = event['res']['game_flow']['phase'];
          switch (phase) {
            case 'ChampSelect':
              resolve(States.IN_CHAMPSELECT);
              break;
            // case 'InProgress':
            // case 'Reconnect':
            //   resolve(States.IN_GAME);
            default:
              resolve(States.IDLE);
              break;
          }
        });
      }));
    }

    function _isGameRunning() {
      return new Promise((resolve => {
        // get the current running game info if any game is running
        overwolf.games.getRunningGameInfo(function (runningGameInfo) {
          if (runningGameInfo && runningGameInfo.isRunning) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      }));
    }

    // trigger listeners on champ select change
    function _onChampSelectChanged(event) {
      let data = JSON.parse(event['info']['champ_select']['raw']);
      let teamData = {
        'myTeam': data['myTeam'],
        'theirTeam': data['theirTeam'],
      }

      // if duplicated data ignore it
      if (JSON.stringify(teamData) === JSON.stringify(_currentData)) {
        return;
      }

      _currentData = teamData;

      if (_onChampSelectChangedListener !== null) {
        _onChampSelectChangedListener(data);
      }
    }

    // Get the current state of the launcher
    async function getChampSelectInfo() {
      await init();

      return new Promise((resolve => {
        overwolf.games.launchers.events.getInfo(LAUNCHER_ID, function (event) {
          resolve(JSON.parse(event['res']['champ_select']['raw']));
        });
      }));
    }

    function updateStateChangedListener(callback) {
      _onStateChangedListener = callback;
    }

    function updateStateChangedForAppListener(callback) {
      _onStateChangedForAppListener = callback;
    }

    function updateChampSelectChangedListener(callback) {
      _onChampSelectChangedListener = callback;
    }

    return {
      init,
      getState,
      getSummonerInfo,
      getChampSelectInfo,
      updateStateChangedListener,
      updateStateChangedForAppListener,
      updateChampSelectChangedListener,
    }
  });