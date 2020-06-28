define(["../SampleAppView.js", "../../scripts/services/htmlHandler.js"],
  function (SampleAppView,
    HtmlHandler) {
    class AppView extends SampleAppView {
      constructor() {
        super();

        this._infoLog = document.getElementById("infoLog");
        this.updateInGame = this.updateInGame.bind(this);
        this.updateInChampSelect = this.updateInChampSelect.bind(this);
      }

      /**
       * updates the page using this data
       * @param {myTeam:
       * , yourTeam:...}
       */
      updateInChampSelect(data) {
        // let el = HtmlHandler.createGameEl(data);
        HtmlHandler.update(data);
        // $(".team").remove();
        // $(".game-details").append(el);
      }

      /**
       * updates the page using this data
       * @param {myTeam:
       * , yourTeam:...}
       */
      updateInGame(data) {
        // let player = '';
        let eventsInGame = '';
        let allPlayers = '';
        // if (data.hasOwnProperty('active_player')) {
        //   player = data['active_player'];
        // }
        if (data.hasOwnProperty('events')) {
          eventsInGame = data['events'];
        }
        if (data.hasOwnProperty('all_players')) {
          allPlayers = data['all_players'];
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
        if (allPlayers !== '') {
          console.log(JSON.parse(allPlayers));
        }
        // if (player !== ''){
        //   console.log(JSON.parse(player));
        // }
        if (eventsInGame !== '') {
          console.log(JSON.parse(eventsInGame));
        }
        // this._logLine(this._infoLog, string);
      }
    }

    return AppView;
  });
