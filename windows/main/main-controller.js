define([
  '../../windows/main/main-view.js',
  "../../scripts/services/windows-service.js",
], function (
  MainView,
  WindowsService,
  ) {

  class MainController {
    constructor() {
      this.mainView = new MainView();
    }

    run() {
    //   overwolf.utils.getMonitorsList(async function (info) {
    //     let display = info['displays'][0];
    //     let height = display['height'];
    //     let width = display['width'];
    //     let window = await WindowsService.obtainWindow(WindowNames.MAIN);
    //     let windowHeight = window['window']['height'];
    //     let windowWidth = window['window']['width'];

    //     let newTopPosition = 0;
    //     let newLeftPosition = width / 2 - windowWidth / 2;
    //     console.log(newLeftPosition);

    //     overwolf.windows.changePosition(WindowNames.MAIN, newLeftPosition, newTopPosition);
    //   });
    }

  }

  return MainController;
});
