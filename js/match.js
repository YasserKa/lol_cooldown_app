class Chart {

    constructor() {

        this.svg = d3.select("#chart");
        let margin = {top: 35, left: 35, bottom: 20, right: 10},
            width = +this.svg.attr("width") - margin.left - margin.right,
            height = +this.svg.attr("height") - margin.top - margin.bottom;

        this.x = d3.scaleBand()
            .range([margin.left, width - margin.right])
            .padding(0.2)

        this.y = d3.scaleLinear()
            .rangeRound([height - margin.bottom, margin.top])

        this.xAxis = this.svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .attr("class", "x-axis")

        this.yAxis = this.svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .attr("class", "y-axis")

    };

    update () {
        let data = [];

        let transitionSpeed = 750;
        let keys = ["rank1", "rank2", "rank3"];
        let particEls = [...document.querySelectorAll("table[partic-id]")];


        for (let key of Object.keys(participants)) {
            let partic = participants[key];

            let particPosInTable = particEls.findIndex(particEl => {
                return particEl.getAttribute('partic-id') == partic.id;
            });
            if (!partic.onGraph) {
                continue;
            }
            let icon = partic.getChampionIcon();
            let ultCD = partic.getUltimateCds();
            let partId = partic.getId();
            let index = particPosInTable;
            let teamColor = partic.getTeamColor();

            let champ = {
                'index': index,
                'color': teamColor,
                'partId': partId,
                'rank1': ultCD[2],
                'rank2':ultCD[1] - ultCD[2],
                'rank3':ultCD[0] - ultCD[1],
                'icon': icon,
            };
            data.push(champ);
        }


        data.forEach(d => d.total = d3.sum(keys, k => +d[k]));

        this.y.domain([0, d3.max(data, d => d3.sum(keys, k => +d[k]))]).nice();
        this.yAxis.transition().duration(transitionSpeed).call(d3.axisLeft(this.y).ticks(null, "s"))

        // Sort by index(roles)
        data.sort((a, b) => a.index - b.index)

        // X-axis
        this.x.domain(data.map(d => d.partId));
        this.xAxis.call(d3.axisBottom(this.x).tickSizeOuter(0))
        this.xAxis.selectAll("text,line").attr("display", "none");

        // Adding images to ticks that don't contain images
        let image = this.svg.selectAll('.x-axis').selectAll(function() {
            let children = [...this.getElementsByTagName('g')];
            let result = children.filter(a => [...a.getElementsByTagName('image')].length === 0)
            return result;
        })

        image.append('image')
            .merge(image)
            .transition().duration(transitionSpeed)
            .attr("x", -24)
            .attr('height', 48)
            .attr('width', 48)
            .attr("xlink:href", d => {
                let partic = data.find(partic => partic.partId === d);
                return partic['icon'];
            });
        let group = this.svg.selectAll("g.layer")
            .data(d3.stack().keys(keys)(data), d => d.key)

        // Groups
        group.exit().remove()

        group.enter().append("g")
            .classed("layer", true)
            .attr("fill-opacity", 0.5);

        // Bars
        let bars = this.svg.selectAll("g.layer").selectAll("rect").data(d => d);

        bars.exit().remove();

        let redColors = ['lightsalmon', 'salmon', 'indianred'],
            blueColors = ['powderblue', 'lightskyblue', 'cornflowerblue'];

        bars.enter().append("rect")
            .merge(bars)
            .attr("width", this.x.bandwidth())
            .attr("x", d => this.x(d.data.partId))
            .attr("y", d => this.y(d[1]))
            .attr("height", d => this.y(d[0]) - this.y(d[1]))
            .attr("fill", d => {
                let colors = d.data.color === 'red' ? redColors : blueColors;
                if (d[0] === 0) {
                    return colors[0];
                } else if (d[0] === d.data.rank1) {
                    return colors[1];
                } else {
                    return colors[2]; }
            })

        // Text
        let text = this.svg.selectAll("g.layer").selectAll(".text")
            .data(d => d);

        text.exit().remove()

        text.enter().append("text")
            .merge(text)
            .attr("class", "text")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("font-size", d => {
                let rectHeight = this.y(d[0]) - this.y(d[1]);
                // 10 is least
                // 50 is most
                // return rectHeight > 20 ? '100%' : (rectHeight*4)+'%';
                if (rectHeight > 45)  {
                    return '100%';
                } else if (rectHeight > 28)  {
                    return '80%';
                } else if (rectHeight > 5)  {
                    return '70%';
                } else {
                    return '0%';
                }

            })
            .attr("x", d => this.x(d.data.partId) + this.x.bandwidth() / 2)
            .attr("y", d => this.y(d[1]) - (this.y(d[1]) - this.y(d[0])) / 2 + 5)
            .text(d => getParsedCooldown(d[1]))

    }
}

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
let chartInstance = null;
let redCloudStacks = 0;
let blueCloudStacks = 0;

$(document).ready(function() {
    let redTeamParticipants = {};
    let blueTeamParticipants = {};

    chartInstance = new Chart();
    Object.freeze(chartInstance);

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
    chartInstance.update();
    for (let key of Object.keys(participants)) {
        updateParticipantTable(key);
    };
}

function updateParticipantUI(particId) {
    chartInstance.update();
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
