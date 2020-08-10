define([], function () {
    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function makeRequest(url) {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (response.status === 201 || response.status === 200) {
            let json = await response.json();
            return json;
        }
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
        getAppVersion,
    }
});
