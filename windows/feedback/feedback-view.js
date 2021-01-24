define([
    '../base-view.js',
    '../../scripts/helpers/utils.js',
    "../../scripts/services/windows-service.js",
], function (
    BaseView,
    Utils,
    WindowsService,
) {

    class FeedbackView extends BaseView {
        constructor() {
            super();
            this._submitEl = document.getElementById("submit");
            this._feedbackTextEl = document.getElementById("feedback-text");
            this._emailEl = document.getElementById("email");
            this._initElements();
        }

        _initElements() {
            if (this._submitEl !== null) {
                this._submitEl.addEventListener("click", async () => {

                    let url = "https://www.lolcooldown.com/api/mail?feedback="
                    url += "mail:" + this._emailEl.value +
                        "         feedback: "+this._feedbackTextEl.value;

                    await Utils.makeRequest(url);

                    await WindowsService.closeCurrentWindow();
                });
            }
        }


    }

    return FeedbackView;
});
