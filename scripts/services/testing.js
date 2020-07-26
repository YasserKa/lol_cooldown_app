define([
  "../../scripts/constants/states.js",
],
  function (
      States
    ) {

    const IS_TESTING = true;
    // const STATE = States.IN_CHAMPSELECT;
    // const STATE = States.IN_GAME;
    const STATE = States.CHAMPSELECT_TO_GAME;

    function isTesting() {
        return IS_TESTING;
    }

    function getState() {
        return STATE;
    }

    function getInChampSelectData() {
            let myTeam = [{
                'championId': 1,
                'cellId': 1,
                'champPickIntent': 0,
                'assignedPosition': '',
                'spell1Id': 4,
                'spell2Id': 12,
                'team': 1,
            },  {
                'championId': 2,
                'cellId': 0,
                'champPickIntent': 0,
                'assignedPosition': '',
                'spell1Id': 4,
                'spell2Id': 12,
                'team': 1,
            // }, {
            //     'championId': 2,
            //     'cellId': 3,
            //     'chammpPickIntent': 0,
            //     'assigngedPosition': '',
            //     'spell1Id': 4,
            //     'spell2Id': 12,
            //     'team': 2,
            }, ];
            let testData = {
                'myTeam': myTeam,
                'theirTeam': [],
            };
            return testData;
    }
    function getInGameData() {
            let players = [
                {
                    'summonerName': 'blue1',
                    'championName': 'Annie',
                    'position': '',
                    'level': 1,
                    'summonerSpells': {
                        'summonerSpellOne': {
                            'displayName': 'Ignite',
                        },
                        'summonerSpellTwo': {
                            'displayName': 'Flash',
                        },
                    },
                    'items': [
                        {'itemID': 3110}, 
                        {'itemID': 3114}
                    ],
                    'team': 'ORDER',
                },
                { 
                    'summonerName': 'blue2',
                    'championName': 'Olaf',
                    'position': '',
                    'level': 1,
                    'summonerSpells': {
                        'summonerSpellOne': {
                            'displayName': 'Teleport',
                        },
                        'summonerSpellTwo': {
                            'displayName': 'Flash',
                        },
                    },
                    'items': [
                        {'itemID': 3110}, 
                        {'itemID': 3114}
                    ],
                    'team': 'ORDER',
                },
                // { 
                //     'summonerName': 'red1',
                //     'championName': 'Olaf',
                //     'position': '',
                //     'level': 1,
                //     'summonerSpells': {
                //         'summonerSpellOne': {
                //             'displayName': 'Teleport',
                //         },
                //         'summonerSpellTwo': {
                //             'displayName': 'Flash',
                //         },
                //     },
                //     'items': [
                //         {'itemID': 3110}, 
                //         {'itemID': 3114}
                //     ],
                //     'team': 'CHAOS',
                // },
                
            ];
            let runes = {
                // 'blue1': {
                // perkIds: [5007, 8106, 8134, 8210, 8347],
                // perkStyle: 8000,
                // perkSubStyle: 8200,
                // },
                'blue2': {
                perkIds: [5007, 8106, 8134, 8210, 8347],
                perkStyle: 8000,
                perkSubStyle: 8200,
                },
                // 'red1': {
                // perkIds: [5007, 8106, 8134, 8210, 8347],
                // perkStyle: 8000,
                // perkSubStyle: 8200,
                // },
            };

            testData = {
                'feature': 'live_client_data',
                'info': {
                    'live_client_data': {
                        'all_players': JSON.stringify(players),
                        'participantRunes': runes,
                    }
                }
            }
        return testData;
    }

    return {
      isTesting,
      getState,
      getInChampSelectData,
      getInGameData,
    }
  });