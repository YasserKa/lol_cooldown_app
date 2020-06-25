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
        if (!data['info'].hasOwnProperty('live_client_data')) {
          return;
        }

        data = data['info']['live_client_data'];
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

        // events array of  
        // EventName "DragonKill"
        // KillerName "Summoner X"
        // DragonType "Air"
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

      // Add a line to a log
      _logLine(log, string, isHighlight) {
        const line = document.createElement("p");
        // Check if scroll is near bottom
        const autoScrollOn =
          log.scrollTop + log.offsetHeight > log.scrollHeight - 10;

        if (isHighlight) {
          line.className = "highlight";
        }

        line.textContent = string;

        log.appendChild(line);

        if (autoScrollOn) {
          log.scrollTop = log.scrollHeight;
        }
      }

      _updateParticipant() {

      }

      _createParticipant(data) {
        console.log(data);
        // 'assignedPosition',
        // 'cellId',
        // 'championId',
        // 'championPickIntent',
        // 'spell1Id',
        // 'spell2Id',
        // 'team',

      }

    }

    return AppView;
  });
