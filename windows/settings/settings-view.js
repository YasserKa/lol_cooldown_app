define([
  '../base-view.js',
], function (
  BaseView
  ) {

  class SettingsView extends BaseView {
    constructor() {
      super();

      this.updateHotkey = this.updateHotkey.bind(this);
      this.updateVersion = this.updateVersion.bind(this);

      this._hotkey = document.getElementById("hotkey");
      this._version = document.getElementById("version");
    }

    updateHotkey(hotkey) {
      this._hotkey.textContent = hotkey;
    }

    updateVersion(version) {
      this._version.textContent = version;
    }
  }

  return SettingsView;
});
