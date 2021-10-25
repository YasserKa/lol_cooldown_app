define([
    "../../scripts/services/settings.js",
    "../../scripts/helpers/utils.js",
], function (
    Settings,
    Utils
) {

    let _timeSetting = '';
    let _isBasicuiModeSetting = false;
    let _basicUIDone = false;

    let timers = {}
    let _game = null;

    function initializeView(game = null) {

        if (game !== null) {
            _game = game;
         }

        _isBasicuiModeSetting = Settings.getSetting(Settings.SETTINGS.UI_MODE) == Settings.UI_MODES.BASIC && _game !== null && _game.isInGame();

        _relevantUltCd = Settings.getSetting(Settings.SETTINGS.RELEVANT_ULT_CD);
        $(".game-details .team").remove();
        _createGame(_game);
        update(_game);

        // if (_game.isInGame()) {
        //     $(`.ultimate-overlay, .spell-overlay`).click(function() {
        //         _updateOverlayTimers(this);
        //     });
        // }

        tippy('[data-toggle="tooltip-abilities"]', {
            theme: 'dark',
            appendTo: 'parent',
            allowHTML: true,
        });
    }

    function _updateOverlayTimers(el) {
        let particId = $(el).parents('table[partic-id]').attr('partic-id');
        let partic = _game.getParticipantUsingSummonerName(particId);

        let name = $(el).attr('name');
        let type = $(el).attr('type');
        let cooldown = 0;

        switch (type) {
            case 'summoner-spell':
                let spellId = $(el).attr('spell');
                cooldown = partic.getSummonerSpellCooldown(spellId);
                break
            case 'ultimate':
                cooldown = partic.getCurrentUltimateCD();
                break;
            case 'item':
                cooldown = Number($(el).parent().siblings().attr('cooldown'));
                break;
            default:
        }

        let timerId = (particId).toString() + name;

        // If it's already working
        if (timerId in timers) {
            stopTimer($(el), timerId, true)
        } else {
            startTimer(cooldown, $(el), timerId);
        }
    }

    function update(game) {
        _updateView(game);
    }

    function _updateView(game) {
        _timeSetting = Settings.getSetting(Settings.SETTINGS.CD_TIME);
        _relevantUltCd = Settings.getSetting(Settings.SETTINGS.RELEVANT_ULT_CD);

        if (_isBasicuiModeSetting && !_basicUIDone) {
            _createGame(game);
        }

        _updateTeam(game.getBlueTeam(), 'blue', !game.isInGame());
        _updateTeam(game.getRedTeam(), 'red', !game.isInGame());

        // updating tool-top package
        // tippy('[data-toggle="tooltip"]', {
        //     theme: 'dark',
        //     appendTo: 'parent',
        //     allowHTML: true,
        //    showOnCreate: true,
        // hideOnClick: false,
        // trigger: 'click',
        // interactive: true,
        // });
        tippy('[data-toggle="tooltip"]', {
            theme: 'dark',
            appendTo: 'parent',
            allowHTML: true,
        });

    }

    function _updateTeam(team, color, isInChampSelect) {
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
                _updateActiveItems(participant);
                $(`table[partic-id="${participant.getId()}"] .spells-cdr-holder`).html(_createSpellCdRedCell(participant));
            }

            // if in champ select, remove abilities and use the updated
            // champion's ones
            if (isInChampSelect) {
                $(`table[partic-id="${participant.getId()}"] .cooldowns-abilities`).remove();
                if (participant.getChampionAbilities().length !== 0 &&
                    $(`table[partic-id="${participant.getId()}"] .cooldowns-abilities`).length === 0) {
                    $(`table[partic-id="${participant.getId()}"]`).append(_createAbilities(participant, color, true));
                }
            } else {
                _updateAbilities(participant, color);
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

        $(".game-details").empty();
        $(".game-details").append(el);

        if (game.isInGame()) {
            $(`.ultimate-overlay, .spell-overlay`).click(function() {
                _updateOverlayTimers(this);
            });
        }
    }

    function _createTeam(team, color) {
        // start team element
        let el = '';
        if (_isBasicuiModeSetting) {
        el +=
            `<div id="team-${color}" class="team row justify-content-center mx-auto mt-1 team-${color}">`
        $('.footer').hide();
        } else {
        el +=
            `<div id="team-${color}" class="team row justify-content-center mx-auto mt-2 team-${color}">`;
        $('.footer').show();
        }
        for (let participant of team) {
            // TODO: setting here and not color of current player
            if (_isBasicuiModeSetting) {
              if (color === _game.getEnemyTeamColor()) {
                el += _createParticipantBasic(participant, color);
              }
             if (_game.getEnemyTeamColor() !== "") {
                _basicUIDone = true;
             }
            } else {
                el += _createParticipant(participant, color);
            }
        }
        // end team element
        el += `</div>`
        return el;
    }

    function _createParticipantBasic(participant, teamColor) {
        let firstSpellCooldownEl = _getNumberElement(
            _getParsedCooldown(participant.getSummonerSpellCooldown(0)));
        let secondSpellCooldownEl = _getNumberElement(
            _getParsedCooldown(participant.getSummonerSpellCooldown(1)));
        let el =
            `
        <table class="champ" partic-id="${participant.getId()}">
            <tbody>
                <tr class="champ-header">
                    <td class="cell champ p-0 text-center" colspan=4>
                        <div class="champ-icon-container d-inline-block">
                           <div class="icon-container">
                            <img class="champ-icon" src="${participant.getChampionIcon()}" alt="" champ-name="${participant.getChampionName()}">
                            </div>
                        </div>
                    </td>
                        </tr>
                        <tr>
                    <td class="text-center">
                        <div class="cell spells  p-0 d-inline-flex">
                            <div class="spell-1 d-inline-block mr-1">
                               <div class="spell-icon-container">
                                   <div class="icon-container">
                                        <img class="spell-icon" src="${participant.getSummonerSpellImage(0)}" alt="" spell-name="${participant.getSummonerSpellImage(0)}">
                                        <div class="spell-overlay overlay" type="summoner-spell" name="${participant.getSummonerSpellName(0)}" summonerName="${participant.getChampionName()}" spell="0">
                                          <p></p>
                                        </div>
                                   </div>
                               </div>
                            </div>
                            <div class="spell-2 d-inline-block">
                               <div class="spell-icon-container">
                                   <div class="icon-container">
                                    <img class="spell-icon" src="${participant.getSummonerSpellImage(1)}" alt="" spell-name="${participant.getSummonerSpellImage(1)}">
                                        <div class="spell-overlay overlay" type="summoner-spell" name="${participant.getSummonerSpellName(1)}" summonerName="${participant.getChampionName()}" spell="1">
                                          <p></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="text-center">`;
        el += createUltimateAbility(participant, teamColor);

        el += `</td>
                </tr>
                <tr class="active-items">
                    <td colspan="2" class="items">
                    </td>
                </tr>
            </tbdoy>
            `;

        el +=`
        </table>`;
        return el;
    }

    function createUltimateAbility(participant, teamColor, in_champselect=false){
        let el = '';
        let abilities = participant.getChampionAbilities()
        let ability = abilities['R'];

        let cooldowns = JSON.parse(JSON.stringify(ability['cooldowns']));
        if (!in_champselect && _relevantUltCd) {
            cooldowns = participant.getCurrentUltimateCD();
        }
            el +=
                `
                    <div class='ability-img-container d-flex'>
                        <img class="ability-icon" src="${ability['icon']}" alt="${ability['name']}" ability="R"> <div class="ultimate-overlay overlay" type="ultimate" name="ultimate"  summonerName="${participant.getChampionName()}"`

                el += `<p></p>
                    </div>`;
        return el;
        }



    function _createParticipant(participant, teamColor) {
        let firstSpellCooldownEl = _getNumberElement(
            _getParsedCooldown(participant.getSummonerSpellCooldown(0)));
        let secondSpellCooldownEl = _getNumberElement(
            _getParsedCooldown(participant.getSummonerSpellCooldown(1)));
        let el =
            `
        <table class="champ advanced" partic-id="${participant.getId()}">
            <tbody>
                <tr>
                    <th class="${teamColor}" colspan=4></th>
                </tr>
                <tr class="champ-header">
                    <td class="cell champ p-0" colspan=4>
                        <div class="champ-icon-container advanced d-inline-block">
                           <div class="icon-container">
                            <img class="champ-icon" src="${participant.getChampionIcon()}" alt="" champ-name="${participant.getChampionName()}">
                            </div>
                        </div>
                        <div class="spells-cdr-holder d-inline-block">
                        </div>
                        <div class="cell spells advanced p-0 d-inline-flex">
                            <div class="spell-1 d-inline-block">
                               <div class="spell-icon-container advanced">
                                   <div class="icon-container">
                                        <img class="spell-icon" src="${participant.getSummonerSpellImage(0)}" alt="" spell-name="${participant.getSummonerSpellImage(0)}">
                                        <div class="spell-overlay overlay" type="summoner-spell" name="${participant.getSummonerSpellName(0)}" summonerName="${participant.getChampionName()}" spell="0">
                                          <p></p>
                                        </div>
                                   </div>
                               </div>
                                <p class="cooldown" spell="0" spell-name="${participant.getSummonerSpellName(0)}">${firstSpellCooldownEl}</p>
                            </div>
                            <div class="spell-2 d-inline-block">
                               <div class="spell-icon-container advanced">
                                   <div class="icon-container">
                                    <img class="spell-icon" src="${participant.getSummonerSpellImage(1)}" alt="" spell-name="${participant.getSummonerSpellImage(1)}">
                                        <div class="spell-overlay overlay" type="summoner-spell" name="${participant.getSummonerSpellName(1)}" summonerName="${participant.getChampionName()}" spell="1">
                                          <p></p>
                                        </div>
                                    </div>
                                </div>
                                    <p class="cooldown" spell="0" spell-name="${participant.getSummonerSpellName(1)}">${secondSpellCooldownEl}</p>
                            </div>
                        </div>
                    </td>
                </tr>
                <tr class="active-items">
                    <td colspan="2" class="items">
                    </td>
                </tr>
            </tbdoy>
            `;
        el += _createAbilities(participant, teamColor);

        el +=`
        </table>`;
        return el;
    }

    // in_game argument is used, so you always show the R cooldowns regardless
    // of the show relevant ULT CD setting
    function _updateAbilities(participant, teamColor) {
        let x = 0;
        for (let [key, ability] of Object.entries(participant.getChampionAbilities())) {
            let cooldowns = JSON.parse(JSON.stringify(ability['cooldowns']));
            if (_relevantUltCd && key === "R" && ability['cooldowns'].length > 1) {
                cooldowns = participant.getCurrentUltimateCD();
            }
            let el = "";
            for (let cooldown of cooldowns) {
                let cooldownEl = _getNumberElement(_getParsedCooldown(cooldown));
                el += `<p class="m-0 cooldown">
                        ${cooldownEl}
                          </p>
                        `;
                // just state one number if it's repetitive number
                if (cooldowns.length === 1 || cooldowns[0] === cooldowns[1]) {
                    break;
                }
            }
            $($(`.team-${teamColor} .champ[partic-id="${participant.getId()}"] .abilities td div.cooldowns`)[x]).html(el);
            x++
        }

    }
    function _createAbilities(participant, teamColor, in_champselect = false) {
        let el =
            `<tr class="cooldowns-abilities" ><td class="row-cooldowns p-0" colspan=4>
                <!-- Champ Details -->
                <table class="abilities"><tbody>`;
        for (let [key, ability] of Object.entries(participant.getChampionAbilities())) {
            // TODO: add condition using the setting
            let cooldowns = JSON.parse(JSON.stringify(ability['cooldowns']));
            if (!in_champselect && _relevantUltCd && key === "R" && ability['cooldowns'].length > 1) {
                cooldowns = participant.getCurrentUltimateCD();
            }
            el +=
                `<tr>
                <th class="p-0">
                    <div class='ability-img-container d-flex'>
                        <img class="ability-icon" src="${ability['icon']}" alt="${ability['name']}" ability="${key}"
            `;
            // add description for abilities that has cooldown reduction effect
            if (ability['cdrType'] != '') {
                el +=
                    ` data-toggle="tooltip-abilities" data-tippy-content= "${ability['description']}"/>`
            } else {
                el += `/>`
            }
            if (key === "R") {
                el += `
                <div class="ultimate-overlay overlay" type="ultimate" name="ultimate"  summonerName="${participant.getChampionName()}"`

                // add description for abilities that has cooldown reduction effect
                if (ability['cdrType'] != '') {
                    el +=
                        ` data-toggle="tooltip-abilities" data-tippy-content= "${ability['description']}">`
                } else {
                    el += `>`
                }
                el += `<p></p>
                    </div>`;
            }

            // aphelios exception
            if (ability.hasOwnProperty('icon1')) {
                el += `<img class="ability-icon" src="${ability['icon1']}" alt="${ability['name1']}" ability="${key}"/> `;
            }

            el += `<div class="indication ${teamColor}"></div>`;
            if (ability['cdrType'] != '') {
                // el += `<img class="info" src="/img/info.svg" data-toggle="tooltip" data-tippy-content="This ability decreases cooldowns" />`
                el += `<img class="info" src="/img/info.png" data-toggle="tooltip-abilities" data-tippy-content="This ability decreases cooldowns" />`
            }

            el +=
                `</div >
            </th >
              <td class="p-0">
                  <div class="cooldowns m-0 d-flex justify-content-center" ability="${key}">`

            for (let cooldown of cooldowns) {
                let cooldownEl = _getNumberElement(_getParsedCooldown(cooldown));
                el += `<p class="m-0 cooldown">
                    ${cooldownEl}
                      </p>
                    `;
                // just state one number if it's repetitive number
                if (cooldowns.length === 1 || cooldowns[0] === cooldowns[1]) {
                    break;
                }
            }
            el += '</div> </td> </tr>';
        }
        el += '</tbody> </table></td></tr>'

        return el;
    }

    function _getSummonerSpellCdRedIcons(participant) {
        let cdRedSpells = participant.getSummonerSpellsCDr();
        let el = '';

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

        return el
    }

    function _getBasicAbilitiesCdRedIcons(participant) {
        let runes = participant.getRunes();
        let items = participant.getCDRedItems();

        let el = '';

        // normal abilities runes
        let index = 0;
        for (let [key, rune] of Object.entries(runes)) {
            if (key === 'UltimateHunter' || key === 'IngeniousHunter'
                || key === 'AttackSpeed' || key === 'LegendAlacrity' ||
                key === 'CosmicInsight') {
                continue;
            }
            el += `<img class="rune-icon ml-1"`;
            el += `src="${rune.image}" alt="${rune.name}">`


            index++;
        }

        // items
        let el_items = "";
        for (let [index, item] of Object.entries(items)) {
            el_items += `<img class="item-icon ml-1"`;
            el_items += `src="${item.icon}" alt="${item.name}">`;
        }

        if (el !== "") {
            if (el_items !== "") {
                el += `<br> ${el_items}`;
            }
        }
        else  {
            if (el_items !== "" ) {
                el += `${el_items}`;
            }
        }



        return el;
    }

    function _getUltCdRedIcons(participant) {
        let runes = participant.getRunes();

        let cloudStacks = participant.getCloudStacks();
        // in clash & aram there's no cloud drake
        let isSpellsCDrMode = participant.isSpellsCDrMode();

        let el = _getBasicAbilitiesCdRedIcons(participant);

        if (el !== "" && (runes.hasOwnProperty('UltimateHunter') || !isSpellsCDrMode && cloudStacks !== 0)) {
            el += "<br>";
        }

        if (runes.hasOwnProperty('UltimateHunter')) {
            let rune = runes.UltimateHunter;
            el += `<div class="d-inline-flex mr-2 mt-1">
                <p class="kill-count-value mr-1"> ${participant.getUniqueKillsCount()}</p>
                <img class="rune-icon" src="${rune.image}" alt="${rune.name}">
                </div>`
        }

        if (!isSpellsCDrMode && cloudStacks !== 0) {
            el += `<div class="d-inline-flex mt-1">
                <p class="cloud-stacks-value mr-1">${cloudStacks}</p><img class="cloud-image buff" src="/img/cloud_buff.png" alt="cloud_buff"></div>`
        }

        return el;
    }

    function _getItemsCdRedIcons(participant) {
        let runes = participant.getRunes();
        let el = "";

        if (runes.hasOwnProperty('CosmicInsight')) {
            let rune = runes.CosmicInsight;
            el += `<img class="rune-icon ml-1"`;
            el += `src="${rune.image}" alt="${rune.name}">`
        }

        if (runes.hasOwnProperty('IngeniousHunter')) {
            if (el !== "") {
                el += "<br>";
            }
            let rune = runes.IngeniousHunter;
            el += `<div class="d-inline-flex mr-2 mt-1">
                <p class="kill-count-value mr-1"> ${participant.getUniqueKillsCount()}</p>
                <img class="rune-icon" src="${rune.image}" alt="${rune.name}">
                </div>`
        }

        return el;
    }

    function _parseCDrIcons(icons) {
        if (icons === "") {
            return "";
        }
        icons = "<br>" + icons;
        return icons.replace(/"/g, '&quot;');
    }

    function _updateActiveItems(participant) {
        let items_el = $(`table[partic-id="${participant.getId()}"] .active-items td`);

        let avaiableItems = items_el.children().toArray().map((child) => {return $(child).attr('name')});

        let items = participant.getItems();
        let itemsWithActiveCD = items.filter(item => item.cooldown > 0);
        let itemsCdRed = participant.getItemsCDr();
        let itemsWithAbilitiesCdRed = participant.getItemsWithAbilitiesCDr();


        // if the item is sold, remove it
        items_el.children().toArray().map((child) => {
            let is_sold = true;
            let name = $(child).attr('name');
            for (let [index, item] of Object.entries(itemsWithActiveCD)) {
                if (item.name === name) {
                    is_sold = false
                    break
                }
            }
            if (is_sold) {
                $(child).remove();
            }
        });


        for (let [index, item] of Object.entries(itemsWithActiveCD)) {
            let name = item.name;

            let cooldown = item.cooldown;

            if ( ["Ironspike Whip", "Goredrinker", "Stridebreaker", "Ceaseless Hunger", "Dreamshatter"].indexOf(name) >= 0) {
                cooldown = cooldown - cooldown * itemsWithAbilitiesCdRed / 100;
            } else {
                cooldown = cooldown - cooldown * itemsCdRed / 100;
            }

            let cooldownEl = _getNumberElement(_getParsedCooldown(cooldown));

            if (avaiableItems.indexOf(name) >= 0) {
                items_el.children(`[name="${name}"]`).children('p').remove();
                // don't display cooldown for items for basic mode
                if (_isBasicuiModeSetting) {
                    items_el.children(`[name="${name}"]`).append(`<p cooldown="${cooldown}" class="d-none ml-1">${cooldownEl}</p></div>`);
                } else {
                    items_el.children(`[name="${name}"]`).append(`<p cooldown="${cooldown}" class="ml-1">${cooldownEl}</p></div>`);
                }
                continue;
            }
            let el = "";
            el += `<div class="ml-2 text-center d-inline-flex" name="${name}">`

            // overlay
            el += `<div class="item-img-container d-flex">`;
            el +=`<img class="active-item-icon  my-auto mr-1" src="${item.icon}" alt="${name}">`;
            el +=`<div class="item-overlay overlay" type="item" cooldown="${cooldown}" name="${name}" summonerName="${participant.getChampionName()}">`;
            el += `<p></p>`;
            el +=`</div>`;
            el +=`</div>`;

            if (_isBasicuiModeSetting) {
            el += `<p cooldown="${cooldown}" class="ml-1 d-none">${cooldownEl}</p></div>`;
            } else {
            el += `<p cooldown="${cooldown}" class="ml-1">${cooldownEl}</p></div>`;
            }
            items_el.append(el);

            $(`table[partic-id="${participant.getId()}"] .item-overlay[name="${name}"]`).click(function() {
                _updateOverlayTimers(this);
            });
        }

    }

    function _createSpellCdRedCell(participant) {
        el = `<div class="pl-3 cdr-numbers mx-auto">`

        let summonerSpellCdRedIcons = _parseCDrIcons(_getSummonerSpellCdRedIcons(participant));
        let summonerSpellCdRed = _getNumberElement(Math.round(participant.getSummonerSpellsCDr() * 2) / 2);

        let basicAbilitiesCdRedIcons = _parseCDrIcons(_getBasicAbilitiesCdRedIcons(participant));
        let basicAbilitiesCdRed = _getNumberElement(Math.round(participant.getAbilitiesCDr() * 2) / 2);

        let ultCdRedIcons = _parseCDrIcons(_getUltCdRedIcons(participant));
        let ultCdRed = _getNumberElement(Math.round(participant.getUltimateCDr() * 2) / 2);

        let itemsCdRedIcons = _parseCDrIcons(_getItemsCdRedIcons(participant));
        let itemsCdRed = _getNumberElement(Math.round(participant.getItemsCDr() * 2) / 2);

        el += `
                <div class="d-flex">
                <p data-toggle="tooltip" data-tippy-content= "Items CDr ${itemsCdRedIcons}"><span class="item-cdr">I </span> ${itemsCdRed}</p>
                <p data-toggle="tooltip" data-tippy-content= "Summoner Spells CDr ${summonerSpellCdRedIcons}"><span class="summoner-spell-cdr">S </span> ${summonerSpellCdRed}</p>
                </div>
                <div class="d-flex">
                <p data-toggle="tooltip" data-tippy-content= "Basic abilities CDr ${basicAbilitiesCdRedIcons}">B ${basicAbilitiesCdRed}</p>
                <p data-toggle="tooltip" data-tippy-content="Ultimate CDr ${ultCdRedIcons}">U ${ultCdRed}</p>
                `
        el += `</div>`
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
        $(element).mousedown(function(e){
            if (e.button !== 2 ) {
                return false;
            }
            duration -= 5;
        });
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
                if (typeof summonerSpellName === 'undefined' || summonerSpellName === false) {
                    let name = element.attr('name');
                    if (typeof name === 'undefined' || name === false) {
                        summonerSpellName = "ultimate";
                    } else {
                        summonerSpellName = name;
                    }
                }

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
