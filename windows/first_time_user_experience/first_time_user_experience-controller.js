define([
    'first_time_user_experience-view.js',
    '../base-window-controller',
    "../../scripts/constants/window-names.js",
    "../../scripts/services/windows-service.js",
], function (
    FirstTimeUserExperienceView,
    BaseWindowController,
    WindowNames,
    WindowsService,
) {

    class FirstTimeUserExperienceViewController extends BaseWindowController{
        constructor() {
            super(FirstTimeUserExperienceView);
        }

        async run() {
            await super.run();
        }
    }

    return FirstTimeUserExperienceViewController;
});
