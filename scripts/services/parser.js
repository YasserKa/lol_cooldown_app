define([
  "../../scripts/services/dataHandler.js",
],
  function (
    dataHandler
    ) {

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
    function getTeamData(team) {

      let teamResult = [];
      for (let participantData of team) {
        // No champ has been picked yet
        let champData = {};
        // if (participantData['championId'] === 0) {
        //   participantData['championId'] = 1;
        // }
        if (participantData['championId'] === 0) {
          champData =  {
            'abilities': [],
            'name': 'no-champ',
            'icon': '../../img/howling_abyss.png',
          };
        } else {
          champData = _getChampionInfo(participantData['championId']);
          // Update the abilities by noting if abilities reduce the CD
            for (let [key, ability] of Object.entries(champData['abilities'])) {

              let abilityCdRedType = dataHandler.getCdReductionType(ability['name']);
              champData['abilities'][key]['cooldownReduceType'] = abilityCdRedType;
              // Getting the abilitiy's cooldown description
              if (abilityCdRedType != '') {
                let description = dataHandler.getCdDescription(participantData['championId'], key);
                let array = description.split('cooldown');
                let newDescription = array.join('<b>cooldown</b>');
                champData['abilities'][key]['description'] = newDescription;
              }
            }
          }

          let spellsData = [
            _getSpellInfo(participantData['spell1Id']),
            _getSpellInfo(participantData['spell2Id'])
          ];

          // TODO: shouldn't be the parser's job
          // Prioritize flash
          // if (spellsData[1]['name'] == 'SummonerFlash')
          //   [spellsData[0], spellsData[1]] = [spellsData[1], spellsData[0]];

          let neededData = {
            'cellId': participantData['cellId'],
            'spells': spellsData,
            'champion': champData,
            // 'perks': participantData['cellId']
          };

          teamResult.push(neededData);
        }
        return teamResult;
      }

    function _getChampionInfo(id) {

      let patchVersion = dataHandler.getPatchVersion();
      let champDetails = dataHandler.getChampionById(id);
      let abilities = champDetails['abilities'];

      data = {
        'name': champDetails['name'],
        'icon': `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/` + champDetails['ddragon-image']['full'],
        'abilities': {
          'P': {
            'name': abilities['P'][0]['name'],
            'icon': `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/passive/` + abilities['P'][0]['ddragon-image']['full'],
            'cooldowns': abilities['P'][0]['cooldown'] === null ? [null] : abilities['P'][0]['cooldown']['modifiers'][0]['values'],
          },
          'Q': {
            'name': abilities['Q'][0]['name'],
            'icon': `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/spell/` + abilities['Q'][0]['ddragon-image']['full'],
            'cooldowns': abilities['Q'][0]['cooldown'] === null ? [null] : abilities['Q'][0]['cooldown']['modifiers'][0]['values'],
          },
          'W': {
            'name': abilities['W'][0]['name'],
            'icon': `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/spell/` + abilities['W'][0]['ddragon-image']['full'],
            'cooldowns': abilities['W'][0]['cooldown'] === null ? [null] : abilities['W'][0]['cooldown']['modifiers'][0]['values'],
          },
          'E': {
            'name': abilities['E'][0]['name'],
            'icon': `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/spell/` + abilities['E'][0]['ddragon-image']['full'],
            'cooldowns': abilities['E'][0]['cooldown'] === null ? [null] : abilities['E'][0]['cooldown']['modifiers'][0]['values'],
          },
          'R': {
            'name': abilities['R'][0]['name'],
            'icon': `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/spell/` + abilities['R'][0]['ddragon-image']['full'],
            'cooldowns': abilities['R'][0]['cooldown'] === null ? [null] : abilities['R'][0]['cooldown']['modifiers'][0]['values'],
          }
        }
      };

      // TODO: remove later
      // Passive Cooldown: most 5 numbers is needed
      if (data['abilities']['P']['cooldowns'].length > 5) {
        // Lengthy cooldown based on lvl (lvl 1-18)
        data['abilities']['P']['cooldowns'] = [
          reset(data['abilities']['P']['cooldowns']),
          end(data['abilities']['P']['cooldowns']),
        ];
      }

      // Deal with errors made by ddragon
      if (EXCEPTION_DATA.hasOwnProperty(data['name'])) {
        Object.assign(data, EXCEPTION_DATA[data['name']]);
      }

      return data;
    }


    function _getSpellInfo(id) {
      let spell = dataHandler.getSpellById(id);
      let patchVersion = dataHandler.getPatchVersion();
      // Not known yet
      if (typeof(spell) === 'undefined') {
      return {
        'cooldown': 0,
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
      getTeamData,
    }
  });