import { BaseLayout } from "./base-layout.js";
import { app_constant } from "../../res/constant.js";
import { senjs } from "../../index.js";

export class RatioLayout extends BaseLayout {
    constructor(width, ratio_prefix) {
        super(width);
        this._view = {
            root: new senjs.layout.FrameLayout().toFillParent()
        }
        ratio_prefix = ratio_prefix ? ratio_prefix : "3:1";
        var arr = ratio_prefix.split(':');
        if (arr.length == 2) {
            this._meta.ratio_percent = Number(arr[1]) * 100 / Number(arr[0]);
        } else {
            this._meta.ratio_percent = 100;
        }
        this.events.override.onCreated(() => {
            console.log(document.styleSheets);
            var sheet = document.styleSheets[0];
            sheet.addRule(`#${this._dom.id}:before`,
                ` content:' ';
                    width:100%;
                    display:block;
                    padding-top: ${ this._meta.ratio_percent}%`
                , 1);
        })

        super.addView(this._view.root);
    }

    setHeight(val) {
        return this;
    }

    addView(view) {
        this._view.root.addView(view);
        return this;
    }
    addViewAt(view, index) {
        this._view.root.addViewAt(view, index);
        return this;
    }

    getViewAt(index) {
        return this._view.root.getViewAt(index);
    }

    removeAllView() {
        this._view.root.removeAllView();
        return this;
    }

    removeChild(view) {
        this._view.root.removeChild(view);
        return this;
    }

    removeChildAt(index) {
        this._view.root.removeChildAt(index);
        return this;
    }

    getAllViews(){
        return this._view.root.getAllViews();
    }
}