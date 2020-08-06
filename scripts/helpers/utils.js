define([], function () {
    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    return {
        sleep,
    }
});