define([],
    function () {


        function update(game) {
            _updateView(game);
        }

        function initializeView(game) {
            _createGame(game);
        }

        function _updateView(game) {
            _updateTeam(game['blueTeam'], 'blue');
            _updateTeam(game['redTeam'], 'red');
        }

        function _updateTeam(team, color) {
            for (let participant of team) {
                // Update champion
                $(`table[partic-id="${participant['cellId']}"] .champ-icon`)
                    .attr('src', participant['champion']['icon'])
                    .attr('alt', participant['champion']['name']);

                if ($(`table[partic-id="${participant['cellId']}"] .cooldowns-abilities`).length > 0) {
                    $(`table[partic-id="${participant['cellId']}"] .cooldowns-abilities`).remove();
                }

                // Champ Abilities
                if (participant['champion']['abilities'].length !== 0 &&
                    $(`table[partic-id="${participant['cellId']}"] .cooldowns-abilities`).length === 0) {
                    $(`table[partic-id="${participant['cellId']}"]`).append(_createAbilities(participant, color));
                }

                // Update spells
                $(`table[partic-id="${participant['cellId']}"] div.spell-1 img`)
                    .attr('src', participant['spells'][0]['image'])
                    .attr('alt', participant['spells'][0]['name']);

                $(`table[partic-id="${participant['cellId']}"] div.spell-1 p`)
                    .attr('spell-name', participant['spells'][0]['name'])
                $(`table[partic-id="${participant['cellId']}"] div.spell-1 p span`)
                    .text(participant['spells'][0]['cooldown']);

                $(`table[partic-id="${participant['cellId']}"] div.spell-2 img`)
                    .attr('src', participant['spells'][1]['image'])
                    .attr('alt', participant['spells'][1]['name']);

                $(`table[partic-id="${participant['cellId']}"] div.spell-2 p`)
                    .attr('spell-name', participant['spells'][1]['name'])
                $(`table[partic-id="${participant['cellId']}"] div.spell-2 p span`)
                    .text(participant['spells'][1]['cooldown']);
            }
        }

        function _createGame(game) {
            let el = _createTeam(game['blueTeam'], 'blue') + _createTeam(game['redTeam'], 'red');

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
            for (let [key, ability] of Object.entries(participant['champion']['abilities'])) {
                el +=
                    `<tr>
                <th class="p-0">
                    <div class='ability-img-container d-flex'>
                        <img class="ability-icon" src="${ability['icon']}" alt="${ability['name']}" ability="${key}" `;
                // Add description for abilities that has cooldown reduction effect
                if (ability['cooldownReduceType'] != '') {
                    el +=
                        ` data-toggle="tooltip" data - html=true title = "${ability['description']}"/>`
                }
                // Aphelios exception
                if (ability.hasOwnProperty('icon1')) {
                    el += `<img class="ability-icon" src="${$ability['icon1']}" alt="${ability['name1']}" ability="${key}"/> `;
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


        // function createGameEl(game) {
        function _createParticipant(participant, teamColor) {
            let el =
                `<table class="champ" partic-id="${participant['cellId']}">
            <tbody><tr>
                <th class="${teamColor}" colspan=4></th>
            </tr>
              <tr class=" champ-header" >
                <td class="cell champ p-0" rowspan=2>
                    <img class="grip" src="../../img/grip-${teamColor}.png" />
                    <img class="champ-icon" src="" alt="no-champ">
                </td>`+
                // <td class="cell runes">
                //     <img class="rune-icon ml-1" src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/IngeniousHunter/IngeniousHunter.png" alt="IngeniousHunter" data-toggle="tooltip" data-html="true" title="" data-original-title="<b>Unique</b> <lol-uikit-tooltipped-keyword key='LinkTooltip_Description_Takedown'>takedowns</lol-uikit-tooltipped-keyword> grant permanent Active Item <lol-uikit-tooltipped-keyword key='LinkTooltip_Description_CDR'>CDR</lol-uikit-tooltipped-keyword> (includes Trinkets).">
                // </td>
                `<td class="cell spells p-0">
                    <div class="spell-1">
                        <img class="spell-icon" src="${participant['spells'][0]['image']}" alt="${participant['spells'][0]['name']}">
                        <p class="cooldown" spell="0" spell-name="${participant['spells'][0]['name']}"><span>${participant['spells'][0]['cooldown']}</span><small></small></p>
                    </div>
                    <div class="spell-2">
                      <img class="spell-icon spell-2" src="${participant['spells'][1]['image']}" alt="${participant['spells'][1]['name']}">
                        <p class="cooldown" spell="1" spell-name="${participant['spells'][1]['name']}"><span>${participant['spells'][1]['cooldown']}</span><small></small></p>
                    </div>
                </td>
            </tr> </tbdoy></table>`;
            //`+ _createAbilitiesEl(participant, teamColor) + '</tbdoy></table>';
            return el;
        }

        //     let el = _createTeamEl(game['myTeam']) + _createTeamEl(game['theirTeam']);
        //     return el;
        // }
// 

        // function _createTeamEl(team) {
        //     // Start team element
        //     let el =
        //         `<div id="team-${team['color']}" class="team row justify-content-center mx-auto team-${team['color']}">`
        //     for (let participant of team['participants']) {
        //         el += _createParticipantEl(participant, team['color']);
        //     }
        //     // end team element
        //     el += `</div>`
        //     return el;
        // }
// 
        // function _createParticipantEl(participant, teamColor) {
        //     let el =
        //         `<tr><table class="champ" partic-id="${participant['cellId']}">
        //     <tbody><tr>
        //         <th class="${teamColor}" colspan=4></th>
        //     </tr>
        //       <tr class=" champ-header" >
        //         <td class="cell champ p-0" rowspan=2>
        //             <img class="grip" src="../../img/grip-${teamColor}.png" />
        //             <img class="champ-icon" src="${participant['champion']['icon']}" alt="${participant['champion']['name']}">
        //         </td>
        //         <td class="cell runes">
        //             <img class="rune-icon ml-1" src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/IngeniousHunter/IngeniousHunter.png" alt="IngeniousHunter" data-toggle="tooltip" data-html="true" title="" data-original-title="<b>Unique</b> <lol-uikit-tooltipped-keyword key='LinkTooltip_Description_Takedown'>takedowns</lol-uikit-tooltipped-keyword> grant permanent Active Item <lol-uikit-tooltipped-keyword key='LinkTooltip_Description_CDR'>CDR</lol-uikit-tooltipped-keyword> (includes Trinkets).">
        //         </t >
        //         <td class="cell spells p-0">
        //             <div>
        //                 <img class="spell-icon" src="${participant['spells'][0]['image']}" alt="${participant['spells'][0]['name']}">
        //                 <p spell="0" spell-name="${participant['spells'][0]['name']}" class="cooldown"><span>${participant['spells'][0]['cooldown']}</span><small></small></p>
        //             </div>
        //             <div>
        //               <img class="spell-icon" src="${participant['spells'][1]['image']}" alt="${participant['spells'][1]['name']}">
        //                 <p spell="1" spell-name="${participant['spells'][1]['name']}" class="cooldown"><span>${participant['spells'][1]['cooldown']}</span><small></small></p>
        //             </div>
        //         </td>
        //     </tr> 
        //     `+ _createAbilitiesEl(participant, teamColor) + '</tbdoy></table>';
        //     return el;
        // }
// 
        // // TODO: make exception for aphelios
        // // ction _createAbilitiesEl(participant, teamColor) {
        //     let el =
        //         `<tr><td class="row-cooldowns p-0" colspan=4>
        //         <!-- Champ Details -->
        //         <table class="abilities"><tbody>`;
        //     for (let [key, ability] of Object.entries(participant['champion']['abilities'])) {
        //         el +=
        //             `<tr>
        //         <th class="p-0">
        //             <div class='ability-img-container d-flex'>
        //                 <img class="ability-icon" src="${ability['icon']}" alt="${ability['name']}" ability="${key}" `;
        //         // Add  escription for abilities that has cooldown reduction effect
        //         if (ability['cooldownReduceType'] != '') {
        //             el +=
        //                 ` data-toggle="tooltip" data - html=true title = "${ability['description']}"/>`
        //         }
        //         // Aphelios exception
        //         if (ability.hasOwnProperty('icon1')) {
        //             el += `<img class="ability-icon" src="${$ability['icon1']}" alt="${ability['name1']}" ability="${key}"/> `;
        //         } 
// 
        //         el += `<div class="indication ${teamColor}"></div>`;
        //         if (ability['cooldownReduceType'] != '') {
        //             el += `<img class="info" src="../../img/info.svg" data-toggle="tooltip" data-html=true title="This ability decreases cooldowns" />`
        //         }
// 
        //         el +=
        //             `</div >
        //     </th >
        //       <td class="p-0">
        //           <div class="cooldowns m-0 d-flex justify-content-center" ability="${key}">`
 //
        //         for (let cooldown of ability['cooldowns']) {
        //             el += `<p class="m-0 cooldown">
        //                   <span>${cooldown}</span><small></small>
        //               </p>`;
        //             // just state one number if it's repetitive number
        //             if (ability['cooldowns'].length === 1 || ability['cooldowns'][0] === ability['cooldowns'][1]) {
        //                 break;
        //             }
        //         }
        //         el += '</div> </td> </tr>';
        //     }
        //     el += '</tbody> </table></td></tr>'
// 
        //     return el;
        // }
 //
        return {
            update,
            initializeView,
            // createGameEl,
        }// 
    });