
import { app } from '../../core/app-context.js'
import { BaseTextView } from './base-text-view.js';
import { app_constant } from '../../res/constant.js';
import { app_size } from '../../res/dimen.js'
import { senjs } from '../../index.js';
let iconClassKey = "material-icons";


export class IconView extends BaseTextView {

    static set iconClassName(key) {
        iconClassKey = key;
    }

    constructor(icon_name) {
        super(document.createElement("i"));
        this.setHTML(icon_name)
            .setClassName(iconClassKey)
            .setDisplayType(app_constant.Display.INLINE_FLEX)
            .setGravity(senjs.constant.Gravity.CENTER)
        this.setIconSize(app_size.icon.normal);
    }


    onDestroy(view) {

    }

    onMeasured(view, w, h) {

    }

    centerVertical() {
        if (this.info.arrangeLayoutType != -1) {
            return;
        }
        var h = this._dom.offsetHeight - view.getPaddingTop() - view.getPaddingBottom();
        var ch = this._dom.offsetHeight;
        var top = ((h - ch) / 2);
        if (top > 0) {
            top = parseInt(top);
            this.setTop(top);
        }
        this.opacity(1);
        return this;
    }

    updateIcon(iconName) {
        this.setHtml(iconName);
        return this;
    }

    setIcon(iconName) {
        this.setHtml(iconName);
        return this;
    }

    setIconSize(value) {
        this.setTextSize(value);
        return this;
    }

    setIconColor(color) {
        this.setTextColor(color);
        return this;
    }

    static init(icon_class_name) {
        var css_icon = document.createElement("link");
        css_icon.href = 'css/material-icon.css';
        css_icon.rel = "stylesheet";
        css_icon.onload = function () {
        }
        document.getElementsByTagName("head")[0].appendChild(css_icon);
    }

}