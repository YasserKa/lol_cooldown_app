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
            this._headerMessage = document.getElementById("header-message");
            this._settingsEl = document.getElementById("settings");
            this._adEl = document.getElementById("ad-div");
            this._spinner = document.querySelector(".spinner-container");
            this._discord = document.getElementsByClassName("discord-link");
            this._hotkey = document.getElementById("hotkey");
            this._modal = document.getElementById("modal");
            this._modalDescription = document.getElementById("modal-description");

            this._mainWindow = overwolf.windows.getMainWindow();
            this._settings = this._mainWindow.settings;
            this._ad = null;

            this.displayAd = this.displayAd.bind(this);
            this.removeAd = this.removeAd.bind(this);
            this.updateAdScale = this.updateAdScale.bind(this);
            this.updateHotkey = this.updateHotkey.bind(this);
            this.onWindowStateChanged = this.onWindowStateChanged.bind(this);
            this.displayModal = this.displayModal.bind(this);
            this._removeModal = this._removeModal.bind(this);
            this.displaySpinner = this.displaySpinner.bind(this);
            this.removeSpinner = this.removeSpinner.bind(this);
        }

        async init() {
            let overwolfWindow = await WindowsService.getCurrentWindow();
            this._windowName = overwolfWindow.name;
            let scale = this._settings.getSetting(this._settings.SETTINGS.WINDOW_SCALE);
            this._defaultHeight = overwolfWindow.height / scale;
            this._defaultWidth = overwolfWindow.width / scale;

            if (this._settingsEl !== null) {
                this._settingsEl.addEventListener("click", async () => {
                    await WindowsService.restore(WindowNames.SETTINGS);
                });
            }
            if (this._minimizeButton !== null) {
                this._minimizeButton.addEventListener("click", async () => {
                    await WindowsService.minimizeCurrentWindow();
                });
            }

            this._exitButton.addEventListener("click", async () => {
                let windowName = await WindowsService.getCurrentWindowName();
                // close the window only if it's settings, else close the app
                if (windowName === WindowNames.APP ||
                    windowName === WindowNames.MAIN) {
                    this._mainWindow.close();
                } else {
                    await WindowsService.closeCurrentWindow();
                }
            });
            // When the user clicks anywhere outside of the modal, close it
            if (this._modal !==null) {
                this._modal.addEventListener('click', () => {
                    this._removeModal();
                })

                window.onclick = function(event) {
                    if (event.target == this._modal) {
                        this._removeModal();
                    }
                }.bind(this);
            }

            // assign discord elements
            Array.from(this._discord).forEach(el => {
                el.addEventListener("click", () => {
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

            // update view when settings are updated
            // remove/refresh app on window state change(minimize/normal)
            overwolf.windows.onStateChanged.removeListener(this.onWindowStateChanged);
            overwolf.windows.onStateChanged.addListener(this.onWindowStateChanged);
        }

        updateHeaderMessage(message) {
            if (this._headerMessage !== null) {
                this._headerMessage.innerHTML = message;
            }
        }

        displayModal(message) {
            if (this._modal !== null) {
                this._modal.style.display = "block";
                this._modalDescription.textContent = message;
            }
        }

        _removeModal() {
            if (this._modal !== null) {
                this._modal.style.display = "none";
            }
        }

        displaySpinner() {
            if (this._spinner !== null) {
                this._spinner.style.display = 'block';
            }
        }

        removeSpinner() {
            if (this._spinner !== null) {
                this._spinner.style.display = 'none';
            }
        }

        updateScale(scale) {
            console.info('updating window scale');
            this._updateWindowScale(scale);
            this.updateHtmlContentScale(scale);
            this.updateAdScale(scale);
        }

        _updateWindowScale(scale) {
            let newHeight = parseInt(this._defaultHeight * scale);
            let newWidth = parseInt(this._defaultWidth * scale);

            let windowObjectParams = {
                "window_id": this._windowName,
                "width": newWidth,
                "height": newHeight,
                "auto_dpi_resize": true
            };

            overwolf.windows.changeSize(windowObjectParams, () => {});
        }

        updateHtmlContentScale(scale) {
            let zoomValue = scale * 100;
            this._container.style.zoom = `${zoomValue}%`;
        }

        async updateHotkey() {
            let hotkey = await HotkeysService.getToggleHotkey();
            this._hotkey.textContent = hotkey;
        }

        updateAdScale(scale) {
            let zoomValue = 100/scale;
            this._adEl.style.zoom = `${zoomValue}%`;
            this._adEl.style.transform = `scale(${scale})`;
            this._adEl.style.transformOrigin = 'left top';
        }

        displayAd() {
            if (this._adEl !== null && OwAd) {
                this._ad = new OwAd(this._adEl,
                    {width: this._adEl.offsetWidth, height: this._adEl.offsetHeight}
                );
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
