define([], function() {

    const RUNES_ENUM = {
        UltimateHunter: 'UltimateHunter',
        CooldownReduction: 'statmodscdrscaling',
        IngeniousHunter: 'IngeniousHunter',
        Transcendence: 'Transcendence',
        CosmicInsight: 'CosmicInsight',
    };

    class Participant {
        constructor(data) {
            this.uniqueKills = [];
            this.cdRed = 0;
            this.ultCdRed = 0;
            this.spellsCdRed = 0;
            this.cloudDrakeStacks = 0;

            this.originalAbilities = data['champion']['abilities'];
            this.currentAbilities = JSON.parse(JSON.stringify(this.originalAbilities));
            this.originalSpells = data['spells'];
            this.currentSpells = JSON.parse(JSON.stringify(this.originalSpells));
            this.gameMode = data.gameMode

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
            this.level = data['level'];
            this.items = data['items'];
            if (data.hasOwnProperty('gameMode')) {
                this.gameMode = data.gameMode
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
            this._updateAbilitiesCd();
        }

        setSummonerName(summonerName) {
            this.summonerName = summonerName;
        }

        // using cellId (champSelect) or summonerName (in-game) for id
        getId() {
            return this.summonerName === null ? this.cellId : this.summonerName;
        }
        getCellId() {
            return this.cellId;
        }

        getSummonerName() {
            return this.summonerName;
        }

        getPosition() {
            return this.position;
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

        getRunes() {
            return this.runes;
        }

        getItems() {
            return this.items;
        }

        getSpellsCDr() {
            return this.cdReduction;
        }

        isSpellsCDrMode() {
            return this.gameMode == 'ARAM' || this.gameMode == 'NEXUSBLITZ';
        }

        getAbilitiesCDr() {
            return this.cdRed;
        }

        getUltimateCDr() {
            return this.ultCdRed;
        }

        getSummonerSpellsCDr() {
            return this.spellsCdRed;
        }

        getUniqueKillsCount() {
            return this.uniqueKills.length;
        }

        getCloudStacks() {
            return this.cloudDrakeStacks;
        }

        getSummonerSpellName(index) {
            return this.currentSpells[index]['name'];
        }

        getSummonerSpellImage(index) {
            return this.currentSpells[index]['image'];
        }

        getSummonerSpellCooldown(index) {
            return this.currentSpells[index]['cooldown'];
        }

        isInGame() {
            return this.summonerName !== null;
        }

        _updateCdRed() {
            const levelCdRed = [1, 1.53, 2.06, 2.59, 3.12, 3.65, 4.18, 4.71, 5.24, 5.76, 6.29, 6.82, 7.35, 7.88, 8.41, 8.94, 9.47, 10];
            let cdRed = 0;
            let itemsUsed = [];

            for (let item of this.items) {
                // add unique cooldowns one time
                if (!itemsUsed.includes(item.name)) {
                    cdRed += item.uniqueCooldownReduction;
                }
                itemsUsed.push(item.name);
                cdRed += item.cooldownReduction;
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
            this.ultCdRed = Number(this.ultCdRed.toFixed(2));

            // Spells Cooldown Reduction
            let spellsCdRed = 0;
            let hasCdrBoots = this.items.filter(value => value.name === 'Ionian Boots of Lucidity').length > 0;

            // Max cdRed is 45%
            if (this.isSpellsCDrMode())
                spellsCdRed += 40;
            if (hasCdrBoots)
                spellsCdRed += 10;
            if (this._hasRune(RUNES_ENUM.CosmicInsight)) {
                if (this.isSpellsCDrMode())
                    spellsCdRed += ((100 - spellsCdRed) * 0.05);
                else
                    spellsCdRed += 5
            }

            this.spellsCdRed = spellsCdRed;
        }

        _updateAbilitiesCd() {
            for (let key of Object.keys(this.originalAbilities)) {
                let cooldowns = this.originalAbilities[key]['cooldowns'];
                let rechargeRate = this.originalAbilities[key]['rechargeRate'];
                let newCds = [];

                // prioritize recharge rate on cooldown
                if (rechargeRate[0] !== '-') {
                    cooldowns = rechargeRate;
                }

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
                    // kled recharge is level based
                    if (cooldowns.length === 18) {
                        newCds = [cooldowns[this.level - 1]];
                    } else {
                        cooldowns.forEach(cooldown => {
                            let newCd = 0;
                            if (key === "R") {
                                newCd = cooldown - (cooldown * (this.ultCdRed / 100));
                            } else {
                                newCd = cooldown - (cooldown * (this.cdRed / 100));
                            }
                            newCds.push(newCd);
                        });
                    }

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

                // use recharge time instead of cooldown
                if (this.originalSpells[key]['name'] == 'Smite') {
                    cooldown = 90
                }
                // exception: Teleport has 2 numbers 420-240
                if (this.originalSpells[key]['name'] == 'Teleport') {
                    // formula from https://leagueoflegends.fandom.com/wiki/Teleport
                    cooldown = 430.588 - 10.588 * this.level;
                }

                let newCd = cooldown - (cooldown * (this.spellsCdRed) / 100)
                let roundedCd = Math.round(newCd);
                this.currentSpells[key]['cooldown'] = roundedCd;
            }
        }

        _hasRune(id) {
            return Object.keys(this.runes).includes(id.toString());
        }

    }
    return Participant;
})
