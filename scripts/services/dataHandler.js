define([
    "./testing.js",
    "../helpers/utils.js",
    "../../scripts/services/launcher-service.js",
],
    function (
        Testing,
        Utils,
        LauncherService,
    ) {

        let _champions = {};
        let _items = {};
        let _summonerSpells = {};
        let _runesReforged = {};
        let _data = {};

        async function init() {

            await _updateDataIfNeeded();

            _champions = _data['champions'];
            _items = _data['items'];
            _summonerSpells = _data['spells'];
            _runesReforged = _data['runes'];
        }

        async function _updateDataIfNeeded() {
            _data = JSON.parse(localStorage.getItem("data"));
            // update if it doesn't exist or outdated
            if (_data === null) {
                await _updateDataUsingServer();
            } else if(!Testing.isTesting()) {
                let lastDateUpdated = await _getLastDateUpdated();
                let dateAtServer = new Date(lastDateUpdated);
                let dateAtClient = new Date(_data.lastDateUpdated);
                if (dateAtServer > dateAtClient) {
                    _updateDataUsingServer();
                }
            }
        }

        async function _getLastDateUpdated() {
            // let patch_version = await LauncherService.getPatchVersion();
            // let url = `https://www.lolcooldown.com/api/lastdateupdated_new?version=${patch_version}`;
            let url = `https://www.lolcooldown.com/api/lastdateupdated`;
            let data = await Utils.makeRequest(url);
            return data.lastDateUpdated;
        }

        async function _updateDataUsingServer() {
            console.info('updating data from server');
            // let patch_version = await LauncherService.getPatchVersion();
            // let url = `https://www.lolcooldown.com/api/data_new?version=${patch_version}`;
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

            // client API uses FiddleSticks, while the data provided uses
            // Fiddlesticks
            if (name === 'FiddleSticks') {
                name = 'Fiddlesticks';
            }

            return _champions[name];
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
            // used mark's name is empty
            if (name === "") {
                name = 'SummonerSnowball';
            }
            if (name === "SummonerFlashPerksHextechFlashtraptionV2") {
                name =  "SummonerFlash";
            }
            // Unleased teleport
            if (name === "S12") {
                name = "SummonerTeleport";
                _summonerSpells[name]['cooldown'] = 240;
            }

            // smite upgrades like chilling
            if (name.includes('S5')) {
                name = 'SummonerSmite';
            }
            return _summonerSpells[name];
        }

        function getRunesNeeded() {
            // 5005 & 9104 is for AS rune (needed by Yasuo & Yone)
            return [...Object.keys(_runesReforged), '5005', '9104'];
        }

        function getRuneById(id) {
            // AS rune
            if (id === 5005) {
                return {'name': 'AttackSpeed'};
            }
            if (id === 9104) {
                return {'name': 'LegendAlacrity'};
            }
            // making a copy of the object, because it will be altered for the
            // 1-10CDred minirune
            let rune = Object.assign({}, _runesReforged[id]);
            return rune;
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
        }
    });
