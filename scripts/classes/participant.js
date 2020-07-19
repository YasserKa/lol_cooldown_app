define([
], function (
) {
  const RUNES_ENUM = {
    UltimateHunter: 8106,
    CooldownReduction: 5007,
    IngeniousHunter: 8134,
    Transcendence: 8210,
    CosmicInsight: 8347,
  };
  class Participant {


    constructor(data) {
      this.uniqueKills = [];
      this.cdRed = 0;
      this.ultCdRed = 0;
      this.cloudDrakeStacks = 0;

      this.originalAbilities = data['champion']['abilities'];
      this.currentAbilities = JSON.parse(JSON.stringify(this.originalAbilities));
      this.originalSpells = data['spells'];
      this.currentSpells = JSON.parse(JSON.stringify(this.originalSpells));

      this.position = data['position'];
      this.cellId = data.hasOwnProperty('cellId') ? data['cellId'] : null;
      this.summonerName = data.hasOwnProperty('summonerName') ? data['summonerName'] : null;
      this.level = data['level'];
      this.items = data['items'];
      this.runes = data['runes'];
      this.champion = data['champion'];
    }

    update(data) {
      this.position = data['position'];
      this.summonerName = data.hasOwnProperty('summonerName') ? data['summonerName'] : null;
      this.level = data['level'];
      this.items = data['items'];
      if (data.hasOwnProperty('runes')) {
        this.runes = data['runes'];
      }
      if (this.champion['name'] !== data['champion']['name']) {
        this.originalAbilities = data['champion']['abilities'];
        this.currentAbilities = JSON.parse(JSON.stringify(this.originalAbilities));
        this.champion = data['champion'];
      }
      if (this.originalSpells !== data['spells']) {
        this.originalSpells = data['spells'];
        this.currentSpells = JSON.parse(JSON.stringify(this.originalSpells));
      }

      this._updateCdRed();
      this._updateAbilitiesCd();
      this._updateSpellsCd();
    }

    updateCloudStacks(stacks) {
      this.cloudDrakeStacks = stacks;
      this._updateCdRed();
      this._updateAbilitiesCd();
    }

    addUniqueKill(name) {
      if (!this.uniqueKills.includes(name)) {
        this.uniqueKills.push(name);
      }
      this.updateAbilitiesCd();
    }

    setSummonerName(summonerName) {
      this.cellId = null;
      this.summonerName = summonerName;
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

    getUltimateCDr() {
      return this.ultCdRed;
    }

    getSummonerName() {
      return this.summonerName;
    }

    getSummonerSpellName(index) {
      return this.currentSpells[index]['name'];
    }

    getSummonerSpellImage(index) {
      return this.currentSpells[index]['image'];
    }

    // TODO: Deal with teleport
    getSummonerSpellCooldown(index) {
      return this.currentSpells[index]['cooldown'];
    }

    _updateCdRed() {
      // TODO: add it to runes.json
      const levelCdRed = [1, 1.53, 2.06, 2.59, 3.12, 3.65, 4.18, 4.71, 5.24, 5.76, 6.29, 6.82, 7.35, 7.88, 8.41, 8.94, 9.47, 10];
      let cdRed = 0;

      for (let item of this.items) {
        cdRed += item['cooldownReduction'];
      }

      if (this._hasRune(RUNES_ENUM.CooldownReduction)) {
        // when it's 0 don't decrease it by 1
        cdRed += levelCdRed[this.level - 1];
      }
      if (this._hasRune(RUNES_ENUM.Transcendence) && this.level >= 10) {
        cdRed += 10;
      }
      if (this._hasRune(RUNES_ENUM.CosmicInsight)) {
        cdRed += 5;
        // Max cdRed is 45%
        cdRed = cdRed > 45 ? 45 : cdRed;
      } else {
        // Max cdRed is 40%
        cdRed = cdRed > 40 ? 40 : cdRed;
      }

      this.cdRed = Number(cdRed.toFixed(2));

      // Ultimate Cooldown reduction addition from runes & dragon stacks
      // CloudStacks
      let runesUltCdRed = this.cloudDrakeStacks * 10;
      if (this._hasRune(RUNES_ENUM.UltimateHunter)) {
        runesUltCdRed += 5 + this.uniqueKills.length * 4
      }
      let addedUltcdRed = (100 - this.cdRed) * (runesUltCdRed / 100);
      this.ultCdRed = this.cdRed + addedUltcdRed;
    }

    _updateAbilitiesCd() {
      for (let key of Object.keys(this.originalAbilities)) {
        let cooldowns = this.originalAbilities[key]['cooldowns'];
        let newCds = [];

        // some abilities don't have cooldown, so *-* is used
        if (cooldowns[0] === '-') {
          continue;
        }

        if (key === "P") {
          // passives that don't have cooldowns or one cooldown only
          if (cooldowns.length === 18) {
            newCds = [cooldowns[this.level - 1]];
          } else {
            newCds = [cooldowns[0]];
          }
        } else {
          cooldowns.forEach(cooldown => {
            let newCd = 0;
            if (key === "R") {
              newCd = cooldown - (cooldown * (this.ultCdRed / 100));
            } else {
              newCd = cooldown - (cooldown * (this.cdRed / 100));
            }
            let roundedCd = Math.round(newCd * 2) / 2;
            newCds.push(roundedCd);
          });

        }

        this.currentAbilities[key]['cooldowns'] = newCds;
      }
    }

    _updateSpellsCd() {
      for (let key of Object.keys(this.originalSpells)) {
        // not assigned yet
        let cooldown = this.originalSpells[key]['cooldown'];
        if (cooldown === '-') {
          continue;
        }
        // exception: Teleport has 2 numbers 420-240
        if (this.originalSpells[key]['name'] == 'Teleport') {
          // formula from https://leagueoflegends.fandom.com/wiki/Teleport 
          cooldown = 430.588 - 10.588 * this.level;
        }
        let cdRed = 0;

        if (this._hasRune(RUNES_ENUM.CosmicInsight)) {
          cdRed += 5;
        }
        // Max cdRed is 45%
        // if (map == 'Howling Abyss')
        //     cdRed += 40;
        // if (this.hasCdrBoots)
        //     cdRed += 10;
        // if (this.hasFiveCdrRune) {
        //     if (map == 'Howling Abyss')
        //         cdRed += ((100 - cdRed) * 0.05);
        //     else
        //         cdRed += 5
        // }

        let newCd = cooldown - (cooldown * (cdRed) / 100)
        let roundedCd = Math.round(newCd * 2) / 2;
        this.currentSpells[key]['cooldown'] = roundedCd;
      }
    }

    _hasRune(id) {
      return Object.keys(this.runes).includes(id.toString());
    }

  }
  return Participant;
});