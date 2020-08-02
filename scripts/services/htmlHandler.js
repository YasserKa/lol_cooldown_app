define([],
    function () {

        function initializeView(game) {
            $(".game-details .team").remove();
            _createGame(game);
            _updateView(game);
        }

        function update(game) {
            _updateView(game);
        }

        function _updateView(game) {
            _updateTeam(game.getBlueTeam(), 'blue');
            _updateTeam(game.getRedTeam(), 'red');
            if (game.isInGame()) {
                $('.cdr').css('display', 'table-row');
            }
        }

        function _updateTeam(team, color) {
            for (let participant of team) {
                let firstSpellCooldownEl = _getNumberElement(participant.getSummonerSpellCooldown(0));
                let secondSpellCooldownEl = _getNumberElement(participant.getSummonerSpellCooldown(1));
                // update champion
                $(`table[partic-id="${participant.getId()}"] .champ-icon`)
                    .attr('src', participant.getChampionIcon())
                    .attr('alt', participant.getChampionName());
                
                // cooldownReduction
                _updateCooldownReduction(participant);

                // champ Abilities
                $(`table[partic-id="${participant.getId()}"] .cooldowns-abilities`).remove();
                if (participant.getChampionAbilities().length !== 0 &&
                    $(`table[partic-id="${participant.getId()}"] .cooldowns-abilities`).length === 0) {
                    $(`table[partic-id="${participant.getId()}"]`).append(_createAbilities(participant, color));
                }

                // update spells
                $(`table[partic-id="${participant.getId()}"] div.spell-1 img`)
                    .attr('src', participant.getSummonerSpellImage(0))
                    .attr('alt', participant.getSummonerSpellName(0));

                $(`table[partic-id="${participant.getId()}"] div.spell-1 p`)
                    .attr('spell-name', participant.getSummonerSpellName(0))
                $(`table[partic-id="${participant.getId()}"] div.spell-1 p`)
                    .html(firstSpellCooldownEl);

                $(`table[partic-id="${participant.getId()}"] div.spell-2 img`)
                    .attr('src', participant.getSummonerSpellImage(1))
                    .attr('alt', participant.getSummonerSpellName(1));

                $(`table[partic-id="${participant.getId()}"] div.spell-2 p`)
                    .attr('spell-name', participant.getSummonerSpellName(1))
                $(`table[partic-id="${participant.getId()}"] div.spell-2 p`)
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
            let firstSpellCooldownEl = _getNumberElement(participant.getSummonerSpellCooldown(0));
            let secondSpellCooldownEl = _getNumberElement(participant.getSummonerSpellCooldown(1));
            let el =
                `
        <table class="champ" partic-id="${participant.getId()}">
            <tbody>
                <tr>
                    <th class="${teamColor}" colspan=4></th>
                </tr>
                <tr class="champ-header">
                    <td class="cell champ p-0" colspan=4>
                        <img class="champ-icon" src="${participant.getChampionIcon()}" alt="${participant.getChampionName()}">
                        <div class="spells-cdr-holder d-inline">
                        </div>
                        <div class="cell spells p-0">
                            <div class="spell-1">
                                <img class="spell-icon" src="${participant.getSummonerSpellImage(0)}" alt="${participant.getSummonerSpellImage(0)}">
                                <p class="cooldown" spell="0" spell-name="${participant.getSummonerSpellName(0)}">${firstSpellCooldownEl}</p>
                            </div>
                            <div class="spell-2">
                                    <img class="spell-icon" src="${participant.getSummonerSpellImage(1)}" alt="${participant.getSummonerSpellImage(1)}">
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
                        ` data-toggle="tooltip" data - html=true title = "${ability['description']}"/>`
                } else {
                    el += `/>`
                }
                // aphelios exception
                if (ability.hasOwnProperty('icon1')) {
                    el += `<img class="ability-icon" src="${ability['icon1']}" alt="${ability['name1']}" ability="${key}"/> `;
                }

                el += `<div class="indication ${teamColor}"></div>`;
                if (ability['cdrType'] != '') {
                    el += `<img class="info" src="../../img/info.svg" data-toggle="tooltip" data-html=true title="This ability decreases cooldowns" />`
                }

                el +=
                    `</div >
            </th >
              <td class="p-0">
                  <div class="cooldowns m-0 d-flex justify-content-center" ability="${key}">`

                for (let cooldown of ability['cooldowns']) {
                    let cooldownEl = _getNumberElement(cooldown);
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
            $(`table[partic-id="${participant.getId()}"]`).append(_createCdRedCell(participant));
            $(`table[partic-id="${participant.getId()}"] .spells-cdr-holder`)
                .html(_createSpellCdRedCell(participant));
        }

        function _createSpellCdRedCell(participant) {
            let el = '<div class="cdr spells-cdr-cell">';
            let cdRedSpells = participant.getSummonerSpellsCDr();
            if (cdRedSpells == 0) {
                return el;
            }
            let items = participant.getItems();
            let runes = participant.getRunes();
            let neededItems = items.filter(item => item.name === 'Ionian Boots of Lucidity');
            let neededRune = runes.hasOwnProperty('CosmicInsight') ?  runes.CosmicInsight : false;

            if (neededRune) {
                el += `<img class="item-icon ml-1" src="${neededRune.image}" alt="${neededRune.name}">`;
            }

            if (neededItems.length > 0) {
                el += `<img class="item-icon ml-1" src="${neededItems[0].icon}" alt="${neededItems[0].name}">`;
            }
            el += `<p class="spells-cdr-value d-inline">${_getNumberElement(participant.getSummonerSpellsCDr())}</p>`;
            el += '</div>';

            return el;
        }

        function _createCdRedCell(participant) {
            let el = `<tr class="cdr abilities-cdr-cell">`;
            let runes = participant.getRunes();
            let cloudStacks = participant.getCloudStacks();

            let items = participant.getItems();

            el += '<td class="items">'
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
            el += '<td class="runes">'
            let index = 0;
            for (let [key, rune] of Object.entries(runes)) {
                if (key === 'UltimateHunter' || key === 'IngeniousHunter') {
                    continue;
                }
                el += `<img class="rune-icon ml-1"`;
                if (index != 0)  {
                    el += `style=" position: absolute;left:${index * 15}px"`;
                }
                el += `src="${rune.image}" alt="${rune.name}" data-toggle="tooltip" data-html="true" title="" data-original-title="${rune.description}">`


                index++;
            }
            el += '</td>';
            el += '<td>';
            let abilitiesCdrEl = _getNumberElement(participant.getAbilitiesCDr());
            el += `<p class="ability-cdr-value text-center">${abilitiesCdrEl}</p>`
            el += '</td></tr>'

            // ultimate
            el += '<tr class="cdr ultimate-cdr-cell">'

            el += '<td class="text-center"><div class="d-inline-flex">'
            if (runes.hasOwnProperty('UltimateHunter')) {
                let rune = runes.UltimateHunter;
                el += `<p class="kill-count-value"> ${participant.getUniqueKillsCount()}</p>
                   <img class="rune-icon ml-1" src="${rune.image}" alt="${rune.name}" data-toggle="tooltip" data-html="true" title="" data-original-title="${rune.description}">`
            }
            el += '</div></td>'

            el += '<td class="text-center"><div class="d-inline-flex">'
            el += `<p class="cloud-stacks-value">${cloudStacks}</p><img class="buff ml-1" src="../../img/cloud_buff.png" alt="cloud_buff">`
            el += '</div></td>'

            el += '<td>'
            let ultCdrEl = _getNumberElement(participant.getUltimateCDr());
            el += `<p class="ultimate-cdr-value">${ultCdrEl}</p></td>`
            el += '</td>'

            el += `</tr>`;

            return el;
        }


        function _getNumberElement(number) {

            number = (number).toString();
            if (number == '-') {
                return `<span>-</span>`;
            }

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