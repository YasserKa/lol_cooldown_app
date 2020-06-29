class Participant {
    constructor(participantInfo, teamColor) {
        this.teamColor = teamColor;
        this.champion = participantInfo['champion'];
        this.id = participantInfo['id'];
        this.cdRed = participantInfo['fiveCdr'] ? 5 : 0;
        this.hasFiveCdrRune = participantInfo['fiveCdr'];
        // Keeps track of abilities CD changes
        this.originalAbilities = this.champion['abilities']
        this.currentAbilities = JSON.parse(JSON.stringify(this.originalAbilities));
        this.originalSpells = participantInfo['spells'];
        this.currentSpells = JSON.parse(JSON.stringify(this.originalSpells));

        this.onGraph = false;
        this.hasCdrBoots = false;
    }
    updateSpellsCd () {
        for (let key of Object.keys(this.originalSpells)) {
            let cooldown = this.originalSpells[key]['cooldown'];
            let cdRed = 0;

            if (map == 'Howling Abyss')
                cdRed += 40;
            if (this.hasCdrBoots)
                cdRed += 10;
            if (this.hasFiveCdrRune) {
                if (map == 'Howling Abyss')
                    cdRed += ((100 - cdRed) * 0.05);
                else
                    cdRed += 5
            }

            // Exception: Teleport has 2 numbers 420-240
            if (this.originalSpells[key]['name'] == 'SummonerTeleport') {
                let teleFirst = 420;
                let teleSecond = 240;
                let teleFirstNewCd = teleFirst - (teleFirst * (cdRed) / 100)
                let teleSecondNewCd = teleSecond - (teleSecond * (cdRed) / 100)
                let teleFirstRounded = Math.round(teleFirstNewCd*2)/2;
                let teleSecondRounded = Math.round(teleSecondNewCd*2)/2;
                this.currentSpells[key]['cooldown'] = [teleFirstRounded, teleSecondRounded];
            } else {
                let newCd = cooldown - (cooldown * (cdRed) / 100)
                let roundedCd = Math.round(newCd*2)/2;
                this.currentSpells[key]['cooldown'] = roundedCd;
            }

        }
    }

    updateAbilitiesCd () {
        for (let key of Object.keys(this.originalAbilities)) {
            if (key === "I") {
                continue;
            }
            let cooldowns = this.originalAbilities[key]['cooldowns'];
            let newCds = [];

            // Some abilities don't have cooldown, so *-* is used
            if (cooldowns[0] === null) {
                continue;
            }
            cooldowns.forEach(cooldown => {
                let newCd = 0;
                if (key === "R") {
                    let stacks = this.teamColor === 'red' ? redCloudStacks:blueCloudStacks;
                    let ultcdRed = stacks * ((100 - this.cdRed) * 0.1);

                    newCd = cooldown - (cooldown * (this.cdRed+ultcdRed) / 100)
                } else {
                    newCd = cooldown - (cooldown * (this.cdRed) / 100)
                }
                let roundedCd = Math.round(newCd*2)/2;
                newCds.push(roundedCd);
            })
            this.currentAbilities[key]['cooldowns'] = newCds;
        }
    }

    getCurrentAbilities() {
        return this.currentAbilities;
    }

    getUltimateCds() {
        return this.getCurrentAbilities()['R']['cooldowns'];
    }

    getChampionIcon() {
        return this.champion['icon'];
    }

    getTeamColor () {
        return this.teamColor;
    }

    getId () {
        return this.id;
    }

    setCooldownRed(cdRed) {
        this.cdRed = cdRed;
    }

    setOnGraph (onGraph) {
        this.onGraph = onGraph;
    }
}

let participants = {};
let redCloudStacks = 0;
let blueCloudStacks = 0;

