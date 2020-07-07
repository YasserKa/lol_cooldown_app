define([
], function (
) {
  class Participant {

    /* Runes
     * 8106 UltimateHunter 
     * 5007 0-10 CD
     * 8134 Ingenious Hunter (items)
     * 8210 Transcendence
     * 8347 Cosmic Insight
    */
    constructor(data) {
      this.uniqueKills = [];
      this.cdRed = 0;
      this.cloudDrakeStacks = 0;

      // // Keeps track of abilities CD changes
      this.originalAbilities = data.champion['abilities']
      this.currentAbilities = JSON.parse(JSON.stringify(this.originalAbilities));
      // this.originalSpells = participantInfo['spells'];
      // this.currentSpells = JSON.parse(JSON.stringify(this.originalSpells));

      this.position = data.position;
      this.cellId = data.hasOwnProperty('cellId') ? data['cellId']: null;
      this.summonerName = data.hasOwnProperty('summonerName') ? data['summonerName'] : null;
      this.level = data.level;
      this.items = data.items;
      this.runes = data.runes;
      this.spells = data.spells;
      this.champion = data.champion;
    }

    update(data) {

      this.position = data.position;
      this.cellId = data.hasOwnProperty('cellId') ? data['cellId']: null;
      this.summonerName = data.hasOwnProperty('summonerName') ? data['summonerName'] : null;
      this.level = data.level;
      this.items = data.items;
      if  (data.hasOwnProperty('runes')) {
        this.runes = data.runes;
      }
        this.runes = [5007, 8106, 8134, 8210, 8347];
      this.spells = data.spells;
      if (this.champion['name'] !== data.champion['name']) {
        this.originalAbilities = data.champion['abilities']
        this.currentAbilities = JSON.parse(JSON.stringify(this.originalAbilities));
        this.champion = data.champion;
      }
      this.updateCdRed();
      this.updateAbilitiesCd();
    }
    updateCdRed() {
      const levelCdRed = [1, 1.53, 2.06, 2.59, 3.12, 3.65, 4.18, 4.71, 5.24, 5.76, 6.29, 6.82, 7.35, 7.88, 8.41, 8.94, 9.47, 10];
      let cdRed = 0;

      // TODO: get CDr with items

     // 5007 0-10 CD
      if (this.runes.includes(5007)) {
        // when it's 0 don't decrease it by 1
        let level = this.level === 0 ? 0 : this.level - 1;
        cdRed += levelCdRed[level];
      }
     // 8210 Transcendence
      if (this.runes.includes(8210) && this.level >= 10) {
        cdRed += 10;
      }
     // 8347 Cosmic Insight
      if (this.runes.includes(8347)) {
        cdRed += 5;
        // Max cdRed is 45%
        cdRed = cdRed > 45 ? 45 : cdRed;
      } else {
        // Max cdRed is 40%
        cdRed = cdRed > 40 ? 40 : cdRed;
      }

      this.cdRed = cdRed;
    }

    updateCloudStacks(stacks) {
      this.cloudDrakeStacks = stacks;
      this.updateAbilitiesCd();
    }

    addUniqueKill(name) {
      if (!this.uniqueKills.includes(name)) {
        this.uniqueKills.push(name);
      }
    }

    updateAbilitiesCd() {
      // Ultimate Cooldown reduction addition from runes & dragon stacks
      // CloudStacks
      let runesUltCdRed = this.cloudDrakeStacks;
      // 8106 UltimateHunter 
      if (this.runes.includes(8106)) {
        runesUltCdRed += 5 + this.uniqueKills.length * 4
      }
      let addedUltcdRed = (100 - this.cdRed) * (runesUltCdRed / 100);
      let ultCdRed = (this.cdRed + addedUltcdRed) / 100;
      // basic abilities cooldownreduction
      let cdRed = this.cdRed / 100;

      for (let key of Object.keys(this.originalAbilities)) {
        // TODO
        if (key === "P") {
          let passiveCooldowns = this.originalAbilities['P']['cooldowns'];
          // passives that don't have cooldowns
          if (passiveCooldowns.length <= 1) {
            continue;
          }
          let level = this.level === 0 ? 0 : this.level - 1;
          this.currentAbilities['P']['cooldowns'] = [passiveCooldowns[level]];
          continue;
        }
        let cooldowns = this.originalAbilities[key]['cooldowns'];
        let newCds = [];

        // some abilities don't have cooldown, so *-* is used
        if (cooldowns[0] === '-') {
          continue;
        }

        cooldowns.forEach(cooldown => {
          let newCd = 0;
          if (key === "R") {
            newCd = cooldown - (cooldown * ultCdRed);
          } else {
            newCd = cooldown - (cooldown * cdRed);
          }
          let roundedCd = Math.round(newCd * 2) / 2;
          newCds.push(roundedCd);
        })
        this.currentAbilities[key]['cooldowns'] = newCds;
        console.log(newCds);
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
      return this.currentAbilities;
    }

    getSpellsCDr() {
      return this.cdReduction;
    }

    getAbilitiesCDr() {
      return this.cdRed;
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