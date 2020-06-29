define([],
  function () {

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
    async function _updateDataIfNeeded() {
      _data = JSON.parse(localStorage.getItem("data"));
      if (_data === null) {
        let data = await _getDataFromServer();
        localStorage.setItem("data", data);
        _data = JSON.parse(data);
      }
    }

    function _getDataFromServer() {
      return new Promise(async (resolve, reject) => {
        let path = 'https://www.lolcooldown.com/api/data';
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 201) {
              resolve(xhr.response);
            } else {
              reject({});
            }
          }
        };
        xhr.open("GET", path, true);
        xhr.send();
      });
    }

    function getChampionById(id) {
      _init();
      return _champions[Object.keys(_champions).find(key => _champions[key]['id'] === id)];
    }

    function getSpellById(id) {
      _init();
      return _summonerSpells[Object.keys(_summonerSpells).find(
        key => parseInt(_summonerSpells[key]['key']) === id)];
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
      getSpellById,
      getCdReductionType,
      getCdDescription,
      getPatchVersion,
    }
  });