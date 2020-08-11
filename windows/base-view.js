define([
    "../scripts/constants/window-names.js",
    "../scripts/services/drag-service.js",
    "../scripts/services/windows-service.js",
    "../scripts/services/hotkeys-service.js",
], function(
    WindowNames,
    DragService,
    WindowsService,
    HotkeysService,
) {
    class BaseView {
        constructor() {
            this._container = document.getElementsByClassName('container-fluid')[0];
            this._exitButton = document.getElementById("exit");
            this._minimizeButton = document.getElementById("minimize");
            this._header = document.getElementsByClassName("app-header")[0];
            this._settingsEl = document.getElementById("settings");
            this._adEl = document.getElementById("ad-div");
            this._discord = document.getElementsByClassName("discord-link");
            this._hotkey = document.getElementById("hotkey");
            this._width = document.getElementById("ad-div");
            this._height = document.getElementById("ad-div");

            this._backgroundWindow = overwolf.windows.getMainWindow();
            this._settings = this._backgroundWindow.settings;
            this._ad = null;

            this.displayAd = this.displayAd.bind(this);
            this.removeAd = this.removeAd.bind(this);
            this.updateHotkey = this.updateHotkey.bind(this);
            this.onWindowStateChanged = this.onWindowStateChanged.bind(this);
            this.init();
        }


        async init() {
            let overwolfWindow = await WindowsService.getCurrentWindow();
            this._windowName = overwolfWindow.name;
            this._height = overwolfWindow.height;
            this._width = overwolfWindow.width;

            if (this._settingsEl !== null) {
                this._settingsEl.addEventListener("click", async function() {
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

            // assign discord elements
            Array.from(this._discord).forEach(el => {
                   el.addEventListener("click", function() {
                    overwolf.utils.openUrlInDefaultBrowser("https://discord.gg/wSZZDcP");
                });
            });

            // enable dragging on this window
            overwolf.windows.getCurrentWindow(result => {
                this.dragService = new DragService(result.window, this._header);
            });

            // update hotkey view and listen to changes
            if (this._hotkey !== null) {
                this.updateHotkey();
                HotkeysService.addHotkeyChangeListener(this.updateHotkey);
            }


            this.updateScale(this._settings.getSetting(this._settings.SETTINGS.WINDOW_SCALE));
            // update view when settings are updated
            this._settings.addListener(`${this._windowName}_view_scale`, (settings) => {
                this.updateScale(settings[this._settings.SETTINGS.WINDOW_SCALE]);
            });


            // remove/refresh app on window state change(minimize/normal)
            overwolf.windows.onStateChanged.removeListener(this.onWindowStateChanged);
            overwolf.windows.onStateChanged.addListener(this.onWindowStateChanged);
        }

        async updateScale(scale) {
            let newHeight = parseInt(this._height * scale);
            let newWidth = parseInt(this._width * scale);
            let zoomValue = scale * 100 * window.devicePixelRatio;

            let windowObjectParams = {
              "window_id": this._windowName,
              "width": newWidth,
              "height": newHeight,
              "auto_dpi_resize": true
            };

            this._container.style.zoom = `${zoomValue}%`;
            overwolf.windows.setMinSize(this._windowName, newWidth, newHeight, () => {})
            overwolf.windows.changeSize(windowObjectParams, () => {});
        }

        async updateHotkey() {
            let hotkey = await HotkeysService.getToggleHotkey();
            this._hotkey.textContent = hotkey;
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
