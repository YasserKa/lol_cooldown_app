define([
    "../../scripts/services/settings.js",
    "../../scripts/helpers/utils.js",
], function (
    Settings,
    Utils
) {

    let _timeSetting = '';
    let _displaySetting = '';

    let timers = {}

    function initializeView(game) {
        $(".game-details .team").remove();
        _createGame(game);
        update(game);

        if (game.isInGame()) {
            // Timers
            $(`.spell-overlay`).click(function() {
                let particId = $(this).parents('table[partic-id]').attr('partic-id');
                let partic = game.getParticipantUsingSummonerName(particId);

                let spellId = $(this).attr('spell');
                let cooldown = partic.getSummonerSpellCooldown(spellId);
                let timerId = (particId).toString() + (spellId).toString()

                // If it's already working
                if (timerId in timers) {
                    stopTimer($(this), timerId, true)
                } else {
                    startTimer(cooldown, $(this), timerId);
                }
            });
        }

    }

    function update(game) {
        _updateView(game);
    }

    function _updateView(game) {
        _timeSetting = Settings.getSetting(Settings.SETTINGS.CD_TIME);
        _displaySetting = Settings.getSetting(Settings.SETTINGS.CD_RED_DISPLAY);

        _updateTeam(game.getBlueTeam(), 'blue');
        _updateTeam(game.getRedTeam(), 'red');

        // updating tool-top package
        tippy('[data-toggle="tooltip"]', {
            appendTo: 'parent',
            allowHTML: true,
        });

    }

    function _updateTeam(team, color) {
        for (let participant of team) {
            let firstSpellCooldownEl = _getNumberElement(
                _getParsedCooldown(participant.getSummonerSpellCooldown(0)));
            let secondSpellCooldownEl = _getNumberElement(
                _getParsedCooldown(participant.getSummonerSpellCooldown(1)));
            // update champion
            $(`table[partic-id="${participant.getId()}"] .champ-icon`)
                .attr('src', participant.getChampionIcon())
                .attr('champ-name', participant.getChampionName());

            // cooldownReduction if in-game
            if (participant.isInGame()) {
                _updateCooldownReduction(participant);
            }

            // champ Abilities
            $(`table[partic-id="${participant.getId()}"] .cooldowns-abilities`).remove();
            if (participant.getChampionAbilities().length !== 0 &&
                $(`table[partic-id="${participant.getId()}"] .cooldowns-abilities`).length === 0) {
                $(`table[partic-id="${participant.getId()}"]`).append(_createAbilities(participant, color));
            }

            // update spells
            $(`table[partic-id="${participant.getId()}"] div.spell-1 img`)
                .attr('src', participant.getSummonerSpellImage(0))
                .attr('spell-name', participant.getSummonerSpellName(0));

            $(`table[partic-id="${participant.getId()}"] div.spell-1 p.cooldown`)
                .attr('spell-name', participant.getSummonerSpellName(0))
            $(`table[partic-id="${participant.getId()}"] div.spell-1 p.cooldown`)
                .html(firstSpellCooldownEl);

            $(`table[partic-id="${participant.getId()}"] div.spell-2 img`)
                .attr('src', participant.getSummonerSpellImage(1))
                .attr('spell-name', participant.getSummonerSpellName(1));

            $(`table[partic-id="${participant.getId()}"] div.spell-2 p.cooldown`)
                .attr('spell-name', participant.getSummonerSpellName(1))
            $(`table[partic-id="${participant.getId()}"] div.spell-2 p.cooldown`)
                .html(secondSpellCooldownEl);
        }
    }

    function _createGame(game) {
        let el = _createTeam(game.getBlueTeam(), 'blue') + _createTeam(game.getRedTeam(), 'red');

        $(".game-details").append(el);

    }

    function _createTeam(team, color) {
        // start team element
        let el =
            `<div id="team-${color}" class="team row justify-content-center mx-auto mt-2 team-${color}">`
        for (let participant of team) {
            el += _createParticipant(participant, color);
        }
        // end team element
        el += `</div>`
        return el;
    }

    function _createParticipant(participant, teamColor) {
        let firstSpellCooldownEl = _getNumberElement(
            _getParsedCooldown(participant.getSummonerSpellCooldown(0)));
        let secondSpellCooldownEl = _getNumberElement(
            _getParsedCooldown(participant.getSummonerSpellCooldown(1)));
        let el =
            `
        <table class="champ" partic-id="${participant.getId()}">
            <tbody>
                <tr>
                    <th class="${teamColor}" colspan=4></th>
                </tr>
                <tr class="champ-header">
                    <td class="cell champ p-0" colspan=4>
                        <div class="champ-icon-container d-inline-block">
                           <div class="icon-container">
                            <img class="champ-icon" src="${participant.getChampionIcon()}" alt="" champ-name="${participant.getChampionName()}">
                            </div>
                        </div>
                        <div class="spells-cdr-holder d-inline-block">
                        </div>
                        <div class="cell spells p-0 d-inline-flex">
                            <div class="spell-1 d-inline-block">
                               <div class="spell-icon-container">
                                   <div class="icon-container">
                                        <img class="spell-icon" src="${participant.getSummonerSpellImage(0)}" alt="" spell-name="${participant.getSummonerSpellImage(0)}">
                                        <div class="spell-overlay" summonerName="${participant.getChampionName()}" spell="0">
                                          <p></p>
                                        </div>
                                   </div>
                               </div>
                                <p class="cooldown" spell="0" spell-name="${participant.getSummonerSpellName(0)}">${firstSpellCooldownEl}</p>
                            </div>
                            <div class="spell-2 d-inline-block">
                               <div class="spell-icon-container">
                                   <div class="icon-container">
                                    <img class="spell-icon" src="${participant.getSummonerSpellImage(1)}" alt="" spell-name="${participant.getSummonerSpellImage(1)}">
                                        <div class="spell-overlay" summonerName="${participant.getChampionName()}" spell="1">
                                          <p></p>
                                        </div>
                                    </div>
                                </div>
                                    <p class="cooldown" spell="0" spell-name="${participant.getSummonerSpellName(1)}">${secondSpellCooldownEl}</p>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbdoy>
        </table>`;
        return el;
    }
    function _createAbilities(participant, teamColor) {
        let el =
            `<tr class="cooldowns-abilities" ><td class="row-cooldowns p-0" colspan=4>
                <!-- Champ Details -->
                <table class="abilities"><tbody>`;
        for (let [key, ability] of Object.entries(participant.getChampionAbilities())) {
            el +=
                `<tr>
                <th class="p-0">
                    <div class='ability-img-container d-flex'>
                        <img class="ability-icon" src="${ability['icon']}" alt="${ability['name']}" ability="${key}" `;
            // add description for abilities that has cooldown reduction effect
            if (ability['cdrType'] != '') {
                el +=
                    ` data-toggle="tooltip" data-tippy-content= "${ability['description']}"/>`
            } else {
                el += `/>`
            }
            // aphelios exception
            if (ability.hasOwnProperty('icon1')) {
                el += `<img class="ability-icon" src="${ability['icon1']}" alt="${ability['name1']}" ability="${key}"/> `;
            }

            el += `<div class="indication ${teamColor}"></div>`;
            if (ability['cdrType'] != '') {
                el += `<img class="info" src="/img/info.svg" data-toggle="tooltip" data-tippy-content="This ability decreases cooldowns" />`
            }

            el +=
                `</div >
            </th >
              <td class="p-0">
                  <div class="cooldowns m-0 d-flex justify-content-center" ability="${key}">`

            for (let cooldown of ability['cooldowns']) {
                let cooldownEl = _getNumberElement(_getParsedCooldown(cooldown));
                el += `<p class="m-0 cooldown">
                    ${cooldownEl}
                      </p>`;
                // just state one number if it's repetitive number
                if (ability['cooldowns'].length === 1 || ability['cooldowns'][0] === ability['cooldowns'][1]) {
                    break;
                }
            }
            el += '</div> </td> </tr>';
        }
        el += '</tbody> </table></td></tr>'

        return el;
    }

    function _updateCooldownReduction(participant) {
        $(`table[partic-id="${participant.getId()}"] .cdr`).remove();

        if (_displaySetting) {
            $(`table[partic-id="${participant.getId()}"]`).append(_createCdRedCell(participant));
            $(`table[partic-id="${participant.getId()}"] .spells-cdr-holder`)
                .html(_createSpellCdRedCell(participant));
        }
    }

    function _createSpellCdRedCell(participant) {
        let el = '<div class="cdr spells-cdr-cell mx-auto">';
        let cdRedSpells = participant.getSummonerSpellsCDr();
        if (cdRedSpells == 0) {
            return el;
        }
        let items = participant.getItems();
        let runes = participant.getRunes();
        let isSpellsCDrMode = participant.isSpellsCDrMode();
        let neededItems = items.filter(item => item.name === 'Ionian Boots of Lucidity');
        let neededRune = runes.hasOwnProperty('CosmicInsight') ? runes.CosmicInsight : false;

        if (neededItems.length > 0) {
            el += `<img class="item-icon ml-1" src="${neededItems[0].icon}" alt="${neededItems[0].name}">`;
        }

        if (neededRune) {
            el += `<img class="item-icon ml-1" src="${neededRune.image}" alt="${neededRune.name}" data-toggle="tooltip" data-tippy-content="${neededRune.description}">`
        }

        if (isSpellsCDrMode) {
            el += `<img class="item-icon ml-1" src="/img/howling_abyss.png" alt="" data-tippy-content="+40% Summoner Spell CDR">`;
        }

        el += `<p class="spells-cdr-value d-inline">${_getNumberElement(participant.getSummonerSpellsCDr())}</p>`;
        el += '</div>';

        return el;
    }

    function _createCdRedCell(participant) {
        let el = `<tr class="cdr abilities-cdr-cell">`;
        let runes = participant.getRunes();
        let cloudStacks = participant.getCloudStacks();
        // in clash & aram there's no cloud drake
        let isSpellsCDrMode = participant.isSpellsCDrMode();

        let items = participant.getCDRedItems();

        el += '<td class="items d-inline-flex">'
        // items
        for (let [index, item] of Object.entries(items)) {
            el += `<img class="item-icon ml-1"`;
            if (index != 0) {
                el += `style=" position: absolute;left:${index * 15}px"`;
            }
            el += `src="${item.icon}" alt="${item.name}">`;
        }
        el += '</td>'

        // normal abilities runes
        el += '<td class="runes d-inline-flex">'
        let index = 0;
        for (let [key, rune] of Object.entries(runes)) {
            if (key === 'UltimateHunter' || key === 'IngeniousHunter'
                || key === 'AttackSpeed' || key === 'LegendAlacrity' ||
                key === 'CosmicInsight') {
                continue;
            }
            el += `<img class="rune-icon ml-1"`;
            if (index != 0) {
                el += `style=" position: absolute;left:${index * 15}px"`;
            }
            el += `src="${rune.image}" alt="${rune.name}" data-toggle="tooltip" data-tippy-content="${rune.description}">`


            index++;
        }
        el += '</td>';
        el += '<td>';
        let abilitiesCdrEl = _getNumberElement(participant.getAbilitiesCDr());
        el += `<p class="ability-cdr-value text-center">${abilitiesCdrEl}</p>`
        el += '</td></tr>'

        // ultimate
        el += '<tr class="cdr ultimate-cdr-cell">'

        el += '<td class="kill-count-container text-center d-inline-flex"><div class="d-inline-flex m-auto">'
        if (runes.hasOwnProperty('UltimateHunter')) {
            let rune = runes.UltimateHunter;
            el += `<p class="kill-count-value"> ${participant.getUniqueKillsCount()}</p>
                   <img class="rune-icon ml-1" src="${rune.image}" alt="${rune.name}" data-toggle="tooltip" data-tippy-content="${rune.description}">`
        }
        el += '</div></td>'

        if (!isSpellsCDrMode) {
            el += '<td class="cloud-stacks-container text-center d-inline-flex"><div class="d-inline-flex m-auto">'
            el += `<p class="cloud-stacks-value">${cloudStacks}</p><img class="buff ml-1" src="/img/cloud_buff.png" alt="cloud_buff">`
            el += '</div></td>'
        }

        el += '<td>'
        let ultCdrEl = _getNumberElement(participant.getUltimateCDr());
        el += `<p class="ultimate-cdr-value">${ultCdrEl}</p></td>`
        el += '</td>'

        el += `</tr>`;

        return el;
    }

    function startTimer(duration, element, id) {
        element.children()[0].textContent = _getParsedCooldown(Math.floor(duration));
        duration--;
        element.css("opacity", "1");

        let intervalId = setInterval(function () {
            element.children()[0].textContent = _getParsedCooldown(Math.floor(duration));

            if (--duration < 0) {
                stopTimer(element, id);
            }
        }, 1000);

        timers[id] = intervalId;
    }

    function stopTimer(element, id, triggered=false) {
        clearInterval(timers[id]);
        delete timers[id];

        let timer_sound_setting = Settings.getSetting(Settings.SETTINGS.TIMER_SOUND);

        element.css("opacity", "0");

        // if player disables it, no need to alert them
        if (triggered) {
            return;
        }
        switch (timer_sound_setting) {
            case Settings.TIMER_SOUND.None:
                break;
            case Settings.TIMER_SOUND.Bell:
                Utils.makeBellSound();
                break;
            case Settings.TIMER_SOUND.Speech:
                let summonerSpellName = element.siblings().attr('spell-name');
                let summonerName = element.attr('summonerName');

                Utils.makeSoundAfterSummonerSpellIsUp(summonerName, summonerSpellName);
                break;
            default:
        }
    }

    function _getParsedCooldown(cooldown) {
        // passives with no CD uses dash (-)
        if (cooldown == '-')
            return '-';

        // rounded it to 0/0.5
        cooldown = Math.round(cooldown * 2) / 2;

        if (_timeSetting == 'minutes' && cooldown >= 60) {
            var minutes = Math.floor(cooldown / 60);
            var seconds = cooldown - minutes * 60;

            cooldown = (minutes).toString() + ':';
            // Make it 00 or 00.5 instead of 0 0.5
            if (Math.floor(seconds) < 10) {
                cooldown += '0'
            }
            cooldown += (seconds).toString();
        }
        return cooldown.toString();
    }


    function _getNumberElement(number) {
        if (number == '-') {
            return `<span>-</span>`;
        }
        number = (number).toString();

        let indexOfDot = number.indexOf('.');
        if (indexOfDot === -1) {
            return `<span>${number}</span>`
        }
        let beforeDot = number.substring(0, indexOfDot);
        let afterDot = number.substring(indexOfDot + 1);
        return `<span>${beforeDot}</span><small>.${afterDot}</small>`;
    }

    return {
        update,
        initializeView,
    }
});
