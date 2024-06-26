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
            // sorted teams' participants
            this._redTeam = data['redTeam'].map(participant => new Participant(participant)).sort(this._sortTeam);
            this._blueTeam = data['blueTeam'].map(participant => new Participant(participant)).sort(this._sortTeam);
            this._enemyTeamColor = data['enemyTeamColor'];
        }

        update(data) {
            this._updateEvents(data['events']);
            this._updateTeam(data['redTeam'], this._redTeam);
            this._updateTeam(data['blueTeam'], this._blueTeam);
            if (data.hasOwnProperty('enemyTeamColor')) {
                this._enemyTeamColor = data['enemyTeamColor'];
            }
        }

        isInGame() {
            if (this._blueTeam.length > 0) {
                return this._blueTeam[0].getSummonerName() !== null;
            }
            return this._redTeam[0].getSummonerName() !== null;
        }

        getBlueTeam() {
            return this._blueTeam;
        }

        getRedTeam() {
            return this._redTeam;
        }

        getEnemyTeamColor() {
            return this._enemyTeamColor;
        }

        getParticipantUsingSummonerName(summonerName) {
            let participants = this._blueTeam.concat(this._redTeam);
            for (let partic of participants) {
                if (partic.getSummonerName() === summonerName) {
                    return partic;
                }
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
            let participants = this._blueTeam.concat(this._redTeam);
            let contributors = {};
            for (let event of events) {
                for (let contributor of event['Contributors']) {
                    if (!contributors.hasOwnProperty(contributor)) {
                        contributors[contributor] = [];
                    }
                    contributors[contributor].push(event['VictimName']);
                }
            }
            for (let partic of participants) {
                let summonerName = partic.getSummonerName();
                if (contributors.hasOwnProperty(summonerName)) {
                    partic.updateKills(contributors[summonerName]);
                }
            }
        }

        _updateCloudStacks(events) {
            let blueCloudStacks = 0;
            let redCloudStacks = 0;
            for (let event of events) {
                let killerName = event['KillerName'];

                for (let partic of this._blueTeam) {
                    if (partic.getSummonerName() === killerName) {
                        blueCloudStacks++;
                        continue;
                    }
                }
                for (let partic of this._redTeam) {
                    if (partic.getSummonerName() === killerName) {
                        redCloudStacks++;
                        continue;
                    }
                }
            }

            // update participants' cloud stacks
            for (let partic of this._blueTeam) {
                partic.updateCloudStacks(blueCloudStacks);
            }
            for (let partic of this._redTeam) {
                partic.updateCloudStacks(redCloudStacks);
            }

        }

        _updateTeam(inputTeam, team) {
            // update participants using either cellId (champselect) or summonerName(in-game)
            for (let participant of team) {
                let participantId = participant.getId();
                for (let participantInput of inputTeam) {
                    let participantInputId = participantInput.hasOwnProperty('cellId') ?
                        participantInput['cellId'] : participantInput['summonerName'];

                    if (participantId === participantInputId) {
                        participant.update(participantInput);
                    }
                }
            }
        }

        // sort team members depending on cellId number or their position
        _sortTeam(participantOne, participantTwo) {
            const positionOrder = ['top', 'jungle', 'middle', 'bottom', 'utility'];

            if (participantOne.getPosition() !== '') {
                return positionOrder.indexOf(participantOne.getPosition().toLowerCase())
                    > positionOrder.indexOf(participantTwo.getPosition().toLowerCase()) ? 1 : -1;
            }

            // in champ select
            if (participantOne.getCellId() !== null) {
                return participantOne.getCellId() > participantTwo.getCellId() ? 1 : -1;
            }
        }
    }

    return Game;
});
