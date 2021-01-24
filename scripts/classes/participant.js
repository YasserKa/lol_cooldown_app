define([], function() {

    const RUNES_ENUM = {
        UltimateHunter: 'UltimateHunter',
        CooldownReduction: 'statmodscdrscaling',
        IngeniousHunter: 'IngeniousHunter',
        Transcendence: 'Transcendence',
        CosmicInsight: 'CosmicInsight',
        AttackSpeed: 'AttackSpeed',
        LegendAlacrity: 'LegendAlacrity',
    };

    class Participant {
        constructor(data) {
            this.kills = [];
            this.cdRed = 0;
            this.abilityHaste = 0;
            this.summonerSpellHaste = 0;
            this.ultCdRed = 0;
            this.spellsCdRed = 0;
            this.cloudDrakeStacks = 0;

            this.originalAbilities = data['champion']['abilities'];
            this.currentAbilities = JSON.parse(JSON.stringify(this.originalAbilities));
            this.originalSpells = data['spells'];
            this.currentSpells = JSON.parse(JSON.stringify(this.originalSpells));
            this.gameMode = data.gameMode
            this.creepScore = data.creepScore;

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
            this.creepScore = data.creepScore;
            if (data.hasOwnProperty('gameMode') && typeof data.gameMode !== 'undefined') {
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

        updateKills(kills) {
            this.kills = kills;
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

        getCDRedItems() {
            return this.items.filter(item => item.abilityHaste > 0);
        }

        getASItems() {
            return this.items.filter(item => item.attackSpeed > 0);
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
            return new Set(this.kills).size;
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

        _getCooldownReduction(haste) {
            return (1 - (1/(1+haste/100)))*100;
        }

        _updateCdRed() {
            this.abilityHaste = 0;

            for (let item of this.items) {
                // add unique cooldowns one time
                this.abilityHaste += item.abilityHaste;
            }

            if (this._hasRune(RUNES_ENUM.CooldownReduction)) {
                this.abilityHaste += 8;
            }

            if (this._hasRune(RUNES_ENUM.Transcendence)) {
                if (this.level >= 5) {
                    this.abilityHaste += 5;
                }
                if (this.level >= 10) {
                    this.abilityHaste += 5;
                }
            }

            this.cdRed = this._getCooldownReduction(this.abilityHaste)
            this.cdRed = Number(this.cdRed.toFixed(2));

            // Ultimate Cooldown reduction addition from runes & dragon stacks
            // CloudStacks
            let ultHaste = this.cloudDrakeStacks * 12;
            if (this._hasRune(RUNES_ENUM.UltimateHunter)) {
                ultHaste += 6 + new Set(this.kills).size * 5;
            }

            this.ultCdRed = this._getCooldownReduction(ultHaste+this.abilityHaste);
            this.ultCdRed = Number(this.ultCdRed.toFixed(2));

            // Spells Cooldown Reduction
            this.summonerSpellHaste = 0;
            let hasCdrBoots = this.items.filter(value => value.name === 'Ionian Boots of Lucidity').length > 0;

            if (hasCdrBoots)
                this.summonerSpellHaste += 12;
            if (this._hasRune(RUNES_ENUM.CosmicInsight))
                this.summonerSpellHaste += 18;

            // HA spell haste increases if boot or rune is available
            if (this.isSpellsCDrMode())
                this.summonerSpellHaste += 70 * this.summonerSpellHaste/100 + 70;

            this.spellsCdRed = this._getCooldownReduction(this.summonerSpellHaste);
            this.spellsCdRed = Number(this.spellsCdRed.toFixed(2));
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
                if ((this.champion.name === 'Yasuo' && key === 'Q') ||
                    (this.champion.name === 'Yone' && key === 'Q')
                ) {
                    let bonusAS = this._getBonusAS();
                    bonusAS = bonusAS > 111.1 ? 111.1 : bonusAS;
                    newCds = [cooldowns[0] * (1 - (0.01 * (bonusAS / 1.67)))];
                } else if (this.champion.name === 'Yone' && key === 'W') {
                    let bonusAS = this._getBonusAS();
                    bonusAS = bonusAS > 105 ? 105 : bonusAS;
                    newCds = [cooldowns[0] * (1 - (0.01 * (bonusAS / 1.68)))];
                } else if (key === "P" && this.champion.name !== 'Swain') {
                    // Swain's passive is affected by CDred
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
                            // yasou Q & yone Q, W are exception
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

        _getBonusAS() {
            let bonusAS = 0;
            // champion AS growth
            // formula extracted from https://leagueoflegends.fandom.com/wiki/Champion_statistic
            // 2.5 is AS growth for Yasou & Yone
            bonusAS += 2.5 * (this.level - 1) * (0.7025 + 0.0175 * (this.level - 1));
            let items = this.getASItems();
            for (let item of items) {
                bonusAS += item.attackSpeed;
            }
            if (this._hasRune(RUNES_ENUM.AttackSpeed)) {
                bonusAS += 10;
            }
            if (this._hasRune(RUNES_ENUM.LegendAlacrity)) {
                // 100 points for champion Damage rating takedowns
                // 100 points for epic monster Damage rating takedowns
                // 25 points for large monster kills
                // 4 points for minion kills
                let points = (this.creepScore  * 4 + this.kills.length * 100);
                bonusAS += 3 + parseInt(points / 100);
            }

            return bonusAS;
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
