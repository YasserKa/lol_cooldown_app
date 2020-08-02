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

      this.init();
    }

    init() {
      if (this._settings !== null) {
        this._settings.addEventListener("click", async function() {
          // await WindowsService.restoreWindow('settings');
          WindowsService.restore(WindowNames.SETTINGS);
        });
      }
      if (this._minimizeButton !== null) {
        this._minimizeButton.addEventListener("click", async function() {
          await WindowsService.minimizeCurrentWindow();
        });
      }

      this._exitButton.addEventListener("click", async function() {
        await WindowsService.closeCurrentWindow();
      });


      // Enable dragging on this window
      overwolf.windows.getCurrentWindow(result => {
        this.dragService = new DragService(result.window, this._header);
      });
      // Display version
      overwolf.extensions.current.getManifest(manifest => {
        if (!this._version) {
          return;
        }
        this._version.textContent = `Version ${manifest.meta.version}`;
      });
    }
  }

  return SampleAppView;
});
