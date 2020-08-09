define([
  "../../scripts/constants/states.js",
],
  function (
      States
    ) {

    const IS_TESTING = false;
    // const STATE = States.IN_CHAMPSELECT;
    const STATE = States.IN_GAME;
    // const STATE = States.CHAMPSELECT_TO_GAME;

    function isTesting() {
        return IS_TESTING;
    }

    function getState() {
        return STATE;
    }

    function getInChampSelectData() {
            let myTeam = [{
                'championId': 1,
                'cellId': 0,
                'champPickIntent': 0,
                'assignedPosition': '',
                'spell1Id': 4,
                'spell2Id': 12,
                'team': 1,
            },
            {
                'championId': 5,
                'cellId': 1,
                'champPickIntent': 0,
                'assignedPosition': '',
                'spell1Id': 4,
                'spell2Id': 12,
                'team': 1,
            },
            {
                'championId': 8,
                'cellId': 2,
                'champPickIntent': 0,
                'assignedPosition': '',
                'spell1Id': 4,
                'spell2Id': 12,
                'team': 1,
            },
            {
                'championId': 2,
                'cellId': 3,
                'chammpPickIntent': 0,
                'assigngedPosition': '',
                'spell1Id': 4,
                'spell2Id': 12,
                'team': 2,
            },
            {
                'championId': 12,
                'cellId': 4,
                'chammpPickIntent': 0,
                'assigngedPosition': '',
                'spell1Id': 4,
                'spell2Id': 12,
                'team': 2,
            },
            {
                'championId': 5,
                'cellId': 5,
                'chammpPickIntent': 0,
                'assigngedPosition': '',
                'spell1Id': 4,
                'spell2Id': 12,
                'team': 2,
            },
        ];
            let testData = {
                'myTeam': myTeam,
                'theirTeam': [],
            };
            return testData;
    }
    function getInGameData() {
            let players = [
                {
                    'summonerName': 'blue1123',
                    'championName': 'Soraka',
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
                // {
                //     'summonerName': 'blue5',
                //     'championName': 'Jhin',
                //     'position': '',
                //     'level': 1,
                //     'summonerSpells': {
                //         'summonerSpellOne': {
                //             'displayName': 'Ignite',
                //         },
                //         'summonerSpellTwo': {
                //             'displayName': 'Flash',
                //         },
                //     },
                //     'items': [
                //         {'itemID': 3110},
                //         {'itemID': 3114}
                //     ],
                //     'team': 'ORDER',
                // },
                // {
                //     'summonerName': 'blue1',
                //     'championName': 'Vayne',
                //     'position': '',
                //     'level': 1,
                //     'summonerSpells': {
                //         'summonerSpellOne': {
                //             'displayName': 'Ignite',
                //         },
                //         'summonerSpellTwo': {
                //             'displayName': 'Flash',
                //         },
                //     },
                //     'items': [
                //         {'itemID': 3110},
                //         {'itemID': 3114}
                //     ],
                //     'team': 'ORDER',
                // },
                // {
                //     'summonerName': 'blue10',
                //     'championName': 'Annie',
                //     'position': '',
                //     'level': 1,
                //     'summonerSpells': {
                //         'summonerSpellOne': {
                //             'displayName': 'Ignite',
                //         },
                //         'summonerSpellTwo': {
                //             'displayName': 'Flash',
                //         },
                //     },
                //     'items': [
                //     ],
                //     'team': 'ORDER',
                // },
                // {
                //     'summonerName': 'blue20',
                //     'championName': 'Olaf',
                //     'position': '',
                //     'level': 1,
                //     'summonerSpells': {
                //         'summonerSpellOne': {
                //             'displayName': 'Flash',
                //         },
                //         'summonerSpellTwo': {
                //             'displayName': 'Ghost',
                //         },
                //     },
                //     'items': [
                //         {'itemID': 3285},
                //         {'itemID': 3285},
                //         {'itemID': 3158},
                //     ],
                //     'team': 'ORDER',
                // },
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
                'blue20': {
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
                'all_players': JSON.stringify(players),
                'participantRunes': runes,
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
