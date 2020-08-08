define([
    '../../windows/main/main-view.js',
    "../../scripts/services/windows-service.js",
    "../../scripts/constants/window-names.js",
], function (
    MainView,
    WindowsService,
    WindowNames,
) {

    class MainController {
        constructor() {
            this.mainView = new MainView();
        }

        run() {
            // disable window flashing in taskbar
            overwolf.windows.flash(WindowNames.MAIN, overwolf.windows.enums.FlashBehavior.off);

            overwolf.utils.getMonitorsList(async function (info) {
                let display = info['displays'][0];
                let height = display['height'];
                let width = display['width'];
                let window = await WindowsService.obtainWindow(WindowNames.MAIN);
                let windowHeight = window['window']['height'];
                let windowWidth = window['window']['width'];

                let newTopPosition = parseInt((height-100)/2 - windowHeight/2);
                let newLeftPosition = 0;

                overwolf.windows.changePosition(WindowNames.MAIN, newLeftPosition, newTopPosition);
            });
        }

    }

    return MainController;
});
