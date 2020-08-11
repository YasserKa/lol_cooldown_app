define([
    '../base-view.js',
    '../../scripts/helpers/utils.js',
], function (
    BaseView,
    Utils,
) {

    class SettingsView extends BaseView {
        constructor() {
            super();


            this._version = document.getElementById("version");

            this.updateVersion();
        }

        async updateVersion() {
            const version = await Utils.getAppVersion();
            this._version.textContent = version;
        }
    }

    return SettingsView;
});
