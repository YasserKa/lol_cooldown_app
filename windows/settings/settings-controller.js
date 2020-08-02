define([
  '../../windows/settings/settings-view.js',
  "../../scripts/services/windows-service.js",
  "../../scripts/constants/window-names.js",
  "../../scripts/services/settings.js",
  "../../scripts/services/htmlHandler.js",
], function (
  SettingsView,
  WindowsService,
  WindowNames,
  Settings,
  HtmlHandler,
  ) {

  class SettingsController {
    constructor() {
      this.settingsView = new SettingsView();
    }

    async run() {
      // minute/second cooldown display
      let cooldownDisplay = Settings.getSetting('cooldownDisplay');
      var cooldownDisplayEl = $('input[value="' + cooldownDisplay + '"]');
      cooldownDisplayEl.prop("checked", true);
      cooldownDisplayEl.parent().addClass('active');
      $('input[name="cooldown-display"]').click(function () {
        let cooldownDisplay = $("input[name='cooldown-display']:checked").val();
        Settings.setSetting('cooldownDisplay', cooldownDisplay)
      });

      // show hide cooldownreduction elements
      let cooldownRedDisplay = Settings.getSetting('cooldownReductionDisplay') ? 'show' : 'hide';
      var cooldownRedDisplayEl = $('input[value="' + cooldownRedDisplay + '"]');
      cooldownRedDisplayEl.prop("checked", true);
      cooldownRedDisplayEl.parent().addClass('active');
      $('input[name="cooldown-reduction-display"]').click(function () {
        let cooldownRedDisplay = $("input[name='cooldown-reduction-display']:checked").val() === 'show' ? true : false;
        Settings.setSetting('cooldownReductionDisplay', cooldownRedDisplay)
      });

      overwolf.utils.getMonitorsList(async function (info) {
        let display = info['displays'][0];
        let height = display['height'];
        let width = display['width'];
        let window = await WindowsService.obtainWindow(WindowNames.SETTINGS);
        let windowHeight = window['window']['height'];
        let windowWidth = window['window']['width'];

        let newTopPosition = (height-100)/2 - windowHeight/2;
        let newLeftPosition = (width-100)/2 - windowWidth/2;

        overwolf.windows.changePosition(WindowNames.SETTINGS, newLeftPosition, newTopPosition);
      });
    }

  }

  return SettingsController;
});
