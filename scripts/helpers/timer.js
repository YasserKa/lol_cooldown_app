define([], function () {
    async function wait(timeInMS) {
        return new Promise(resolve => {
            setTimeout(resolve, timeInMS);
        });
    }

    return {
        wait,
    }
});