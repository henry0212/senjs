import { BaseLayout } from "./base-layout.js";
import { app_constant } from "../../res/constant.js";



export class LinearLayout extends BaseLayout {
    constructor(width, height) {
        super(width, height);
        this.setOrientation(-1);
    }

    setOrientation(type) {
        switch (type) {
            case app_constant.Orientation.HORIZONTAL:
                this.setDisplayType(app_constant.Display.INLINE_FLEX);
                this._dom.style.flexDirection = "initial";
                break;
            case app_constant.Orientation.VERTICAL:
                this.setDisplayType(app_constant.Display.INLINE_FLEX);
                this._dom.style.flexDirection = "column"
                break;
            default:
                this.setDisplayType(app_constant.Display.INLINE_FLEX);
                break;
        }
        return this;
    }

    addView(view) {
        super.addView(view);
        return this;
    }
}