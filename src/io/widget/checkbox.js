import { View } from "../../core/view.js";
import { TextView } from "./text-view.js";
import { IconView } from "./icon-view.js";
import { app_theme } from "../../res/theme.js";
import { BaseTextView } from "./base-text-view.js";
import { app_constant } from "../../res/constant.js";

const icon_state = {
    uncheck: "check_box_outline_blank",
    checked: "check_box"
}

export class Checkbox extends BaseTextView {
    constructor() {
        super(document.createElement("div"));
        this._meta = {
            isChecked: false
        }
        this.listener = {
            onClicked: null,
            onCheckedChange: null
        }
        this._view = {
            icon: null,
            label: null
        }

        var panel = new View(document.createElement("div"));
        this._view.label = new TextView();
        this._view.label.setText("checkbox").setDisplayType(app_constant.Display.INLINE_BLOCK);
        this._view.icon = new IconView("check_box_outline_blank").setRight(5).setDisplayType(app_constant.Display.INLINE_BLOCK);
        this.setWidth("max-content");

        this._dom.style.display = "inline-flex";
        this._dom.style.justifyContent = "center";
        this._dom.style.flexDirection = "column";
        this._view.icon._dom.style.verticalAlign = "middle";
        this._view.label._dom.style.verticalAlign = "middle";

        this._view.icon.setTransitionAll(".1");
        panel.addView(this._view.icon)
            .addView(this._view.label);
        this.addView(panel);
        this.setChecked(false);
        super.setOnClick(() => {
            this.onClicked();
        })
    }

    onClicked() {
        this.setChecked(!this._meta.isChecked);
        if (this.listener.onCheckedChange) {
            this.listener.onCheckedChange(this, this._meta.isChecked)
        }
        if (this.listener.onClicked) {
            this.listener.onClicked(this);
        }
    }

    /**
     * @params listener call this when event executed
     * @description pass the function with params: function(view, isChecked)
     */
    setOnCheckedChange(listener) {
        this.listener.onCheckedChange = listener;
    }

    setOnClick(listener) {
        this.listener.onClicked = listener;
    }

    setChecked(flag) {
        this._meta.isChecked = flag;
        if (this._meta.isChecked) {
            this._view.icon
                .updateIcon(icon_state.checked)
                .setIconColor(app_theme.checkbox.status_checked.icon);
            this._view.label
                .setFontWeight(app_theme.checkbox.status_checked.fontWeight)
                .setTextColor(app_theme.checkbox.status_checked.text)
            this.setBackground(app_theme.checkbox.status_checked.background);
        } else {
            this._view.icon
                .updateIcon(icon_state.uncheck)
                .setIconColor(app_theme.checkbox.status_default.icon);
            this._view.label
                .setFontWeight(app_theme.checkbox.status_default.fontWeight)
                .setTextColor(app_theme.checkbox.status_default.text)
            this.setBackground(app_theme.checkbox.status_default.background);
        }
    }

    setText(text) {
        this._view.label.setText(text);
        return this;
    }
}   