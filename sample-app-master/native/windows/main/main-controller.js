define([
  '../../windows/main/main-view.js'
], function (MainView) {

  class MainController {
    constructor() {
      this.mainView = new MainView();
    }

    run() {
      this._createParticipant();
    }
    _createParticipant() {

          $(`
                          <table class="champ" partic-id="9">
            <tbody><tr>
              <th class="red" colspan="4"></th>
            </tr>
            <tr class=" champ-header">
              <td class="cell champ p-0">

                <img class="grip" src="/img/grip-red.png">
                <img class="champ-icon" src="https://ddragon.leagueoflegends.com/cdn/10.11.1/img/champion/Neeko.png" alt="Neeko">
              </td>
              <td class="cell runes">
                                  <img class="rune-icon ml-1" src="https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/IngeniousHunter/IngeniousHunter.png" alt="IngeniousHunter" data-toggle="tooltip" data-html="true" title="" data-original-title="<b>Unique</b> <lol-uikit-tooltipped-keyword key='LinkTooltip_Description_Takedown'>takedowns</lol-uikit-tooltipped-keyword> grant permanent Active Item <lol-uikit-tooltipped-keyword key='LinkTooltip_Description_CDR'>CDR</lol-uikit-tooltipped-keyword> (includes Trinkets).">
                              </td>
              <td class="cell spells p-0">
                                  <div>
                                                                <img class="spell-icon" src="https://ddragon.leagueoflegends.com/cdn/10.11.1/img/spell/SummonerFlash.png" alt="SummonerFlash">
                                              <div class="spell-overlay" spell="0">
                          <p></p>
                        </div>
                                          <p spell="0" spell-name="SummonerFlash" class="cooldown"><span>5:00</span><small></small>
                  </p></div>
                                  <div>
                                          <img class="spell-icon" src="https://ddragon.leagueoflegends.com/cdn/10.11.1/img/spell/SummonerTeleport.png" alt="SummonerTeleport">
                                          <p spell="1" spell-name="SummonerTeleport" class="cooldown"><span>7:00</span><small></small>
                  </p></div>
                              </td>
            </tr>
            <tr>
              <td class="row-cooldowns p-0" colspan="4">
                <!-- Champ Details -->
                <table class="abilities">
                                      <tbody><tr>
                      <th class="p-0">
                        <div class="ability-img-container d-flex">
                          <img class="ability-icon" src="https://ddragon.leagueoflegends.com/cdn/10.11.1/img/passive/Neeko_P.png" alt="Inherent Glamour" ability="P" data-toggle="tooltip" data-html="true" title="" data-original-title="While disguised, Neeko can use basic attacks while keeping her form. Taking damage from enemy champions, or casting either Blooming Burst or Tangle-Barbs or leaping by Pop Blossom breaks the illusion and puts Inherent Glamour on <b>cooldown</b>.">
                          
                        <div class="indication red"></div>
                                                  <img class="info" src="/img/info.svg" data-toggle="tooltip" data-html="true" title="" data-original-title="This ability decreases cooldowns">
                                                </div>
                      </th>
                      <td class="p-0">
                        <div class="cooldowns m-0 d-flex justify-content-center" ability="P">
                                                      <p class="m-0 cooldown">
                            <span>25</span><small></small>
                            </p>
                                                                                  <p class="m-0 cooldown">
                            <span>10</span><small></small>
                            </p>
                                                                              </div>
                      </td>
                    </tr>
                                      <tr>
                      <th class="p-0">
                        <div class="ability-img-container d-flex">
                          <img class="ability-icon" src="https://ddragon.leagueoflegends.com/cdn/10.11.1/img/spell/NeekoQ.png" alt="Blooming Burst" ability="Q">
                          
                        <div class="indication red"></div>
                                                </div>
                      </th>
                      <td class="p-0">
                        <div class="cooldowns m-0 d-flex justify-content-center" ability="Q">
                                                      <p class="m-0 cooldown">
                            <span>7</span><small></small>
                            </p>
                                                                                  </div>
                      </td>
                    </tr>
                                      <tr>
                      <th class="p-0">
                        <div class="ability-img-container d-flex">
                          <img class="ability-icon" src="https://ddragon.leagueoflegends.com/cdn/10.11.1/img/spell/NeekoW.png" alt="Shapesplitter" ability="W">
                          
                        <div class="indication red"></div>
                                                </div>
                      </th>
                      <td class="p-0">
                        <div class="cooldowns m-0 d-flex justify-content-center" ability="W">
                                                      <p class="m-0 cooldown">
                            <span>20</span><small></small>
                            </p>
                                                                                  <p class="m-0 cooldown">
                            <span>19</span><small></small>
                            </p>
                                                                                  <p class="m-0 cooldown">
                            <span>18</span><small></small>
                            </p>
                                                                                  <p class="m-0 cooldown">
                            <span>17</span><small></small>
                            </p>
                                                                                  <p class="m-0 cooldown">
                            <span>16</span><small></small>
                            </p>
                                                                              </div>
                      </td>
                    </tr>
                                      <tr>
                      <th class="p-0">
                        <div class="ability-img-container d-flex">
                          <img class="ability-icon" src="https://ddragon.leagueoflegends.com/cdn/10.11.1/img/spell/NeekoE.png" alt="Tangle-Barbs" ability="E">
                          
                        <div class="indication red"></div>
                                                </div>
                      </th>
                      <td class="p-0">
                        <div class="cooldowns m-0 d-flex justify-content-center" ability="E">
                                                      <p class="m-0 cooldown">
                            <span>12</span><small></small>
                            </p>
                                                                                  <p class="m-0 cooldown">
                            <span>11</span><small>.5</small>
                            </p>
                                                                                  <p class="m-0 cooldown">
                            <span>11</span><small></small>
                            </p>
                                                                                  <p class="m-0 cooldown">
                            <span>10</span><small>.5</small>
                            </p>
                                                                                  <p class="m-0 cooldown">
                            <span>10</span><small></small>
                            </p>
                                                                              </div>
                      </td>
                    </tr>
                                      <tr>
                      <th class="p-0">
                        <div class="ability-img-container d-flex">
                          <img class="ability-icon" src="https://ddragon.leagueoflegends.com/cdn/10.11.1/img/spell/NeekoR.png" alt="Pop Blossom" ability="R">
                          
                        <div class="indication red" style="display: block;"></div>
                                                </div>
                      </th>
                      <td class="p-0">
                        <div class="cooldowns m-0 d-flex justify-content-center" ability="R">
                                                      <p class="m-0 cooldown">
                            <span>1:30</span><small></small>
                            </p>
                                                                                  </div>
                      </td>
                    </tr>
                                  </tbody></table>
              </td>
            </tr>
          </tbody></table>
          `).appendTo('#team-red');
          }

  }

  return MainController;
});
