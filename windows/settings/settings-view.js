define([
  '../SampleAppView.js',
], function (
  SampleAppView
  ) {

  class SettingsView extends SampleAppView {
    constructor() {
      super();
      
      this.updateHotkey = this.updateHotkey.bind(this);
      this._hotkey = document.getElementById("hotkey");
    }

    updateHotkey(hotkey) {
      this._hotkey.textContent = hotkey;
    }
  }

  return SettingsView;
});