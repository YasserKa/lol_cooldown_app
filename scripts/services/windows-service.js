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
      overwolf.windows.obtainDeclaredWindow(name, (response) => {
        if (response.status !== 'success') {
          return reject(response);
        }
        resolve(response);
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
          if (result.status === 'success') {
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
          if (state.status === 'success') {
            resolve(state.window_state_ex);
          } else {
            reject(result);
          }
        })
      } catch (e) {
        reject(e);
      }
    });
  }

  // open window if not open & close other windows besides background
  async function openWindowOnlyIfNotOpen(windowName) {
    const openWindows = await getOpenWindows();

    // close windows besides background && the one needed (if opened)
    for (let openWindowName of Object.keys(openWindows)) {
      if (openWindowName === WindowNames.BACKGROUND ||
        openWindowName === windowName) {
        continue;
      }

      await _close(openWindowName);
    }

    // if it doesn't exist open it
    if (!openWindows.hasOwnProperty(windowName)) {
      await restore(windowName);
    }
  }

  /**
   * minimize current window
   * @returns {Promise<any>}
   */
  async function minimizeCurrentWindow() {
    const currentWindowName = await _getCurrentWindowName();
    await _minimize(currentWindowName);
  }

  /**
   * close current window
   * @returns {Promise<any>}
   */
  async function closeCurrentWindow() {
    const currentWindowName = await _getCurrentWindowName();
    await _close(currentWindowName);
  }

  /**
   * minimize a window by name
   * @param name
   * @returns {Promise<any>}
   */
  function _minimize(name) {
    return new Promise(async (resolve, reject) => {
      try {
        await obtainWindow(name);
        overwolf.windows.minimize(name, (result) => {
          if (result.status === 'success') {
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
  function _close(windowName) {
    return new Promise(async (resolve, reject) => {
      try {
        overwolf.windows.close(windowName, () => {
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
  function _getCurrentWindowName() {
    return new Promise(async (resolve, reject) => {
      try {
        overwolf.windows.getCurrentWindow((result) => {
          if (result.status === 'success') {
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
    minimizeCurrentWindow,
    closeCurrentWindow,
    obtainWindow,
    getOpenWindows,
    getWindowState,
    openWindowOnlyIfNotOpen,
  }
});