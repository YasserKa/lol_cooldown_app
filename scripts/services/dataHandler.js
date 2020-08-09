define([
  "./testing.js",
  "../helpers/utils.js",
],
  function (
    Testing,
    Utils,
    ) {

    let _initialized = false;

    let _champions = {};
    let _items = {};
    let _summonerSpells = {};
    let _patchVersion = '';
    let _runesReforged = {};
    let _data = {};

    function _init() {
      if (_initialized)
        return;

      _updateDataIfNeeded();

      _champions = _data['champions'];
      _items = _data['items'];
      _summonerSpells = _data['spells'];
      _runesReforged = _data['runes'];
      _patchVersion = _data['version'];

      _initialized = true;
    }

      // TODO:
      // 1- Add time modified in server
      // 2- Update if data modified is outdated
      // 3- make a call just to check the version
    function _updateDataIfNeeded() {
        if (localStorage === null) {
            return;
        }
      _data = JSON.parse(localStorage.getItem("data"));
      if (Testing.isTesting()) {
        return;
      }
      // update if it doesn't exist or outdated
      if (_data === null) {
        _updateDataUsingServer();
      } else {
        _getLastDateUpdated(data => {
          let dateAtServer = new Date(JSON.parse(data).lastDateUpdated);
          let dateAtClient = new Date(_data.lastDateUpdated);
          if (dateAtServer > dateAtClient) {
            _updateDataUsingServer();
          }
        });
      }
    }

    function _getLastDateUpdated(callback) {
      let url = 'https://www.lolcooldown.com/api/lastdateupdated';
      Utils.makeXMLHttpRequest(url, callback);
    }

    function _updateDataUsingServer() {
      console.log('updating data from server');
      let url = 'https://www.lolcooldown.com/api/data';
      Utils.makeXMLHttpRequest(url, (data) => {
        localStorage.setItem("data", data);
        _data = JSON.parse(data);
      });
    }

    function getChampionById(id) {
      _init();
      if (id === 0) {
        return undefined;
      }
      return _champions[Object.keys(_champions).find(key => _champions[key]['id'] === id)];
    }

    function getChampionByName(name) {
      _init();
      return _champions[Object.keys(_champions).find(
        key => _champions[key]['name'] === name)];
    }

    function getItemById(id) {
      _init();
      return _items[id];
    }

    function getAllItemsHasCDrId() {
      return Object.keys(_items);
    }

    function getSpellById(id) {
      _init();
      return _summonerSpells[Object.keys(_summonerSpells).find(
        key => parseInt(_summonerSpells[key]['key']) === id)];
    }

    function getSpellByName(name) {
      _init();
      return _summonerSpells[Object.keys(_summonerSpells).find(
        key => _summonerSpells[key]['name'] === name)];
    }

    function getRunesNeeded() {
      _init();
      return Object.keys(_runesReforged);
    }

    function getRuneById(id) {
      _init();
      // cooldown reduction minor rune
      return  _runesReforged[id];
    }

    function getPatchVersion() {
      _init();
      return _patchVersion;
    }

    return {
      getChampionById,
      getChampionByName,
      getItemById,
      getAllItemsHasCDrId,
      getRuneById,
      getRunesNeeded,
      getSpellById,
      getSpellByName,
      getPatchVersion,
    }
  });
