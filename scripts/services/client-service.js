/**
 * Client state & champ select service
 */

define(["../../scripts/constants/states.js",],
  function (States) {

    // Listeners for client state change
    const _onStateChangedListeners = [];
    // Listeners for champ select change
    const _onChampSelectChangedListeners = [];

    // Features for launcher to subscribe to
    const REQUIRED_LAUNCHER_FEATURES = [
      "game_flow",
      "champ_select",
    ];

    // League of Legends launcher ID
    const LAUNCHER_ID = 10902;

    const REGISTER_RETRY_TIMEOUT = 2000;
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
      // State of the client can be None, In Champ Select, InProgress(ingame), etc...
      // Trigger the _onStateChangedListeners using that state to change between windows & functionality
      overwolf.games.launchers.events.onInfoUpdates.removeListener(_onStateChanged);
      overwolf.games.launchers.events.onInfoUpdates.addListener(_onStateChanged);

      // Used for champ select actions
      // Trigger the _onChampSelectChangedListeners using the actions made
      overwolf.games.launchers.events.onInfoUpdates.removeListener(_onChampSelectChanged);
      overwolf.games.launchers.events.onInfoUpdates.addListener(_onChampSelectChanged);
    }

    // Subscribe to features in LoL's launcher
    function setFeatures() {
      return new Promise((resolve => {
        overwolf.games.launchers.events.setRequiredFeatures(
          LAUNCHER_ID,
          REQUIRED_LAUNCHER_FEATURES,
          function (info) {
            if (info.status == "error") {
              window.setTimeout(async function() {
                resolve(await setFeatures());
              }, REGISTER_RETRY_TIMEOUT);
              return;
            }
            console.log("Setting required features for client:");
            console.log(JSON.stringify(info));
            resolve();
          }
        );
      }));
    }

    // Trigger listeners on state change for the launcher
    function _onStateChanged(info) {
      if (info['feature'] != 'game_flow') {
        return;
      }
      const phase = info['info']['game_flow']['phase'];
      let state = ''
      switch (phase) {
        case 'ChampSelect':
          state = States.IN_CHAMPSELECT;
          break;
        case 'InProgress':
        case 'GameStart':
          state = States.IN_GAME;
          break;
        default:
          state = States.IDLE;
          break;
      }
      for (let listener of _onStateChangedListeners) {
        listener(state);
      }
    }

    // Get the current state of the launcher
    async function getState() {
      await init();

      let isGameRunning = await _isGameRunning();
      if (isGameRunning)
        return States.IN_GAME;
      
      return new Promise((resolve => {
        overwolf.games.launchers.events.getInfo(LAUNCHER_ID, function (info) {
          const phase = info['res']['game_flow']['phase'];
          switch (phase) {
            case 'ChampSelect':
              resolve(States.IN_CHAMPSELECT);
              break;
            case 'InProgress':
              resolve(States.IN_GAME);
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

    // Trigger listeners on champ select change
    function _onChampSelectChanged(event) {
      // only use champ_select data
      if (event['feature'] != 'champ_select') {
        return;
      }

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

      for (let listener of _onChampSelectChangedListeners) {
        listener(data);
      }
    }

    // Get the current state of the launcher
    async function getChampSelectInfo() {
      await init();

      return new Promise((resolve => {
        overwolf.games.launchers.events.getInfo(LAUNCHER_ID, function (info) {
          resolve(JSON.parse(info['res']['champ_select']['raw']));
        });
      }));
    }

    function addStateChangedListener(callback) {
      _onStateChangedListeners.push(callback);
    }

    function addChampSelectChangedListener(callback) {
      _onChampSelectChangedListeners.push(callback);
    }

    return {
      init,
      getState,
      getChampSelectInfo,
      addStateChangedListener,
      addChampSelectChangedListener,
    }
  });