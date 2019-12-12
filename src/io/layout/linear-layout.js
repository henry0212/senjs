import { BaseLayout } from "./base-layout.js";
import { app_constant } from "../../res/constant.js";
import { senjs } from "../../index.js";



export class LinearLayout extends BaseLayout {

    static get GRAVITY() {
        return senjs.constant.Gravity;
    }

    constructor(width, height) {
        super(width, height);
        this._meta.gravity = app_constant.Gravity.TOP_LEFT;
        this.setOrientation(app_constant.Orientation.HORIZONTAL);
    }

    setOrientation(type) {
        this._meta.orientation = type;
        switch (type) {
            case app_constant.Orientation.HORIZONTAL:
                this.setDisplayType(app_constant.Display.INLINE_FLEX);
                this._dom.style.flexDirection = "row";
                break;
            case app_constant.Orientation.VERTICAL:
                this.setDisplayType(app_constant.Display.INLINE_FLEX);
                this._dom.style.flexDirection = "column";
                break;
            default:
                this.setDisplayType(app_constant.Display.INLINE_FLEX);
                break;
        }
        this.setGravity(this._meta.gravity);
        return this;
    }

    /**
     * 
     * @param {app_constant.Gravity} gravity 
     */
    setGravity(gravity) {
        this._meta.gravity = gravity;
        if (this._meta.orientation == app_constant.Orientation.HORIZONTAL) {
            super.setGravity(gravity);
        } else {
            /** use for Vertical */
            switch (gravity) {
                case app_constant.Gravity.TOP_LEFT:
                    this._dom.style.justifyContent = "flex-start";
                    this._dom.style.alignItems = "flex-start";
                    break;
                case app_constant.Gravity.TOP_CENTER:
                    this._dom.style.justifyContent = "flex-start";
                    this._dom.style.alignItems = "center";
                    break;
                case app_constant.Gravity.TOP_RIGHT:
                    this._dom.style.justifyContent = "flex-start";
                    this._dom.style.alignItems = "flex-end";
                    break;
                case app_constant.Gravity.CENTER_LEFT:
                    this._dom.style.justifyContent = "center";
                    this._dom.style.alignItems = "flex-start";
                    break;
                case app_constant.Gravity.CENTER:
                    this._dom.style.justifyContent = "center";
                    this._dom.style.alignItems = "center";
                    break;
                case app_constant.Gravity.CENTER_RIGHT:
                    this._dom.style.alignItems = "flex-end";
                    this._dom.style.justifyContent = "center";
                    break;
                case app_constant.Gravity.BOTTOM_LEFT:
                    this._dom.style.alignItems = "flex-start";
                    this._dom.style.justifyContent = "flex-end";
                    break;
                case app_constant.Gravity.BOTTOM_CENTER:
                    this._dom.style.alignItems = "center";
                    this._dom.style.justifyContent = "flex-end";
                    break;
                case app_constant.Gravity.BOTTOM_RIGHT:
                    this._dom.style.alignItems = "flex-end";
                    this._dom.style.justifyContent = "flex-end";
                    break;
            }
        }
        return this;
    }


    addView(view) {
        super.addView(view);
        return this;
    }
}