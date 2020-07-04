define([
  "../../scripts/services/dataHandler.js",
  "../../scripts/services/gep-service.js",
],
  function (
    dataHandler,
    GepService,
  ) {

    // runes for cooldown reduction

    const NEEDED_RUNES = [5007, 8106, 8134, 8210, 8347];
    const EXCEPTION_DATA = {
      'Sett': {
        'abilities': {
          'P': {
            'icon': '/sett/sett_p.png',
          }
        }
      },
      'Qiyana': {
        'abilities': {
          'Q': {
            'icon': '/qiyana/qiyana_q.png',
          }
        }
      },
      'Aphelios': {
        'abilities': {
          'Q': {
            'name': 'Moonshot',
            'name1': 'OnSlaught',
            'icon': '/aphelios/moonshot.png',
            'icon1': '/aphelios/onslaught.png',
            'cooldowns': [10, 9.5, 9, 8.5, 8],
            'cooldownsBurn': '10/9.5/9/8.5/8',
          },
          'W': {
            'name': 'Duskwave',
            'icon': '/aphelios/binding_eclipse.png',
            'cooldowns': [12, 11.5, 11, 10.5, 10],
            'cooldownsBurn': '12/11.5/11/10.5/10',
          },
          'E': {
            'name': 'Duskwave',
            'name1': 'Sentry',
            'icon': '/aphelios/duskwave.png',
            'icon1': '/aphelios/sentry.png',
            'cooldowns': [9, 8.25, 7.5, 6.75, 6],
            'cooldownsBurn': '8.25/7.5/6.75/6',
          },
          'R': {
            'name': 'Moonlight Vigil',
            'cooldowns': [120, 110, 100],
            'cooldownsBurn': '120/110/100',
          }
        }
      }
    };

    /** 
     * array of champions
     * data {
     * 'position',
     * 'level'
     * 'items'
     *    'itemID'
     *    'displayName'
     * 'championName',
     * 'summonerSpells
     *     'summonerSpellOne'
     *        'displayName'
     *     'summonerSpellTwo'
     *        'displayName'
     * 'runes'
     *    'keystone'
     *    'primaryRuneTree'
     *       'displayName'
     *       'id'
     *    'secondaryRuneTree'
     *      '
     * 'team' "ORDER" blue or "CHAOS" red
     * }
     */
    const DEFAULT_CHAMP_DATA = {
      'abilities': [],
      'name': 'no-champ',
      'icon': '../../img/howling_abyss.png',
    };

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
            allPlayers[player]['runes'] = runes;
          }
          let allPlayersParsed = _parseInGameAllPlayersData(allPlayers);
          Object.assign(parsedData, allPlayersParsed);
        }
      }

      if (data.hasOwnProperty('events')) {
        let events = JSON.parse(data['events'])['Events'];
        let eventsParsed = _parseInGameEvents(events);
        parsedData['events'] = eventsParsed;
      }

      return parsedData;
    }

    ///// 
    // Assisters: []
    // EventID: 3
    // EventName: "ChampionKill"
    // EventTime: 582.3441162109375
    // KillerName: "Clumsy Gamer"
    // VictimName: "Trundle Bot"
    ///// 
    // Assisters: []
    // DragonType: "Air"
    // EventID: 6
    // EventName: "DragonKill"
    // EventTime: 770.9714965820312
    // KillerName: "Clumsy Gamer"
    // Stolen: "False"
    //////
    function _parseInGameEvents(events) {
      let parsedEvents = [];
      for (event of events) {
        if (event['EventName'] === 'ChampionKill') {
          parsedEvents.push({
            'EventName': 'ChampionKill',
            'Contributors': [...event['Assisters'], event['KillerName']],
            'VictimName': event['VictimName'],
          });
        }
        if (event['EventName'] === 'DragonKill' && event['DragonType'] === 'Air') {
          parsedEvents.push({
            'EventName': 'DragonKill',
            'KillerName': event['KillerName'],
          });
        }
      }
      return parsedEvents;

    }


    function _parseParticipantRunes(participantRunes) {
      let parsedParticipantRunes = {};

      let neededRuneIds = participantRunes.filter(value => NEEDED_RUNES.includes(value));

      for (let runeId of neededRuneIds) {
        let rune = dataHandler.getRuneById(runeId);
        parsedParticipantRunes[runeId] = {
          'id': rune['id'],
          'image': rune['id'] == 5007 ? rune['icon'] : 'https://ddragon.leagueoflegends.com/cdn/img/' + rune['icon'],
          'name': rune['key'],
          'description': rune['shortDesc'],
        };
      }
      return parsedParticipantRunes;
    }

    function _parseInGameAllPlayersData(participantsData) {
      let blueTeam = [];
      let redTeam = [];

      for (let participant of participantsData) {
        let champion = dataHandler.getChampionByName(participant['championName']);
        let champData = _parseChampionData(champion);

        let spell1 = dataHandler.getSpellByName(participant['summonerSpells']['summonerSpellOne']['displayName']);
        let spell2 = dataHandler.getSpellByName(participant['summonerSpells']['summonerSpellTwo']['displayName']);

        let spellsData = [
          _parseSpellData(spell1),
          _parseSpellData(spell2),
        ];

        let parsedData = {
          'summonerName': participant['summonerName'],
          'champion': champData,
          'position': participant['position'],
          'level': participant['level'],
          'spells': spellsData,
          'runes': _parseParticipantRunes(participant['runes']),
          'items': [],
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

    /** 
     * data {
     * 'assignedPosition',
     * 'cellId',
     * 'championId',
     * 'championPickIntent',
     * 'spell1Id',
     * 'spell2Id',
     * 'team',
     * }
     */
    function parseInChampSelectData(data) {
      let participantsData = data['myTeam'].concat(data['theirTeam']);

      let blueTeam = [];
      let redTeam = [];

      for (let participant of participantsData) {
        // No champ has been picked yet
        let champData = DEFAULT_CHAMP_DATA;

        if (participant['championId'] !== 0) {
          let champion = dataHandler.getChampionById(participant['championId']);
          champData = _parseChampionData(champion);
        }

        let spell1 = dataHandler.getSpellById(participant['spell1Id']);
        let spell2 = dataHandler.getSpellById(participant['spell2Id']);

        let spellsData = [
          _parseSpellData(spell1),
          _parseSpellData(spell2),
        ];

        let parsedData = {
          'cellId': participant['cellId'],
          'champion': champData,
          'position': participant['assignedPosition'],
          'level': 0,
          'spells': spellsData,
          'perks': 'MAYBE TODO FOR USER',
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

    function _parseChampionData(champion) {

      let patchVersion = dataHandler.getPatchVersion();
      let abilities = champion['abilities'];

      champData = {
        'name': champion['name'],
        'icon': `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/` + champion['ddragon-image']['full'],
        'abilities': {
          'P': {
            'name': abilities['P'][0]['name'],
            'icon': `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/passive/` + abilities['P'][0]['ddragon-image']['full'],
            'cooldowns': abilities['P'][0]['cooldown'] === null ? ['-'] : abilities['P'][0]['cooldown']['modifiers'][0]['values'],
          },
          'Q': {
            'name': abilities['Q'][0]['name'],
            'icon': `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/spell/` + abilities['Q'][0]['ddragon-image']['full'],
            'cooldowns': abilities['Q'][0]['cooldown'] === null ? ['-'] : abilities['Q'][0]['cooldown']['modifiers'][0]['values'],
          },
          'W': {
            'name': abilities['W'][0]['name'],
            'icon': `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/spell/` + abilities['W'][0]['ddragon-image']['full'],
            'cooldowns': abilities['W'][0]['cooldown'] === null ? ['-'] : abilities['W'][0]['cooldown']['modifiers'][0]['values'],
          },
          'E': {
            'name': abilities['E'][0]['name'],
            'icon': `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/spell/` + abilities['E'][0]['ddragon-image']['full'],
            'cooldowns': abilities['E'][0]['cooldown'] === null ? ['-'] : abilities['E'][0]['cooldown']['modifiers'][0]['values'],
          },
          'R': {
            'name': abilities['R'][0]['name'],
            'icon': `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/spell/` + abilities['R'][0]['ddragon-image']['full'],
            'cooldowns': abilities['R'][0]['cooldown'] === null ? ['-'] : abilities['R'][0]['cooldown']['modifiers'][0]['values'],
          }
        }
      };

      // TODO: remove later
      // Passive Cooldown: most 5 numbers is needed
      if (champData['abilities']['P']['cooldowns'].length > 5) {
        // Lengthy cooldown based on lvl (lvl 1-18)
        champData['abilities']['P']['cooldowns'] = [
          reset(data['abilities']['P']['cooldowns']),
          end(data['abilities']['P']['cooldowns']),
        ];
      }

      // Deal with errors made by ddragon
      if (EXCEPTION_DATA.hasOwnProperty(champData['name'])) {
        Object.assign(champData, EXCEPTION_DATA[champData['name']]);
      }

      // Update the abilities by noting if abilities reduce the CD
      for (let [key, ability] of Object.entries(champData['abilities'])) {

        let abilityCdRedType = dataHandler.getCdReductionType(ability['name']);
        champData['abilities'][key]['cooldownReduceType'] = abilityCdRedType;
        // Getting the abilitiy's cooldown description
        if (abilityCdRedType != '') {
          let description = dataHandler.getCdDescription(champion['id'], key);
          let array = description.split('cooldown');
          let newDescription = array.join('<b>cooldown</b>');
          champData['abilities'][key]['description'] = newDescription;
        }
      }

      return champData;
    }


    function _parseSpellData(spell) {
      let patchVersion = dataHandler.getPatchVersion();
      // Not known yet
      if (typeof (spell) === 'undefined') {
        return {
          'cooldown': '-',
          'image': '../../img/howling_abyss.png',
          'name': 'dummy',
          'description': 'dummy',
        };
      }

      return {
        'cooldown': spell['cooldown'][0],
        'image': `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/spell/` + spell['image']['full'],
        'name': spell['id'],
        'description': spell['description'],
      };
    }

    return {
      parseInChampSelectData,
      parseInGameData,
    }
  });