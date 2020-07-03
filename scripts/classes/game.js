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
      // cloud dragon stacks for each team
      this.redCloudStacks = 0;
      this.blueCloudStacks = 0;

      // teams' participants
      this.redTeam = data['redTeam'].map(participant => new Participant(participant));
      this.blueTeam = data['blueTeam'].map(participant => new Participant(participant));
    }

    update(data) {
      this.updateTeam(data['redTeam'], this.redTeam);
      this.updateTeam(data['blueTeam'], this.blueTeam);
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