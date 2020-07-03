define([
  "../../scripts/services/client-service.js",
],
  function (
    ClientService
    ) {

    let _initialized = false;

    let _champions = {};
    let _summonerSpells = {};
    let _cdReductionTypes = {};
    let _patchVersion = '';
    let _runesReforged = {};
    let _data = {};

    function _init() {
      if (_initialized)
        return;
      
      _updateDataIfNeeded();

      // _data = JSON.parse(localStorage.getItem("data"));

      _champions = _data['champions'];
      _summonerSpells = _data['spells'];
      _cdReductionTypes = _data['cdReductionTypes'];
      _runesReforged = _data['runes'];
      _patchVersion = _data['version'];

      _initialized = true;
    }

      // TODO:
      // 1- Add time modified in server
      // 2- Update if data modified is outdated
      // 3- make a call just to check the version
    function _updateDataIfNeeded() {
      _data = JSON.parse(localStorage.getItem("data"));
      if (_data === null) {
        _updateDataUsingServer((data) => {
          localStorage.setItem("data", data);
          _data = JSON.parse(data);
        });
      }
    }

    function _updateDataUsingServer(callback) {
        let path = 'https://www.lolcooldown.com/api/data';
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 201) {
              callback(xhr.response);
            }
          }
        };
        xhr.open("GET", path, false);
        xhr.send();
    }

    function getChampionById(id) {
      _init();
      return _champions[Object.keys(_champions).find(key => _champions[key]['id'] === id)];
    }

    function getChampionByName(name) {
      _init();
      return _champions[Object.keys(_champions).find(
        key => _champions[key]['name'] === name)];
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

    function getCdReductionType(abilityName) {
      _init();
      // Loop through the list of abilities
      for (let [type, abilities] of Object.entries(_cdReductionTypes)) {
        if (abilities.includes(abilityName)) {
          return type;
        }
      }
      return '';
    }

    function getRuneById(id) {
      _init();
      // cooldown reduction minor rune
      if (id === 5007) {
          return {
              'icon': '../../img/statmodscdrscalingicon.png',
              'key': 'statmodscdrscaling',
              'shortDesc': '1%-10% (based on level) cooldown reduction',
              'id': 5007,
          };
      }
      for (let runeReforged of _runesReforged) {
        for (let slot of runeReforged['slots']) {
          for (let rune of slot['runes']) {
            if (rune['id'] === id) {
              return rune;
            }
          }
        }
      }
    }

    function getCdDescription(champId, abilityKey) {
      _init();
      let champsDetails = getChampionById(champId);
      let effects = champsDetails['abilities'][abilityKey][0]['effects'];
      for (let effect of effects) {
        if (effect['description'].includes('cooldown')) {
          return effect['description'];
        }
      }
    }
    function getPatchVersion() {
      _init();
      return _patchVersion;
    }

    return {
      getChampionById,
      getChampionByName,
      getRuneById,
      getSpellById,
      getSpellByName,
      getCdReductionType,
      getCdDescription,
      getPatchVersion,
    }
  });