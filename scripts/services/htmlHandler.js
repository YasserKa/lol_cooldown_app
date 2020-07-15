define([],
    function () {

        function update(game) {
            _updateView(game);
        }

        function initializeView(game) {
            _createGame(game);
        }

        function _updateView(game) {
            _updateTeam(game.getBlueTeam(), 'blue');
            _updateTeam(game.getRedTeam(), 'red');
        }

        function _updateTeam(team, color) {
            for (let participant of team) {
                // Update champion
                $(`table[partic-id="${participant.getId()}"] .champ-icon`)
                    .attr('src', participant.getChampionIcon())
                    .attr('alt', participant.getChampionName());

                // cooldownReduction
                $(`table[partic-id="${participant.getId()}"] .cooldown-reduction`)
                    .text(participant.getAbilitiesCDr());

                // Champ Abilities
                $(`table[partic-id="${participant.getId()}"] .cooldowns-abilities`).remove();
                if (participant.getChampionAbilities().length !== 0 &&
                    $(`table[partic-id="${participant.getId()}"] .cooldowns-abilities`).length === 0) {
                    $(`table[partic-id="${participant.getId()}"]`).append(_createAbilities(participant, color));
                }

                // Update spells
                $(`table[partic-id="${participant.getId()}"] div.spell-1 img`)
                    .attr('src', participant.getSummonerSpellImage(0))
                    .attr('alt', participant.getSummonerSpellName(0));

                $(`table[partic-id="${participant.getId()}"] div.spell-1 p`)
                    .attr('spell-name', participant.getSummonerSpellName(0))
                $(`table[partic-id="${participant.getId()}"] div.spell-1 p span`)
                    .text(participant.getSummonerSpellCooldown(0));

                // Update spells
                $(`table[partic-id="${participant.getId()}"] div.spell-2 img`)
                    .attr('src', participant.getSummonerSpellImage(1))
                    .attr('alt', participant.getSummonerSpellName(1));

                $(`table[partic-id="${participant.getId()}"] div.spell-2 p`)
                    .attr('spell-name', participant.getSummonerSpellName(1))
                $(`table[partic-id="${participant.getId()}"] div.spell-2 p span`)
                    .text(participant.getSummonerSpellCooldown(1));

        }
    }

        function _createGame(game) {
            let el = _createTeam(game.getBlueTeam(), 'blue') + _createTeam(game.getRedTeam(), 'red');

            $(".game-details").append(el);
        }

        function _createTeam(team, color) {
            // Start team element
            let el =
                `<div id="team-${color}" class="team row justify-content-center mx-auto team-${color}">`
            for (let participant of team) {
                el += _createParticipant(participant, color);
            }
            // end team element
            el += `</div>`
            return el;
        }
        // TODO: make exception for aphelios
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
                // Add description for abilities that has cooldown reduction effect
                if (ability['cooldownReduceType'] != '') {
                    el +=
                        ` data-toggle="tooltip" data - html=true title = "${ability['description']}"/>`
                } else {
                    el += `/>`
                }
                // Aphelios exception
                if (ability.hasOwnProperty('icon1')) {
                    el += `<img class="ability-icon" src="${ability['icon1']}" alt="${ability['name1']}" ability="${key}"/> `;
                }

                el += `<div class="indication ${teamColor}"></div>`;
                if (ability['cooldownReduceType'] != '') {
                    el += `<img class="info" src="../../img/info.svg" data-toggle="tooltip" data-html=true title="This ability decreases cooldowns" />`
                }

                el +=
                    `</div >
            </th >
              <td class="p-0">
                  <div class="cooldowns m-0 d-flex justify-content-center" ability="${key}">`

                for (let cooldown of ability['cooldowns']) {
                    el += `<p class="m-0 cooldown">
                          <span>${cooldown}</span><small></small>
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


        function _createParticipant(participant, teamColor) {
            let el =
                `<table class="champ" partic-id="${participant.getId()}">
            <tbody><tr>
                <th class="${teamColor}" colspan=4></th>
            </tr>
              <tr class=" champ-header" >
                <td class="cooldown-reduction">
                0
                </td>
                <td class="cell champ p-0" rowspan=2>
                <td class="cell champ p-0" rowspan=1>
                    <img class="grip" src="../../img/grip-${teamColor}.png" />
                    <img class="champ-icon" src="${participant.getChampionIcon()}" alt="${participant.getChampionName()}">
                </td>`+
                // <td class="cell runes">
                //     <img class="rune-icon ml-1" src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/IngeniousHunter/IngeniousHunter.png" alt="IngeniousHunter" data-toggle="tooltip" data-html="true" title="" data-original-title="<b>Unique</b> <lol-uikit-tooltipped-keyword key='LinkTooltip_Description_Takedown'>takedowns</lol-uikit-tooltipped-keyword> grant permanent Active Item <lol-uikit-tooltipped-keyword key='LinkTooltip_Description_CDR'>CDR</lol-uikit-tooltipped-keyword> (includes Trinkets).">
                // </td>
                `<td class="cell spells p-0">
                    <div class="spell-1">
                        <img class="spell-icon" src="${participant.getSummonerSpellImage(0)}" alt="${participant.getSummonerSpellImage(0)}">
                        <p class="cooldown" spell="0" spell-name="${participant.getSummonerSpellName(0)}"><span>${participant.getSummonerSpellCooldown(0)}</span><small></small></p>
                    </div>
                    <div class="spell-2">
                        <img class="spell-icon" src="${participant.getSummonerSpellImage(1)}" alt="${participant.getSummonerSpellImage(1)}">
                        <p class="cooldown" spell="0" spell-name="${participant.getSummonerSpellName(1)}"><span>${participant.getSummonerSpellCooldown(1)}</span><small></small></p>
                    </div>
                </td>
            </tr> </tbdoy></table>`;
            return el;
        }

        return {
            update,
            initializeView,
        }
    });