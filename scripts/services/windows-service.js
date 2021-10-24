define([
    "../../scripts/constants/window-names.js",
], function (
    WindowNames,
) {
    /**
     * obtain a window object by a name as declared in the manifest
     * this is required in order to create the window before calling other APIs
     * on that window
     * @param name
     * @returns {Promise<any>}
     */
    function obtainWindow(name) {
        return new Promise((resolve, reject) => {
            overwolf.windows.obtainDeclaredWindow(name, {useDefaultSizeAndLocation: true}, (response) => {
                if (response.success) {
                    return resolve(response);
                }
                reject(response);
            });
        });
    }

    /**
     * restore a window by name
     * @param name
     * @returns {Promise<any>}
     */
    function restore(name) {
        return new Promise(async (resolve, reject) => {
            try {
                await obtainWindow(name);
                overwolf.windows.restore(name, (result) => {
                    if (result.success) {
                        resolve();
                    } else {
                        reject(result);
                    }
                });
            } catch (e) {
                reject(e)
            }
        });
    }

    /**
     * Returns a map (window name, object) of all open windows.
     * @returns {Promise<any>}
     */
    function getOpenWindows() {
        return new Promise(async (resolve, reject) => {
            try {
                overwolf.windows.getOpenWindows((result) => {
                    resolve(result);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * get state of the window
     * @returns {Promise<*>}
     */
    function getWindowState(name) {
        return new Promise(async (resolve, reject) => {
            try {
                overwolf.windows.getWindowState(name, (state) => {
                    if (state.success) {
                        resolve(state.window_state_ex);
                    } else {
                        reject(state);
                    }
                })
            } catch (e) {
                reject(e);
            }
        });
    }

    // open window if not open & close other windows besides background
    async function restoreWindowOnlyIfNotOpen(windowName) {
        const openWindows = await getOpenWindows();

        // if it doesn't exist open it
        if (!openWindows.hasOwnProperty(windowName)) {
            await restore(windowName)
        }

        // close windows besides background && the one needed (if opened)
        for (let openWindowName of Object.keys(openWindows)) {
            if (openWindowName === WindowNames.BACKGROUND ||
                openWindowName === windowName) {
                continue;
            }

            await close(openWindowName);
        }

    }

    /**
     * minimize current window
     * @returns {Promise<any>}
     */
    async function minimizeCurrentWindow() {
        const currentWindowName = await getCurrentWindowName();
        await minimize(currentWindowName);
    }

    /**
     * close current window
     * @returns {Promise<any>}
     */
    async function closeCurrentWindow() {
        const currentWindowName = await getCurrentWindowName();
        await close(currentWindowName);
    }

    /**
     * minimize a window by name
     * @param name
     * @returns {Promise<any>}
     */
    function minimize(name) {
        return new Promise(async (resolve, reject) => {
            try {
                await obtainWindow(name);
                overwolf.windows.minimize(name, (result) => {
                    if (result.success) {
                        resolve();
                    } else {
                        reject(result);
                    }
                });
            } catch (e) {
                reject(e)
            }
        });
    }

    /**
     * Close a window
     * @param windowName
     * @returns {Promise<any>}
     */
    function close(windowName) {
        return new Promise(async (resolve, reject) => {
            try {
                overwolf.windows.close(windowName, async () => {
                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    function getCurrentWindow() {
        return new Promise(async (resolve, reject) => {
            try {
                overwolf.windows.getCurrentWindow((result) => {
                    if (result.success) {
                        resolve(result['window']);
                    } else {
                        reject(result);
                    }
                });
            } catch (e) {
                reject(e)
            }
        });
    }

    function getMonitorsList() {
        return new Promise(async (resolve, reject) => {
            try {
            overwolf.utils.getMonitorsList(async function (info) {
                resolve(info);
            });

            } catch (e) {
                reject(e);
            }
        });
    }
    /**
     * Returns a map (window name, object) of all open windows.
     * @returns {Promise<any>}
     */
    function centerWindow(windowName, horizonalOnly=true) {
        return new Promise(async (resolve, reject) => {
            try {
            overwolf.utils.getMonitorsList(async function (info) {
                let display = info['displays'][0];
                let height = display['height'];
                let width = display['width'];
                let my_window = await obtainWindow(windowName);
                let windowHeight = my_window['window']['height'];
                let windowWidth = my_window['window']['width'];

                let newTopPosition = 0;
                let newLeftPosition = (width / 2 - (windowWidth / 2));

                if (!horizonalOnly)  {
                    newTopPosition = (height / 2 - (windowHeight / 2));
                }

                overwolf.windows.changePosition(windowName, parseInt(newLeftPosition), parseInt(newTopPosition));
                resolve();
            });

            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * get current window name
     * @returns {Promise<any>}
     */
    function getCurrentWindowName() {
        return new Promise(async (resolve, reject) => {
            try {
                overwolf.windows.getCurrentWindow((result) => {
                    if (result.success) {
                        resolve(result['window']['name']);
                    } else {
                        reject(result);
                    }
                });
            } catch (e) {
                reject(e)
            }
        });
    }

    return {
        restore,
        minimize,
        close,
        minimizeCurrentWindow,
        closeCurrentWindow,
        getCurrentWindow,
        getCurrentWindowName,
        obtainWindow,
        getOpenWindows,
        getWindowState,
        centerWindow,
        getMonitorsList,
        restoreWindowOnlyIfNotOpen,
    }
});
