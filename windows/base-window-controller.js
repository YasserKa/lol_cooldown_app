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
            // clear header message
            this._view.updateHeaderMessage('');
            // update scale
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
            let scale = this._settings.getSetting(this._settings.SETTINGS.WINDOW_SCALE)
            this._view.updateScale(scale);
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
