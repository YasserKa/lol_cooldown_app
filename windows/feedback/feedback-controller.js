define([
    'feedback-view.js',
    '../base-window-controller',
], function (
    FeedbackView,
    BaseWindowController,
) {

    class FeedbackController extends BaseWindowController{
        constructor() {
            super(FeedbackView);
        }

        async run() {
            await super.run();
        }
    }

    return FeedbackController;
});
