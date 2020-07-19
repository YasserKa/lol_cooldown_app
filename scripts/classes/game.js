define([
  "../../scripts/classes/participant.js",
], function (
  Participant,
) {
  class Game {

    /**
     * @param {redTeam, blueTeam, events} data 
     */
    constructor(data) {
      // teams' participants
      this.redTeam = data['redTeam'].map(participant => new Participant(participant));
      this.blueTeam = data['blueTeam'].map(participant => new Participant(participant));
    }

    updateForInGame(data) {
      this._updateParticipantsForInGame(data['redTeam'], this.redTeam);
      this._updateParticipantsForInGame(data['blueTeam'], this.blueTeam);
    }

    update(data) {
      this._updateEvents(data['events']);
      this._updateTeam(data['redTeam'], this.redTeam);
      this._updateTeam(data['blueTeam'], this.blueTeam);
    }

    getBlueTeam() {
      return this.blueTeam.sort(this.sortTeam);
    }

    getRedTeam() {
      return this.redTeam.sort(this.sortTeam);
    }

    sortTeam(participantOne, participantTwo) {
      const positionOrder = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];

      if (participantOne.getPosition() !== '') {
        return positionOrder.indexOf(participantOne.getPosition()) 
        > positionOrder.indexOf(participantTwo.getPosition()) ? 1 : -1;
      }

      // in champ select
      if (participantOne.getCellId() !== null)  {
        return participantOne.getCellId() > participantTwo.getCellId() ? 1 : -1 ;
      }
    }

    _updateEvents(events) {
      let dragonKillsEvents = events.filter(value => value['EventName'] === 'DragonKill');
      if (dragonKillsEvents.length > 0) {
        this._updateCloudStacks(dragonKillsEvents);
      }

      let championKillsEvents = events.filter(value => value['EventName'] === 'ChampionKill');
      if (championKillsEvents.length > 0) {
        this._updateChampionKills(championKillsEvents)
      }
    }

    _updateChampionKills(events) {
      let participants = this.blueTeam.concat(this.redTeam);
      for (let event of events) {
        for (let partic of participants) {
          if (event['Contributors'].includes(partic.getSummonerName())) {
            partic.addUniqueKill(event['VictimName']);
          }
        }
      }
    }

    _updateCloudStacks(events) {
      let blueCloudStacks = 0;
      let redCloudStacks = 0;
      for (let event of events) {
        let killerName = event['KillerName'];

        for (let partic of this.blueTeam) {
          if (partic.getSummonerName() === killerName) {
            blueCloudStacks++;
            continue;
          }
        }
        for (let partic of this.redTeam) {
          if (partic.getSummonerName() === killerName) {
            redCloudStacks++;
            continue;
          }
        }
      }

      // update participants' cloud stacks
      for (let partic of this.blueTeam) {
        partic._updateCloudStacks(blueCloudStacks);
      }
      for (let partic of this.redTeam) {
        partic._updateCloudStacks(redCloudStacks);
      }

    }

    _updateTeam(inputTeam, team) {
      // Update participants using either cellId (champselect) or summonerName(in-game)
      for (let participant of team) {
        let participantId = participant.getId();
        for (let participantInput of inputTeam) {
          let participantInputId = participantInput.hasOwnProperty('cellId') ? participantInput['cellId'] : participantInput['summonerName'];
          // same participant
          if (participantId === participantInputId) {
            participant.update(participantInput);
          }
        }
      }
    }

    _updateParticipantsForInGame(inputTeam, team) {
      for (let participantInput of inputTeam) {
        for (let participant of team) {
          let champName = participant.getChampionName();
          let champNameInput = participant['champion']['name'];
          if (champNameInput !== champName) {
            continue;
          }
          participant.setSummonerName(participantInput['summonerName']);

          team = team.filter(item => item !== participant);
          break;
        }
      }
    }
  }

  return Game;
});