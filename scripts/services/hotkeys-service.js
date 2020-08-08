define(['../../scripts/constants/hotkeys-ids.js'], function (HOTKEYS) {

  /**
   * get a hotkey combination by hotkey id
   * @param hotkeyId
   * @param callback
   * @private
   */
  function _getHotkey(hotkeyId, callback) {
    overwolf.settings.hotkeys.get(function (result) {
      if (!result || result.success === "error" || !result.games[5426]) {
        setTimeout(function () {
          _getHotkey(hotkeyId, callback);
        }, 2000);
      } else {
        callback(result.games[5426][0].binding);
      }
    });
  }

  /**
   * set custom action for a hotkey id
   * @param hotkeyId
   * @param action
   * @private
   */
  function _setHotkey(hotkeyId, action) {
    overwolf.settings.hotkeys.onPressed.addListener((result)=>{
      if (result.name === HOTKEYS.TOGGLE) {
        action();
      } else {
        console.error(`[HOTKEYS SERVICE] failed to register hotkey ${hotkeyId}`);
      }
    });
  }

  function getToggleHotkey() {
    return new Promise((resolve) => {
      _getHotkey(HOTKEYS.TOGGLE, function (result) {
        resolve(result);
      });
    });
  }

  function setToggleHotkey(action) {
    _setHotkey(HOTKEYS.TOGGLE,action);
  }

  function addHotkeyChangeListener(listener) {
    overwolf.settings.hotkeys.onChanged.addListener(listener);
  }

  return {
    getToggleHotkey,
    setToggleHotkey,
    addHotkeyChangeListener
  };
});
