define([], function () {
    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function makeBellSound() {
        let audio = new Audio('/lib/ding_sound.mp3');
        audio.play();
    }

    function makeSoundAfterSummonerSpellIsUp(championName, summonerSpellName) {
            const httpreq = new XMLHttpRequest();
            const championTwoSummonerOneTimer = `msg=${championName}'s ${summonerSpellName} is up&lang=Justin&source=ttsmp3`;
            httpreq.open("POST", "https://ttsmp3.com/makemp3_new.php", true);
            httpreq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            httpreq.overrideMimeType("application/json");
            httpreq.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    // bellTimer.play();
                    let soundarray = JSON.parse(this.responseText);
                    let summonerAudio = new Audio(soundarray["URL"]);
                    summonerAudio.volume = 0.5;
                    summonerAudio.play();
                }
            };
            httpreq.send(championTwoSummonerOneTimer);
    }


    async function makeRequest(url) {
        // user disconnected
        if (!window.navigator.onLine) {
            throw('No Internet Connection!')
        }

        const response = await fetch(url, {
            method: 'GET',
        });

        if (response.status === 201 || response.status === 200) {
            let json = await response.json();
            return json;
        } else {
            throw("Couldn't retrieve data from server!");
        }
    }

    function getMonitorsList() {
        return new Promise(resolve => {
            overwolf.utils.getMonitorsList((result)=>{
                return resolve(result);
            });
        });
    }

    function getAppVersion() {
        return new Promise(resolve => {
            overwolf.extensions.current.getManifest((manifest) => {
                return resolve(manifest.meta.version);
            });
        });
    }

    return {
        sleep,
        makeRequest,
        getMonitorsList,
        getAppVersion,
        makeBellSound,
        makeSoundAfterSummonerSpellIsUp,
    }
});
