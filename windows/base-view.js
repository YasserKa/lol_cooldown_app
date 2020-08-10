define([
    "../scripts/services/drag-service.js",
    "../../scripts/services/windows-service.js",
    "../../scripts/constants/window-names.js",
], function(
    DragService,
    WindowsService,
    WindowNames,
) {
    class BaseView {
        constructor() {
            this._backgroundWindow = overwolf.windows.getMainWindow();
            this._exitButton = document.getElementById("exit");
            this._minimizeButton = document.getElementById("minimize");
            this._header = document.getElementsByClassName("app-header")[0];
            this._version = document.getElementById("version");
            this._settings = document.getElementById("settings");
            this._discord = document.getElementsByClassName("discord-link");
            this._adEl = document.getElementById("ad-div");
            this._ad = null;

            this.displayAd = this.displayAd.bind(this);
            this.removeAd = this.removeAd.bind(this);
            this.onWindowStateChanged = this.onWindowStateChanged.bind(this);
            this.init();
        }

        init() {
            if (this._settings !== null) {
                this._settings.addEventListener("click", async function() {
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

            // enable dragging on this window
            overwolf.windows.getCurrentWindow(result => {
                this.dragService = new DragService(result.window, this._header);
            });

            // remove/refresh app on window state change(minimize/normal)
            overwolf.windows.onStateChanged.removeListener(this.onWindowStateChanged);
            overwolf.windows.onStateChanged.addListener(this.onWindowStateChanged);
        }

        displayAd() {
            if (this._adEl !== null && OwAd) {
                this._ad = new OwAd(this._adEl);
            }
        }

        removeAd() {
            if (this._ad !== null) {
                this._ad.refreshAd();
            }
        }

        // define the event handler
        onWindowStateChanged(state) {
            if (this._ad === null) {
                return;
            }

            if(state) {
                // when state changes to minimized, call removeAd()
                if (state.window_state === "minimized") {
                    this._ad.removeAd();
                }
                // when state changes from minimized to normal, call refreshAd()
                else if(state.window_previous_state === "minimized" && state.window_state === "normal"){
                    this._ad.refreshAd();
                }
            }
        }


    }

    return BaseView;
});
