define([
    "../../scripts/services/windows-service.js",
], function (
    WindowsService,
) {
    class BaseWindowController {

        constructor(view) {
            this._view = new view();
            this._mainWindow = overwolf.windows.getMainWindow();
            this._settings = this._mainWindow.settings;

            this._windowName = null;
        }

        async run() {
            this._windowName = await WindowsService.getCurrentWindowName();
            this._settings.addListener(`${this._windowName}_view_scale`, (settings) => {
                this._view.updateScale(settings[this._settings.SETTINGS.WINDOW_SCALE]);
            });

            await this.doBeforeWindowRestore();
            this.windowRestore();
            this.doPostWindowRestore();
        }

        async doBeforeWindowRestore() {
            console.info('Before Window Restore');
            await this._view.init();
            await this._view.updateHtmlContentScale(this._settings.getSetting(this._settings.SETTINGS.WINDOW_SCALE));
        }

        doPostWindowRestore() {
            console.info('Post Window Restore');

        }

        async windowRestore() {
            // await WindowsService.restore(this._windowName);
        }



    }


    return BaseWindowController;
});
