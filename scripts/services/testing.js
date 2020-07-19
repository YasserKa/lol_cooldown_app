define([
  "../../scripts/constants/states.js",
],
  function (
      States
    ) {

    const IS_TESTING = true;
    // const STATE = States.IN_CHAMPSELECT;
    const STATE = States.IN_GAME;

    function isTesting() {
        return IS_TESTING;
    }

    function getState() {
        return STATE;
    }

    function getData() {
        let testData = {};
        if (STATE === States.IN_CHAMPSELECT) {
            let myTeam = [{
                'championId': 1,
                'cellId': 1,
                'chammpPickIntent': 0,
                'assigngedPosition': '',
                'spell1Id': 4,
                'spell2Id': 12,
                'team': 1,
            }] ;
            testData = {
                'myTeam': myTeam,
                'theirTeam': [],
            };
        } else {
            let players = [
                { 
                    'summonerName': 'clumsy gamer',
                    'championName': 'Annie',
                    'position': 'TOP',
                    'level': 1,
                    'summonerSpells': {
                        'summonerSpellOne': {
                            'displayName': 'Teleport',
                        },
                        'summonerSpellTwo': {
                            'displayName': 'Flash',
                        },
                    },
                    'runes': [5007],
                    'items': [
                        {'itemID': 3110}, 
                        {'itemID': 3114}
                    ],
                    'team': 'ORDER',
                }
            ];

            testData = {
                'feature': 'live_client_data',
                'info': {
                    'live_client_data': {
                        'all_players': JSON.stringify(players)
                    }
                }
             }
            }
        return testData;
    }

    return {
      isTesting,
      getState,
      getData,
    }
  });