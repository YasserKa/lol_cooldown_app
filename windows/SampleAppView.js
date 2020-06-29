define([
  "../scripts/services/drag-service.js", 
  "../../scripts/services/windows-service.js",
  ], function(
    DragService,
    WindowsService,
    ) {
  class SampleAppView {
    constructor() {
      this._backgroundWindow = overwolf.windows.getMainWindow();
      this._exitButton = document.getElementById("exit");
      this._minimizeButton = document.getElementById("minimize");
      this._header = document.getElementsByClassName("app-header")[0];
      this._version = document.getElementById("version");

      this.init();
    }

    init() {
      this._exitButton.addEventListener("click", async function() {
        await WindowsService.closeCurrentWindow();
      });

      this._minimizeButton.addEventListener("click", async function() {
        await WindowsService.minimizeCurrentWindow();
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
