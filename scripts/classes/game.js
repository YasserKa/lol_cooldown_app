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

    update(data) {
      this.updateEvents(data['events']);
      this.updateTeam(data['redTeam'], this.redTeam);
      this.updateTeam(data['blueTeam'], this.blueTeam);
    }

    updateEvents(events) {
      let dragonKillsEvents = events.filter(value => value['EventName'] === 'DragonKill');
      if (dragonKillsEvents.length > 0) {
        this.updateCloudStacks(dragonKillsEvents);
      }

      let championKillsEvents = events.filter(value => value['EventName'] === 'ChampionKill');
      if (championKillsEvents.length > 0) {
        this.updateChampionKills(championKillsEvents)
      }
    }

    updateChampionKills(events) {
      let participants = this.blueTeam.concat(this.redTeam);
      for (let event of events) {
        for (let partic of participants) {
          if (event['Contributors'].includes(partic.getSummonerName())) {
            partic.addUniqueKill(event['VictimName']);
          }
        }
      }
    }

    updateCloudStacks(events) {
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
        partic.updateCloudStacks(blueCloudStacks);
      }
      for (let partic of this.redTeam) {
        partic.updateCloudStacks(redCloudStacks);
      }

    }

    updateTeam(inputTeam, team) {
      // Update participants using either cellId (champselect) or summonerName(in-game)
      for (let participant of team) {
        let participantId = participant.getId();
        for (let participantInput of inputTeam) {
          let participantInputId = participantInput.hasOwnProperty('cellId') ? participantInput['cellId'] : participantInput['summonerName'];
          // same participant
          if (participantId === participantInputId) {
            participant.update(participantInput);
            return;
          }
        }
      }
    }

    getBlueTeam() {
      return this.blueTeam;
    }

    getRedTeam() {
      return this.redTeam;
    }
  }
  return Game;
});