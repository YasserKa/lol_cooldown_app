define([], function () {
    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function makeXMLHttpRequest(url, callback) {
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 201 ||
                    xhr.status === 200
                ) {
                    callback(xhr.response);
                }
            }
        };
        xhr.open("GET", url);
        xhr.send();
    }

    return {
        sleep,
        makeXMLHttpRequest,
    }
});
