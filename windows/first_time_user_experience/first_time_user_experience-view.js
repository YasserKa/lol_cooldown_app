define([
    '../base-view.js',
    '../../scripts/helpers/utils.js',
    "../../scripts/services/windows-service.js",

    "../../scripts/constants/window-names.js",
], function (
    BaseView,
    Utils,
    WindowsService,
    WindowsNames
) {

    class FirstTimeUserExperienceView extends BaseView {
        constructor() {
            super();

            this._subscriberLink = document.getElementById("subscribe-link");
            this._closeWindowButton = document.getElementById("close-window");

            this._subscriberLink.addEventListener("click", () => {
                this.openStore()
            });

            this._closeWindowButton.addEventListener("click", () => {
                WindowsService.close(WindowsNames.FIRST_TIME_USER_EXPERIENCE);
            });
        }

        openStore() {
            overwolf.utils.openStore({
                page:overwolf.utils.enums.eStorePage.SubscriptionPage
            });
        }

        _initElements() {
        }


    }

    return FirstTimeUserExperienceView;
});
