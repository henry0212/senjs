import { View } from "../../core/view.js";
import { Waiter } from "../../core/waiter.js";
import { app_constant } from "../../res/constant.js";
import { IconView } from "./icon-view.js";
import { app_size } from "../../res/dimen.js";
import { StickyLayout } from "../layout/sticky-layout.js";
import { material_colors } from "../../res/theme.js";
import { senjs } from "../../index.js";

export class BaseTextView extends View {
    constructor(htmlElement) {
        super(htmlElement);
        this.setTextSize(app_size.font.normal);
        this.setLineHeight("1em")
            .setMinHeight("1.1em");
    }


    setText(text) {
        this.setHTML(text);
        return this;
    }


    /**
     * Change the text with animations 
     * @param {string} text 
     * @param {css className} in_anim
     * @param {css cclassName} out_anim 
     */
    setTextWithAnimation(text, in_anim, out_anim) {
        if (this._cache.changeTextAnimationTimeout != null) {
            this._cache.changeTextAnimationTimeout.remove();
        }
        if (out_anim) {
            this.setAnimation(out_anim);
        } else {
            this.setText("");
        }
        this._cache.changeTextAnimationTimeout = new Waiter(() => {
            this._cache.changeTextAnimationTimeout = new Waiter(() => {
                this.setAnimation(in_anim || "anim_changeText_in");
                this._cache.changeTextAnimationTimeout = null;
                this.setText(text);

            }, this.getAnimationDuration());

        }, 20);
    }


    getText() {
        return this.getHTML().trim();
    }


    italic() {
        this._dom.style.fontStyle = "italic";
        return this;
    }


    upperCase() {
        this._dom.style.textTransform = "uppercase";
        return this;
    }

    setTextDecoration(value) {
        this._dom.style.textDecoration = value;
        return this;
    }

    ellipsis() {
        this._dom.style.textOverflow = "ellipsis";
        this._dom.style.whiteSpace = "nowrap";
        this._dom.style.overflow = "hidden";
        return this;
    }

    setTextAlign(position) {
        this._dom.style.textAlign = position;
        return this;
    }

    setFontWeight(weight) {
        this._dom.style.fontWeight = weight;
        return this;
    }

    setTextColor(color) {
        this.info.textColor = color;
        this._dom.style.color = color;
        return this;
    }

    setTextSize(value) {
        this._dom.style.fontSize = isNaN(value) ? value : value + app_constant.SIZE_UNIT;
        return this;
    }

    setLineHeight(value) {
        this._dom.style.lineHeight = isNaN(value) ? value : value + senjs.constant.SIZE_UNIT;
        return this;
    }

    setTextGravity(gravity) {
        switch (gravity) {
            case app_constant.Gravity.TOP_LEFT:
                this._dom.style.flexDirection = "column";
                this.setTextAlign("left")._dom.style.justifyContent = "inherit";
                break;
            case app_constant.Gravity.TOP_CENTER:
                this._dom.style.flexDirection = "column";
                this.setTextAlign("center")._dom.style.justifyContent = "inherit";
                break;
            case app_constant.Gravity.TOP_RIGHT:
                this._dom.style.flexDirection = "column";
                this.setTextAlign("right")._dom.style.justifyContent = "inherit";
                break;
            case app_constant.Gravity.CENTER_LEFT:
                this.setDisplayType(app_constant.Display.FLEX);
                this._dom.style.flexDirection = "column";
                this.setTextAlign("left")._dom.style.justifyContent = "center";
                break;
            case app_constant.Gravity.CENTER:
                this.setDisplayType(app_constant.Display.FLEX);
                this._dom.style.flexDirection = "column";
                this.setTextAlign("center")._dom.style.justifyContent = "center";
                break;
            case app_constant.Gravity.CENTER_RIGHT:
                this._dom.style.flexDirection = "column";
                this._dom.style.textAlign = "right";
                this.setTextAlign("right")._dom.style.justifyContent = "right";
                break;
            case app_constant.Gravity.BOTTOM_LEFT:
                this._dom.style.flexDirection = "column-reverse";
                this.setTextAlign("left")._dom.style.justifyContent = "end";
                break;
            case app_constant.Gravity.BOTTOM_CENTER:
                this._dom.style.flexDirection = "column-reverse";
                this.setTextAlign("center")._dom.style.justifyContent = "end";
                break;
            case app_constant.Gravity.BOTTOM_RIGHT:
                this._dom.style.flexDirection = "column-reverse";
                this.setTextAlign("right")._dom.style.justifyContent = "end";
                break;
        }
        return this;
    }

    /**
     * Set display error message for this field 
     * @param {string} message 
     */
    setError(message) {
        if (message == null || message.length == 0 && this._cache.layout_error) {
            this._cache.layout_error.destroy();
            return this;
        } else if (this._cache.layout_error) {
            this._cache.layout_error.getViewAt(0).setText(message);
            return this;
        }
        this._cache.layout_error = new StickyLayout(this);
        this._cache.layout_error
            .setAnimation("fadeIn")
            .setWidth(this.getWidth())
            .setBackground("rgba(0,0,0,0.8)")
            .setPadding(5)
            .setBoxSizing("border-box")
            .setRadiusAt(0, 0, 4, 4)
            .setBorderTop(2, material_colors.Red.g500);
        var lb_error = new BaseTextView();
        lb_error.setText(message)
            .setFloat("left")
            .setTextColor("#fff")
            .setTextSize(app_size.font.small);
        var icon_error = new IconView("info")
        icon_error.setFloat("right").setIconSize(app_size.icon.smaller).setIconColor("#fff");

        this._cache.layout_error
            .addView(lb_error)
            .addView(icon_error);
        this._cache.layout_error.events.override.onDestroy((view) => {
            this._cache.layout_error = null;
        });

        return this;
    }

}