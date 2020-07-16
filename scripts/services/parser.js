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
            'icon': '../../img/sett/sett_p.png',
          }
        }
      },
      'Braum': {
        'abilities': {
          'P': {
            'cooldowns': [
              8, 8, 8, 8, 8, 8,
              7, 7, 7 ,7 ,7, 7,
              10, 10, 10 ,10 ,10, 10
            ],
          }
        }
      },
      'Blitzcrank': {
        'abilities': {
          'P': {
            'cooldowns': [90],
          }
        }
      },
      'Camille': {
        'abilities': {
          'P': {
            'cooldowns': [
              16, 16, 16, 16, 16, 16, 
              13, 13, 13, 13, 13, 13, 
              10, 10, 10 ,10 ,10, 10
            ],
          }
        }
      },
      'Illaoi': {
        'abilities': {
          'P': {
            'cooldowns': [
              20, 20, 19, 19, 18, 18, 
              17, 17, 16, 16, 15, 15, 
              14, 14, 13, 13, 12, 12
            ],
          }
        }
      },
      'Kindred': {
        'abilities': {
          'P': {
            'cooldowns': [240],
          }
        }
      },
      'Malphite': {
        'abilities': {
          'P': {
            'cooldowns': [
              10, 10, 10, 10, 10, 10, 
              8, 8, 8, 8, 8, 8,
              6, 6, 6, 6, 6, 6
            ],
          }
        }
      },
      'Maokai': {
        'abilities': {
          'P': {
            'cooldowns': [
              30, 30, 30, 30, 30, 25, 
              25, 25, 25, 25, 20, 20, 
              20, 20, 20, 20, 20, 20

            ],
          }
        }
      },
      'Neeko': {
        'abilities': {
          'P': {
            'cooldowns': [
              25, 25, 25, 22, 22, 22, 
              19, 19, 19, 16, 16, 16, 
              13, 13, 13, 10, 10, 10
            ],
          }
        }
      },
      'Poppy': {
        'abilities': {
          'P': {
            'cooldowns': [
              16, 16, 16, 16, 16, 16,
              12, 12, 12, 12, 12, 12,
              8, 8, 8, 8, 8, 8
            ],
          }
        }
      },
      'Rakan': {
        'abilities': {
          'P': {
            'cooldowns': [
              40, 40, 37, 37, 34, 34, 
              31, 31, 28, 28, 25, 25,
              22, 22, 19, 19, 16, 16
            ],
          }
        }
      },
      'Swain': {
        'abilities': {
          'P': {
            'cooldowns': [
              12, 12, 12, 12, 12, 9,
              9, 9, 9, 9, 6, 6,
              6, 6, 6, 6, 6, 6
            ],
          }
        }
      },
      'Urgot': {
        'abilities': {
          'P': {
            'cooldowns': [
              30, 30, 30, 30, 30, 20, 
              20, 20, 10, 10, 5, 5, 
              2.5, 2.5, 2.5, 2.5, 2.5, 2.5
            ],
          }
        }
      },
      'Vi': {
        'abilities': {
          'P': {
            'cooldowns': [
              16, 15.5, 15, 14.5, 14, 13.5, 
              13, 12.5, 12, 12, 12, 12, 
              12, 12, 12, 12, 12, 12
            ],
          }
        }
      },
      'Zyra': {
        'abilities': {
          'P': {
            'cooldowns': [
              13, 13, 13, 13, 12, 12,
              12, 12, 11, 11, 11, 11,
              10, 10, 10, 10, 10, 9
            ],
          }
        }
      },
      'Qiyana': {
        'abilities': {
          'Q': {
            'icon': '../../img/qiyana/qiyana_q.png',
          }
        }
      },
      'Aphelios': {
        'abilities': {
          'Q': {
            'name': 'Moonshot',
            'name1': 'OnSlaught',
            'icon': '../../img/aphelios/moonshot.png',
            'icon1': '../../img/aphelios/onslaught.png',
            'cooldowns': [10, 9.5, 9, 8.5, 8],
            'cooldownsBurn': '10/9.5/9/8.5/8',
          },
          'W': {
            'name': 'Duskwave',
            'icon': '../../img/aphelios/binding_eclipse.png',
            'cooldowns': [12, 11.5, 11, 10.5, 10],
            'cooldownsBurn': '12/11.5/11/10.5/10',
          },
          'E': {
            'name': 'Duskwave',
            'name1': 'Sentry',
            'icon': '../../img/aphelios/duskwave.png',
            'icon1': '../../img/aphelios/sentry.png',
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

        let champId = participant['championId'] === 0 ? participant['championPickIntent'] : participant['championId'];
        if (champId !== 0) {
          let champion = dataHandler.getChampionById(champId);
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
          'level': 1,
          'spells': spellsData,
          'runes': 'MAYBE TODO FOR USER',
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
        let champion = dataHandler.getChampionByName(participant['championName']);
        let champData = _parseChampionData(champion);

        let spell1 = dataHandler.getSpellByName(participant['summonerSpells']['summonerSpellOne']['displayName']);
        let spell2 = dataHandler.getSpellByName(participant['summonerSpells']['summonerSpellTwo']['displayName']);

        let spellsData = [
          _parseSpellData(spell1),
          _parseSpellData(spell2),
        ];

        let items = _parseItemsData(participant['items']);

        let parsedData = {
          'summonerName': participant['summonerName'],
          'champion': champData,
          'position': participant['position'],
          'level': participant['level'],
          'spells': spellsData,
          'runes': _parseParticipantRunes(participant['runes']),
          'items': items,
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


    function _parseItemsData(participantItems) {
      let itemsHasCDrId = dataHandler.getAllItemsHasCDrId();
      let itemsId = participantItems.map((item) => item['itemID'].toString());
      let neededItemsId = itemsId.filter(itemId => itemsHasCDrId.includes(itemId));
      return neededItemsId.map((itemId) => dataHandler.getItemById(itemId));
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

      // Deal with errors made by ddragon
      if (EXCEPTION_DATA.hasOwnProperty(champData['name'])) {
        champData = array_replace_recursive(champData, EXCEPTION_DATA[champData['name']]);
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

    // used similarly to the one in php
    function array_replace_recursive(arr) {

      var i = 0
      var p = ''
      var argl = arguments.length
      var retObj

      if (argl < 2) {
        throw new Error('There should be at least 2 arguments passed to array_replace_recursive()')
      }

      // Although docs state that the arguments are passed in by reference,
      // it seems they are not altered, but rather the copy that is returned
      // So we make a copy here, instead of acting on arr itself
      if (Object.prototype.toString.call(arr) === '[object Array]') {
        retObj = []
        for (p in arr) {
          retObj.push(arr[p])
        }
      } else {
        retObj = {}
        for (p in arr) {
          retObj[p] = arr[p]
        }
      }

      for (i = 1; i < argl; i++) {
        for (p in arguments[i]) {
          if (retObj[p] && typeof retObj[p] === 'object') {
            retObj[p] = array_replace_recursive(retObj[p], arguments[i][p])
          } else {
            retObj[p] = arguments[i][p]
          }
        }
      }

      return retObj
    }

    return {
      parseInChampSelectData,
      parseInGameData,
    }
  });