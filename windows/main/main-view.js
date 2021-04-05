define([
    '../base-view.js',
    '../../scripts/constants/window-names.js',
    '../../scripts/helpers/utils.js',
    '../../scripts/services/windows-service.js',
], function (
    BaseView,
    WindowNames,
    Utils,
    WindowsService,
) {

    class MainView extends BaseView {
        constructor() {
            super();
        }

        async setWindowPosition() {
            const monitorsList = await Utils.getMonitorsList();
            let display = monitorsList.displays[0];
            let height = display.height;
            let overwolfWindow = await WindowsService.obtainWindow(WindowNames.MAIN);
            let windowHeight = overwolfWindow.window.height;

            let newTopPosition = parseInt(height/2 - (windowHeight / 2));
            let newLeftPosition = 0;

            overwolf.windows.changePosition(WindowNames.MAIN, newLeftPosition, newTopPosition);
        }
    }

    return MainView;
});
