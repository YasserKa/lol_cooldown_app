define([
    "./testing.js",
    "../helpers/utils.js",
],
    function (
        Testing,
        Utils,
    ) {

        let _champions = {};
        let _items = {};
        let _summonerSpells = {};
        let _patchVersion = '';
        let _runesReforged = {};
        let _data = {};

        async function init() {

            await _updateDataIfNeeded();

            _champions = _data['champions'];
            _items = _data['items'];
            _summonerSpells = _data['spells'];
            _runesReforged = _data['runes'];
            _patchVersion = _data['version'];
        }

        async function _updateDataIfNeeded() {
            _data = JSON.parse(localStorage.getItem("data"));
            // update if it doesn't exist or outdated
            if (_data === null) {
                await _updateDataUsingServer();
            } else if(!Testing.isTesting) {
                let lastDateUpdated = await _getLastDateUpdated();
                let dateAtServer = new Date(lastDateUpdated);
                let dateAtClient = new Date(_data.lastDateUpdated);
                if (dateAtServer > dateAtClient) {
                    _updateDataUsingServer();
                }
            }
        }

        async function _getLastDateUpdated() {
            let url = 'https://www.lolcooldown.com/api/lastdateupdated';
            let data = await Utils.makeRequest(url);
            return data.lastDateUpdated;
        }

        async function _updateDataUsingServer() {
            console.info('updating data from server');
            let url = 'https://www.lolcooldown.com/api/data';
            let data = await Utils.makeRequest(url);
            localStorage.setItem("data", JSON.stringify(data));
            _data = data;
        }

        function getChampionById(id) {
            if (id === 0) {
                return undefined;
            }
            return _champions[Object.keys(_champions).find(key => _champions[key]['id'] === id)];
        }

        function getChampionByName(name) {
            return _champions[Object.keys(_champions).find(
                key => _champions[key]['name'] === name)];
        }

        function getItemById(id) {
            return _items[id];
        }

        function getAllItemsHasCDrId() {
            return Object.keys(_items);
        }

        function getSpellById(id) {
            return _summonerSpells[Object.keys(_summonerSpells).find(
                key => parseInt(_summonerSpells[key]['key']) === id)];
        }

        function getSpellByName(name) {
            // smite upgrades like chilling
            if (name.includes('Smite')) {
                name = 'Smite';
            }
            return _summonerSpells[Object.keys(_summonerSpells).find(
                key => _summonerSpells[key]['name'] === name)];
        }

        function getRunesNeeded() {
            return Object.keys(_runesReforged);
        }

        function getRuneById(id) {
            // making a copy of the object, because it will be altered for the
            // 1-10CDred minirune
            let rune = Object.assign({}, _runesReforged[id]);
            return rune;
        }

        function getPatchVersion() {
            return _patchVersion;
        }

        return {
            init,
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