$(document).ready(function() {
    let redTeamParticipants = {};
    let blueTeamParticipants = {};

    // Initialize the teams
    const blueTeam = teams.find(team => team.color === 'blue');
    const redTeam = teams.find(team => team.color === 'red');

    blueTeam['participants'].forEach((partic) => {
        blueTeamParticipants[partic['id']] = new Participant(partic, 'blue');
    })
    redTeam['participants'].forEach((partic) => {
        redTeamParticipants[partic['id']] = new Participant(partic, 'red');
    })

    participants = {...redTeamParticipants, ...blueTeamParticipants};

    // Update the UI
    for (let key of Object.keys(participants)) {
        participants[key].updateAbilitiesCd();
        participants[key].updateSpellsCd();
    };
    updateAllParticipantsUI();

    // Append events to elements

    // CDr buttons
    $('.cooldown-reduction input[type="radio"]').click(function() {
        let particId = $(this).parents('table[partic-id]').attr('partic-id');
        let cdRed = $(this).val();
        let partic = participants[particId];
        partic.setCooldownRed(+cdRed)
        partic.updateAbilitiesCd();
        updateParticipantUI(particId);
    });
    // Boot CDr button
    $('.cdr-boot').click(function() {
        $(this).toggleClass('active');
        let particId = $(this).parents('table[partic-id]').attr('partic-id');
        let partic = participants[particId];
        partic.hasCdrBoots = $(this).hasClass('active');
        partic.updateSpellsCd();
        updateParticipantUI(particId);
    });
    // Cloud buff
    $('.buff').hover(function() {
        $(this).css('opacity', 1);
        $(this).prevAll().css('opacity', 1);
    },function() {
        if ($(this).nextAll().hasClass('active') || $(this).hasClass('active'))
            return;
        $(this).css('opacity', 0.5);
        $(this).prevUntil('.active').css('opacity', 0.5);
    });

    $('.buff').click(function() {
        $(this).siblings().css('opacity', 0.5);
        $(this).css('opacity', 0.5);
        $(this).siblings().removeClass('active');
        $(this).toggleClass('active');

        let team = $(this).attr('team');
        if ($(this).hasClass('active')) {
            $(this).css('opacity', 1);
            $(this).prevAll().css('opacity', 1);
            let team = $(this).attr('team');

            if (team === 'red') {
                redCloudStacks = $(this).attr('buff-stack');
            } else if (team === 'blue') {
                blueCloudStacks = $(this).attr('buff-stack');
            }
        } else {
            if (team === 'red') {
                redCloudStacks = 0;
            } else if (team === 'blue') {
                blueCloudStacks = 0;
            }
        }

        for (let key of Object.keys(participants)) {
            participants[key].updateAbilitiesCd();
        }

        updateAllParticipantsUI();
    });

    // Ultitmates button
    $(`img[ability="R"]`).click(function() {
        let particId = $(this).parents('table[partic-id]').attr('partic-id');
        let partic = participants[particId];

        let onGraph = partic.onGraph;
        $(this).siblings('.indication').css('display', () => {return onGraph? 'none' : 'block'});
        partic.setOnGraph(!onGraph);


        updateParticipantUI(particId);
    });
    // Trigger all ultimates
    $(`img[ability="R"]`).trigger("click");


    // Sortable package
    let teamRed = document.getElementById('team-red');
    let teamBlue = document.getElementById('team-blue');
    // Sortable.create(teamRed, {
    //     swap: true,
    //     draggable: 'table.champ',
    //     handle: '.grip',
    //     onUpdate: function() {
    //         updateAllParticipantsUI();
    //     }
    // });
    // Sortable.create(teamBlue, {
    //     swap: true,
    //     draggable: 'table.champ',
    //     handle: '.grip',
    //     onUpdate: function() {
    //         updateAllParticipantsUI();
    //     }
    // });

    // Boostramp tooltip
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    // Timers
    $(`.spell-overlay`).click(function() {
        let particId = $(this).parents('table[partic-id]').attr('partic-id');
        let partic = participants[particId];
        let spells = partic.currentSpells;

        let spellId = $(this).attr('spell');
        let cooldown = spells[spellId]['cooldown'];
        let timerId = (particId).toString() + (spellId).toString()

        // If it's already working
        if (timerId in timers) {
            stopTimer($(this), timerId)
        } else {
           startTimer(cooldown, $(this), timerId);
        }
    });
});

function updateAllParticipantsUI() {
    for (let key of Object.keys(participants)) {
        updateParticipantTable(key);
    };
}

function updateParticipantUI(particId) {
    updateParticipantTable(particId);
}

function getParsedCooldown(cooldown) {
    // Passives with no CD uses dash (-)

    if (cooldown == null)
        return null;

    if (settings.cooldownDisplay == 'minutes' && cooldown > 60) {
        var minutes = Math.floor(cooldown / 60);
        var seconds = cooldown - minutes * 60;

        cooldown = (minutes).toString()+':';
        // Make it 00 or 00.5 instead of 0 0.5
        if (Math.floor(seconds) < 10) {
            cooldown += '0'
        }
        cooldown += (seconds).toString();
    }

    return cooldown.toString();
}

function updateParticipantTable(particId) {

    // Update the table
    let partic = participants[particId];

    // Update abilities
    let abilities = partic.getCurrentAbilities();
    for (let key of Object.keys(abilities)) {
        let cooldowns = abilities[key]['cooldowns'];

        $(`table[partic-id="${partic.id}"] .cooldowns[ability="${key}"] p`).each(function(i, el) {
            let cooldown = getParsedCooldown(cooldowns[i]);

            // Reseting the values
            el.children[0].textContent = '';
            el.children[1].textContent = '';

            // Passives with no CD uses dash (-)
            if (cooldown === null)  {
                el.children[0].textContent = '-';
            } else {
                if (cooldown.indexOf('.') === -1) {
                    el.children[0].textContent = cooldown;
                } else {
                    indexOfDot = cooldown.indexOf('.');
                    el.children[0].textContent += cooldown.substring(0, indexOfDot);
                    el.children[1].textContent = '.'
                    el.children[1].textContent += cooldown.substring(indexOfDot+1);
                }
            }
        });
    }

    // Update spells
    let spells = partic.currentSpells;
    for (let key of Object.keys(spells)) {
        let cooldown = spells[key]['cooldown'];
        $(`table[partic-id="${partic.id}"] .cooldown[spell="${key}"]`).each(function(i, el) {

            // Exception: Teleport has 2 numbers
            if ($(this).attr('spell-name') == 'SummonerTeleport') {
                el.children[0].textContent =
                    getParsedCooldown(cooldown[0]) + '-' + getParsedCooldown(cooldown[1]);
            } else {
                cooldown = getParsedCooldown(cooldown);

                el.children[0].textContent = '';
                el.children[1].textContent = '';

                if (cooldown.indexOf('.') === -1) {
                    el.children[0].textContent = cooldown;
                } else {
                    indexOfDot = cooldown.indexOf('.');
                    el.children[0].textContent += cooldown.substring(0, indexOfDot);
                    el.children[1].textContent = '.'
                    el.children[1].textContent += cooldown.substring(indexOfDot+1);
                }
            }
        });
    }
}

let timers = {}

function startTimer(duration, element, id) {
    element.children()[0].textContent = getParsedCooldown(Math.floor(duration));
    duration--;
    element.css("opacity", "1");

    let intervalId = setInterval(function () {
        element.children()[0].textContent = getParsedCooldown(Math.floor(duration));

        if (--duration < 0) {
            stopTimer(element, id);
        }
    }, 1000);

    timers[id] = intervalId;
}

function stopTimer(element, id) {
    clearInterval(timers[id]);
    delete timers[id];
    element.css("opacity", "0");
}
