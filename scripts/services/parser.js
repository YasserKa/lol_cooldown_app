define([
], function (
) {

    const EXCEPTION_DATA = {
        'Sett': {
            'abilities': {
                'P': {
                    'icon': '/img/sett/sett_p.png',
                }
            }
        },
        'Qiyana': {
            'abilities': {
                'Q': {
                    'icon': '/img/qiyana/qiyana_q.png',
                }
            }
        },
        'Aphelios': {
            'abilities': {
                'Q': {
                    'icon': '/img/aphelios/moonshot.png',
                    'icon1': '/img/aphelios/onslaught.png',
                },
                'W': {
                    'icon': '/img/aphelios/binding_eclipse.png',
                },
                'E': {
                    'icon': '/img/aphelios/duskwave.png',
                    'icon1': '/img/aphelios/sentry.png',
                },
            }
        }
    };

    const DEFAULT_CHAMP_DATA = {
        'abilities': [],
        'name': '',
        'icon': '',
    };
    const DEFAULT_SPELL_DATA = {
        'cooldown': '-',
        'image': '',
        'name': '',
        'description': '',
    }

    let dataHandler = overwolf.windows.getMainWindow().dataHandler;

    function parseInGameData(data) {
        let parsedData = {
            'redTeam': [],
            'blueTeam': [],
            'events': [],
        };

        if (data.hasOwnProperty('all_players')) {
            let allPlayers = JSON.parse(data['all_players']);

            // assign runes to participants
            if (data.hasOwnProperty('participantRunes')) {
                for (let player in allPlayers) {
                    let summonerName = allPlayers[player]['summonerName'];
                    let runes = [];
                    if (data['participantRunes'].hasOwnProperty(summonerName)) {
                        runes = data['participantRunes'][summonerName]['perkIds'];
                    }
                    allPlayers[player]['runesReforged'] = runes;
                }
            }

            if (data.hasOwnProperty('game_data')) {
                for (let player in allPlayers) {
                    allPlayers[player]['gameMode'] = JSON.parse(data.game_data).gameMode;
                }
            }
            let allPlayersParsed = _parseInGameAllPlayersData(allPlayers);
            Object.assign(parsedData, allPlayersParsed);
        }

        if (data.hasOwnProperty('events')) {
            let events = JSON.parse(data['events'])['Events'];
            let eventsParsed = _parseInGameEvents(events);
            parsedData['events'] = eventsParsed;
        }

        return parsedData;
    }

    function _getUpdatedChampData(champData) {
        // deal with images
        if (EXCEPTION_DATA.hasOwnProperty(champData['name'])) {
            champData = _array_replace_recursive(champData, EXCEPTION_DATA[champData['name']]);
        }
        return champData;
    }

    function parseInChampSelectData(data) {
        let participantsData = data['myTeam'].concat(data['theirTeam']);

        // actions has champion picked which isn't included in participantData
        let actions = data.actions;

        for (let action of actions) {
            // skip ban actions
            if (action[0].type === 'ban') {
                continue;
            }
            for (let particInAction of action) {
                let cellId = particInAction.actorCellId;
                // ignore cellId -1
                if (cellId < 0) {
                    continue;
                }
                let partic = participantsData.find(partic => partic.cellId === cellId);
                partic.championPicked = particInAction.championId;
            }
        }

        let blueTeam = [];
        let redTeam = [];

        for (let participant of participantsData) {
            let champId = participant.championPicked;
            champId = typeof champId === 'undefined' ? participant.championId : champId;

            let champData = dataHandler.getChampionById(champId);
            champData = typeof champData === 'undefined' ? DEFAULT_CHAMP_DATA : champData;

            champData = _getUpdatedChampData(champData);

            let spell1 = dataHandler.getSpellById(participant.spell1Id);
            let spell2 = dataHandler.getSpellById(participant.spell2Id);
            spell1 = typeof spell1 === 'undefined' ? DEFAULT_SPELL_DATA : spell1;
            spell2 = typeof spell2 === 'undefined' ? DEFAULT_SPELL_DATA : spell2;

            let spellsData = [
                spell1,
                spell2
            ];

            let parsedData = {
                'cellId': participant['cellId'],
                'champion': champData,
                'position': participant['assignedPosition'],
                'level': 1,
                'spells': spellsData,
                'runes': [],
                'items': [],
            };

            if (participant['team'] === 1) {
                blueTeam.push(parsedData);
            } else if (participant['team'] === 2) {
                redTeam.push(parsedData);
            }
        }
        return {
            'blueTeam': blueTeam,
            'redTeam': redTeam,
            'events': [],
        }
    }

    function _parseInGameAllPlayersData(participantsData) {
        let blueTeam = [];
        let redTeam = [];

        for (let participant of participantsData) {
            // participant['championName'] = 'Neeko';
            let champData = dataHandler.getChampionByName(participant['championName']);
            champData = typeof champData === 'undefined' ? DEFAULT_CHAMP_DATA : champData;

            champData = _getUpdatedChampData(champData);

            let summonerSpells = participant.summonerSpells;
            let spell1 = undefined;
            let spell2 = undefined;

            if (Object.keys(summonerSpells).length > 0) {
                spell1 = dataHandler.getSpellByName(summonerSpells.summonerSpellOne.displayName);
                spell2 = dataHandler.getSpellByName(summonerSpells.summonerSpellTwo.displayName);
            }

            spell1 = typeof spell1 === 'undefined' ? DEFAULT_SPELL_DATA : spell1;
            spell2 = typeof spell2 === 'undefined' ? DEFAULT_SPELL_DATA : spell2;


            let spellsData = [
                spell1,
                spell2
            ];

            let items = _parseItemsData(participant['items']);

            let parsedData = {
                'summonerName': participant.summonerName,
                'champion': champData,
                'position': participant.position,
                'level': participant.level,
                'creepScore': participant.scores.creepScore,
                'spells': spellsData,
                'runes': _parseParticipantRunes(participant.runesReforged),
                'items': items,
                'gameMode': participant.gameMode,
            };

            if (participant['team'])
                if (participant['team'] === "ORDER") {
                    blueTeam.push(parsedData);
                } else if (participant['team'] === "CHAOS") {
                    redTeam.push(parsedData);
                }
        }

        return {
            'blueTeam': blueTeam,
            'redTeam': redTeam,
        }
    }

    function _parseInGameEvents(events) {
        let parsedEvents = [];
        for (event_ of events) {
            if (event_['EventName'] === 'ChampionKill') {
                parsedEvents.push({
                    'EventName': 'ChampionKill',
                    'Contributors': [...event_['Assisters'], event_['KillerName']],
                    'VictimName': event_['VictimName'],
                });
            }
            if (event_['EventName'] === 'DragonKill' && event_['DragonType'] === 'Air') {
                parsedEvents.push({
                    'EventName': 'DragonKill',
                    'KillerName': event_['KillerName'],
                });
            }
        }
        return parsedEvents;
    }

    function _parseParticipantRunes(participantRunes) {
        let parsedParticipantRunes = {};

        let neededRuneIds = participantRunes.filter(value => dataHandler.getRunesNeeded().includes(value.toString()));

        for (let runeId of neededRuneIds) {
            let rune = dataHandler.getRuneById(runeId);
            parsedParticipantRunes[rune.name] = rune;
            if (runeId == 5007) {
                parsedParticipantRunes[rune.name].image = '/img/' + rune.image;
            }
        }

        return parsedParticipantRunes;
    }

    function _parseItemsData(participantItems) {
        let itemsHasCDrId = dataHandler.getAllItemsHasCDrId();
        let itemsId = participantItems.map((item) => item['itemID'].toString());
        let neededItemsId = itemsId.filter(itemId => itemsHasCDrId.includes(itemId));
        return neededItemsId.map((itemId) => dataHandler.getItemById(itemId));
    }

    // used similarly to the one in php
    function _array_replace_recursive(arr) {

        var i = 0;
        var p = '';
        var argl = arguments.length;
        var retObj;

        if (argl < 2) {
            throw new Error('There should be at least 2 arguments passed to array_replace_recursive()');
        }

        // Although docs state that the arguments are passed in by reference,
        // it seems they are not altered, but rather the copy that is returned
        // So we make a copy here, instead of acting on arr itself
        if (Object.prototype.toString.call(arr) === '[object Array]') {
            retObj = [];
            for (p in arr) {
                retObj.push(arr[p]);
            }
        } else {
            retObj = {};
            for (p in arr) {
                retObj[p] = arr[p];
            }
        }

        for (i = 1; i < argl; i++) {
            for (p in arguments[i]) {
                if (retObj[p] && typeof retObj[p] === 'object') {
                    retObj[p] = _array_replace_recursive(retObj[p], arguments[i][p]);
                } else {
                    retObj[p] = arguments[i][p];
                }
            }
        }

        return retObj;
    }

    return {
        parseInChampSelectData,
        parseInGameData,
    }
});
