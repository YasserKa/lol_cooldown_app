define([
    "../scripts/services/drag-service.js",
    "../../scripts/services/windows-service.js",
    "../../scripts/constants/window-names.js",
], function(
    DragService,
    WindowsService,
    WindowNames,
) {
    class SampleAppView {
        constructor() {
            this._backgroundWindow = overwolf.windows.getMainWindow();
            this._exitButton = document.getElementById("exit");
            this._minimizeButton = document.getElementById("minimize");
            this._header = document.getElementsByClassName("app-header")[0];
            this._version = document.getElementById("version");
            this._settings = document.getElementById("settings");
            this._discord = document.getElementsByClassName("discord-link");

            this.init();
        }

        init() {
            if (this._settings !== null) {
                this._settings.addEventListener("click", async function() {
                    // await WindowsService.restoreWindow('settings');
                    await WindowsService.restore(WindowNames.SETTINGS);
                });
            }
            if (this._minimizeButton !== null) {
                this._minimizeButton.addEventListener("click", async function() {
                    await WindowsService.minimizeCurrentWindow();
                });
            }

            this._exitButton.addEventListener("click", async () => {
                let windowName = await WindowsService.getCurrentWindowName();
                // close the window only if it's settings, else close the app
                if (windowName === WindowNames.SETTINGS) {
                    await WindowsService.closeCurrentWindow();
                } else {
                    this._backgroundWindow.close();
                }
            });

            Array.from(this._discord).forEach(el => {
                   el.addEventListener("click", function() {
                    overwolf.utils.openUrlInDefaultBrowser("https://discord.gg/wSZZDcP");
                });
            });

            // Enable dragging on this window
            overwolf.windows.getCurrentWindow(result => {
                this.dragService = new DragService(result.window, this._header);
            });
        }
    }

    return SampleAppView;
});
