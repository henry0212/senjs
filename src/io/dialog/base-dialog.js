import { View } from "../../core/view.js";
import { FrameLayout } from "../layout/frame-layout.js";
import { app } from "../../core/app-context.js";
import { app_theme } from "../../res/theme.js";

const dialog_context = {
    showAnim: "dialog_in",
    hideAnim: "dialog_out"
}
export class BaseDialog extends FrameLayout {

    constructor() {
        super();
        this.info._dialog = true;

        this._meta.preventTouchOutside = false;

        this.setMinWidth(100);
        this.setBackground(app_theme.dialog.background)
            .setRadius(app_theme.dialog.radius);
    }

    show() {
        this.setAnimation(dialog_context.showAnim);
        app._addDialog(this);
        return this;
    }

    dismiss() {
        super.destroyWithCustomAnimation(dialog_context.hideAnim);
        return this;
    }

    setEnableTouchOutside(flag) {
        this._meta.preventTouchOutside = !flag;
        return this;
    }

}