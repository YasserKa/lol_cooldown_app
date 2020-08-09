define([], function () {
    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function makeRequest(url, callback) {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (response.status === 201 || response.status === 200) {
            callback(await response.json());

        }
    }

    return {
        sleep,
        makeRequest,
    }
});
