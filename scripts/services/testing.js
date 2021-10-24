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
    const FAKE_RUNES = false;

    function isTesting() {
        return IS_TESTING;
    }

    function isFakeRunes() {
        return FAKE_RUNES;
    }

    function getState() {
        return STATE;
    }

    function getInChampSelectData() {
            let myTeam = [{
                'championPicked': 81,
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
                    'summonerName': 'blue1',
                    'rawChampionName': '___MasterYi',
                    'position': '',
                    'level': 1,
                    'scores': {
                        'creepScore': 10,
                    },
                    'summonerSpells': {
                        'summonerSpellOne': {
                            'displayName': 'Teleport',
                            'rawDisplayName': '1_1_SummonerTeleport'
                        },
                        'summonerSpellTwo': {
                            'displayName': 'Flash',
                            'rawDisplayName': '1_1_SummonerFlash'
                        },
                    },
                    'items': [
                        {'itemID': 6617},
                        {'itemID': 6616},
                        {'itemID': 3158},
                    ],
                    'team': 'ORDER',
                }, {
                    'summonerName': 'blue2',
                    'rawChampionName': '___Olaf',
                    'position': '',
                    'level': 1,
                    'scores': {
                        'creepScore': 10,
                    },
                    'summonerSpells': {
                        'summonerSpellOne': {
                            'displayName': 'Smite',
                            'rawDisplayName': '1_1_SummonerSmite'
                        },
                        'summonerSpellTwo': {
                            'displayName': 'Ghost',
                            'rawDisplayName': '1_1_SummonerHaste'
                        },
                    },
                    'items': [
                        {'itemID': 6631},
                    ],
                    'team': 'ORDER',
                }, {
                    'summonerName': 'seraphine',
                    'rawChampionName': '___Seraphine',
                    'position': '',
                    'level': 1,
                    'scores': {
                        'creepScore': 10,
                    },
                    'summonerSpells': {
                        'summonerSpellOne': {
                            'displayName': 'Teleport',
                            'rawDisplayName': '1_1_SummonerTeleport'
                        },
                        'summonerSpellTwo': {
                            'displayName': 'Flash',
                            'rawDisplayName': '1_1_SummonerFlash'
                        },
                    },
                    'items': [
                        {'itemID': 6617},
                        {'itemID': 6616},
                        {'itemID': 3158},
                    ],
                    'team': 'ORDER',
                }, {
                    'summonerName': 'blue4',
                    'rawChampionName': '___Jinx',
                    'position': '',
                    'level': 1,
                    'scores': {
                        'creepScore': 10,
                    },
                    'summonerSpells': {
                        'summonerSpellOne': {
                            'displayName': 'Ignite',
                            'rawDisplayName': '1_1_SummonerDot'
                        },
                        'summonerSpellTwo': {
                            'displayName': 'Flash',
                            'rawDisplayName': '1_1_SummonerFlash'
                        },
                    },
                    'items': [
                    ],
                    'team': 'ORDER',
                }, {
                    'summonerName': 'blue5',
                    'rawChampionName': '___Thresh',
                    'position': '',
                    'level': 1,
                    'scores': {
                        'creepScore': 10,
                    },
                    'summonerSpells': {
                        'summonerSpellOne': {
                            'displayName': 'Ignite',
                            'rawDisplayName': '1_1_SummonerDot'
                        },
                        'summonerSpellTwo': {
                            'displayName': 'Flash',
                            'rawDisplayName': '1_1_SummonerFlash'
                        },
                    },
                    'items': [
                        {'itemID': 3190},
                        {'itemID': 3067}
                    ],
                    'team': 'ORDER',
                }, {
                    'summonerName': 'renekton',
                    'rawChampionName': '___Renekton',
                    'position': '',
                    'level': 1,
                    'scores': {
                        'creepScore': 10,
                    },
                    'summonerSpells': {
                        'summonerSpellOne': {
                            'displayName': 'Flash',
                            'rawDisplayName': '1_1_SummonerFlash'
                        },
                        'summonerSpellTwo': {
                            'displayName': 'Teleport',
                            'rawDisplayName': '1_1_SummonerTeleport'
                        },
                    },
                    'items': [
                        {'itemID': 6631},
                    ],
                    'team': 'CHAOS',
                }, {
                    'summonerName': 'red2',
                    'rawChampionName': '___Nidalee',
                    'position': '',
                    'level': 1,
                    'scores': {
                        'creepScore': 10,
                    },
                    'summonerSpells': {
                        'summonerSpellOne': {
                            'displayName': 'Smite',
                            'rawDisplayName': '1_1_SummonerSmite'
                        },
                        'summonerSpellTwo': {
                            'displayName': 'Flash',
                            'rawDisplayName': '1_1_SummonerFlash'
                        },
                    },
                    'items': [
                        {'itemID': 4636},
                        {'itemID': 3158},
                    ],
                    'team': 'CHAOS',
                }, {
                    'summonerName': 'syndra',
                    'rawChampionName': '___Syndra',
                    'position': '',
                    'level': 1,
                    'scores': {
                        'creepScore': 10,
                    },
                    'summonerSpells': {
                        'summonerSpellOne': {
                            'displayName': 'Teleport',
                            'rawDisplayName': '1_1_SummonerTeleport'
                        },
                        'summonerSpellTwo': {
                            'displayName': 'Flash',
                            'rawDisplayName': '1_1_SummonerFlash'
                        },
                    },
                    'items': [
                        {'itemID': 3158},
                        {'itemID': 3102},
                        {'itemID': 6656},
                    ],
                    'team': 'CHAOS',
                },  {
                    'summonerName': 'red4',
                    'rawChampionName': '___Tristana',
                    'position': '',
                    'level': 1,
                    'scores': {
                        'creepScore': 10,
                    },
                    'summonerSpells': {
                        'summonerSpellOne': {
                            'displayName': 'Flash',
                            'rawDisplayName': '1_1_SummonerFlash'
                        },
                        'summonerSpellTwo': {
                            'displayName': 'Cleanse',
                            'rawDisplayName': '1_1_SummonerBoost'
                        },
                    },
                    'items': [
                    ],
                    'team': 'CHAOS',
                }, {
                    'summonerName': 'nautilus',
                    'rawChampionName': '___Nautilus',
                    'position': '',
                    'level': 1,
                    'scores': {
                        'creepScore': 10,
                    },
                    'summonerSpells': {
                        'summonerSpellOne': {
                            'displayName': 'Ignite',
                            'rawDisplayName': '1_1_SummonerDot'
                        },
                        'summonerSpellTwo': {
                            'displayName': 'Flash',
                            'rawDisplayName': '1_1_SummonerFlash'
                },
                    },
                    'items': [
                        {'itemID': 3190},
                        {'itemID': 3067},
                    ],
                    'team': 'CHAOS',
                }
            ];
            let runes = {
                'Clumsy Gamer': {
                perkIds: [5007, 8106, 8134, 8210, 8347],
                perkStyle: 8000,
                perkSubStyle: 8200,
                },
                'blue1': {
                perkIds: [8210, 8347],
                perkStyle: 8000,
                perkSubStyle: 8200,
                },
                'seraphine': {
                perkIds: [8210, 8347, 8134],
                perkStyle: 8000,
                perkSubStyle: 8200,
                },
                'renekton': {
                perkIds: [6631, 8347, 8134],
                perkStyle: 8000,
                perkSubStyle: 8200,
                },
                'red2': {
                perkIds: [8210],
                perkStyle: 8000,
                perkSubStyle: 8200,
                },
                'syndra': {
                perkIds: [8106, 8210],
                perkStyle: 8000,
                perkSubStyle: 8200,
                },
                'nautilus': {
                perkIds: [5007, 8347],
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
                'active_player': '{"summonerName": "seraphine"}',
            }
        return testData;
    }

    return {
      isTesting,
      isFakeRunes,
      getState,
      getInChampSelectData,
      getInGameData,
    }
  });
