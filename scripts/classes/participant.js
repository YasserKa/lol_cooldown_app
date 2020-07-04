define([
], function (
) {
  class Participant {

    /** 
     *  position
     *  level
     *  items
     *  perks
     *  spells
     *  champion
     */
    constructor(data) {
      this.uniqueKills = [];
      this.cdReduction = 0;
      // this.cdRed = participantInfo['fiveCdr'] ? 5 : 0;
      // this.hasFiveCdrRune = participantInfo['fiveCdr'];
      // // Keeps track of abilities CD changes
      // this.originalAbilities = this.champion['abilities']
      // this.currentAbilities = JSON.parse(JSON.stringify(this.originalAbilities));
      // this.originalSpells = participantInfo['spells'];
      // this.currentSpells = JSON.parse(JSON.stringify(this.originalSpells));

      this.position = data.position;
      this.cellId = data.hasOwnProperty('cellId') ? data['cellId']: null;
      this.summonerName = data.hasOwnProperty('summonerName') ? data['summonerName'] : null;
      this.level = data.level;
      this.items = data.items;
      this.perks = data.perks;
      this.spells = data.spells;
      this.champion = data.champion;
    }

    update(data) {
      this.position = data.position;
      this.cellId = data.hasOwnProperty('cellId') ? data['cellId']: null;
      this.summonerName = data.hasOwnProperty('summonerName') ? data['summonerName'] : null;
      this.level = data.level;
      this.items = data.items;
      this.perks = data.perks;
      this.spells = data.spells;
      this.champion = data.champion;
    }

    addUniqueKill(name) {
      if (!this.uniqueKills.includes(name)) {
        this.uniqueKills.push(name);
      }
    }

    // using cellId (champSelect) or summonerName (in-game) for id
    getId() {
      return this.cellId === null ? this.summonerName : this.cellId;
    }

    getChampionIcon() {
      return this.champion['icon'];
    }

    getChampionName() {
      return this.champion['name'];
    }

    getChampionAbilities() {
      return this.champion['abilities'];
    }

    getSpellsCDr() {
      return this.cdReduction;
    }

    getAbilitiesCDr() {
      return this.cdReduction;
    }

    getSummonerName() {
      return this.summonerName;
    }

    getSummonerSpellName(index) {
      return this.spells[index]['name'];
    }

    getSummonerSpellImage(index) {
      return this.spells[index]['image'];
    }

    // TODO: Deal with teleport
    getSummonerSpellCooldown(index) {
      return this.spells[index]['cooldown'];
    }

  }
  return Participant;
});