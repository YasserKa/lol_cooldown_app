/**
 * Detect whether champ select is currently running
 */
define(["../../scripts/constants/states.js",],
  function (States) {

    let initialized = false;

    let champions = {};
    let summonerSpells = {};
    let cdReducitonTypes = {};
    let patchVersion = '';
    let runesReforged = {};
    let data = {};

    function init() {
      if (initialized)
        return;

      data = JSON.parse(localStorage.getItem("data"));
      champions = data['champions'];
      summonerSpells = data['spells'];
      cdReducitonTypes = data['cdReductionTypes'];
      runesReforged = data['runes'];
      patchVersion = data['version'];

      // TODO:
      // 1- Update if the version is outdated
      // 2- make a call just to check the version
      if (data === null) {
        updateData();
      }

      initialized = true;
    }

    async function updateData() {
      data = await getDataFromServer();
      localStorage.setItem("data", data);
      data = JSON.parse(data);
    }

    function getChampionById(id) {
      return champions[Object.keys(champions).find(key => champions[key]['id'] === id)];
    }

    function getSpellById(id) {
      return summonerSpells[Object.keys(summonerSpells).find(
        key => parseInt(summonerSpells[key]['key']) === id)];
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
    function getTeamData(team) {

      let teamResult = [];
      for (let participantData of team) {
        // No champ has been picked yet
        let champData = {};
        // if (participantData['championId'] === 0) {
        //   participantData['championId'] = 1;
        // }
        console.log(participantData['championId']);
        if (participantData['championId'] === 0) {
          champData =  {
            'abilities': [],
            'name': 'no-champ',
            'icon': '../../img/howling_abyss.png',
          };
        } else {
          champData = getChampionInfo(participantData['championId']);
          // Update the abilities by noting if abilities reduce the CD
            for (let [key, ability] of Object.entries(champData['abilities'])) {

              let abilityCdRedType = getCdReductionType(ability['name']);
              champData['abilities'][key]['cooldownReduceType'] = abilityCdRedType;
              // Getting the abilitiy's cooldown description
              if (abilityCdRedType != '') {
                let description = getCdDescription(participantData['championId'], key);
                let array = description.split('cooldown');
                let newDescription = array.join('<b>cooldown</b>');
                champData['abilities'][key]['description'] = newDescription;
              }
            }
          }

          let spellsData = [
            getSpellInfo(participantData['spell1Id']),
            getSpellInfo(participantData['spell2Id'])
          ];

          // Prioritize flash
          if (spellsData[1]['name'] == 'SummonerFlash')
            [spellsData[0], spellsData[1]] = [spellsData[1], spellsData[0]];

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

    function getCdReductionType(abilityName) {
      // Loop through the list of abilities
      for (let [type, abilities] of Object.entries(cdReducitonTypes)) {
        if (abilities.includes(abilityName)) {
          return type;
        }
      }
      return '';
    }

    function getCdDescription(champId, abilityKey) {
      let champsDetails = getChampionById(champId);
      let effects = champsDetails['abilities'][abilityKey][0]['effects'];
      for (let effect of effects) {
        if (effect['description'].includes('cooldown')) {
          return effect['description'];
        }
      }
    }

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


    function getChampionInfo(id) {
      init();

      let champDetails = getChampionById(id);
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


    function getSpellInfo(id) {
      init();
      let spell = getSpellById(id);
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

    function getDataFromServer() {
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
    return {
      updateData,
      getChampionInfo,
      getTeamData,
      getSpellInfo,
    }
  });