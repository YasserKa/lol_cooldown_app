define([
  "../../scripts/constants/states.js",
],
  function (
      States
    ) {

    const IS_TESTING = true;
    const STATE = States.IN_CHAMPSELECT;
    // const STATE = States.IN_GAME;
    // const STATE = States.CHAMPSELECT_TO_GAME;

    function isTesting() {
        return IS_TESTING;
    }

    function getState() {
        return STATE;
    }

    function getInChampSelectData() {
            let myTeam = [{
                'championPicked': 0,
                'cellId': 0,
                'assignedPosition': '',
                'spell1Id': 4,
                'spell2Id': 12,
                'team': 1,
            },
            {
                'championPicked': 54,
                'championId': 5,
                'cellId': 1,
                'assignedPosition': '',
                'spell1Id': 4,
                'spell2Id': 12,
                'team': 1,
            },
            {
                'championPicked': 10,
                'cellId': 2,
                'assignedPosition': '',
                'spell1Id': 4,
                'spell2Id': 12,
                'team': 1,
            },
            {
                'championPicked': 4,
                'cellId': 3,
                'assignedPosition': '',
                'spell1Id': 4,
                'spell2Id': 12,
                'team': 2,
            },
            {
                'championPicked': 1,
                'cellId': 4,
                'assignedPosition': '',
                'spell1Id': 0,
                'spell2Id': 0,
                'team': 2,
            },
            {
                'championPicked': 2,
                'cellId': 5,
                'assignedPosition': '',
                'spell1Id': 4,
                'spell2Id': 12,
                'team': 2,
            },
        ];
            let testData = {
                'myTeam': myTeam,
                'theirTeam': [],
                'actions': [],
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
                {
                    'summonerName': 'blue5',
                    'championName': 'Jhin',
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
                    'summonerName': 'blue1',
                    'championName': 'Vayne',
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
                    'summonerName': 'blue10',
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
                    ],
                    'team': 'ORDER',
                },
                {
                    'summonerName': 'blue20',
                    'championName': 'Olaf',
                    'position': '',
                    'level': 1,
                    'summonerSpells': {
                        'summonerSpellOne': {
                            'displayName': 'Flash',
                        },
                        'summonerSpellTwo': {
                            'displayName': 'Ghost',
                        },
                    },
                    'items': [
                        {'itemID': 3285},
                        {'itemID': 3285},
                        {'itemID': 3158},
                    ],
                    'team': 'ORDER',
                },
                {
                    'summonerName': 'red1',
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
                    'team': 'CHAOS',
                },

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
