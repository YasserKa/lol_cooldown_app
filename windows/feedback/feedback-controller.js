define([
    'feedback-view.js',
    '../base-window-controller',
    "../../scripts/constants/window-names.js",
    "../../scripts/services/windows-service.js",
], function (
    FeedbackView,
    BaseWindowController,
    WindowNames,
    WindowsService,
) {

    class FeedbackController extends BaseWindowController{
        constructor() {
            super(FeedbackView);
        }

        async run() {
            await super.run();

            WindowsService.centerWindow(WindowNames.FEEDBACK);
        }
    }

    return FeedbackController;
});
