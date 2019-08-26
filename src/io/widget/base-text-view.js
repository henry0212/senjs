import { View } from "../../core/view.js";
import { Waiter } from "../../core/waiter.js";
import { app_constant } from "../../res/constant.js";
import { IconView } from "./icon-view.js";
import { app_size } from "../../res/dimen.js";
import { StickyLayout } from "../layout/sticky-layout.js";
import { material_colors } from "../../res/theme.js";
import { senjs } from "../../index.js";
import { FrameLayout } from "../layout/frame-layout.js";

export class BaseTextView extends View {

    static get TextAlign() {
        return senjs.constant.TextAlign;
    }

    constructor(htmlElement) {
        super(htmlElement);
        this.setTextSize(app_size.font.normal);
        this.setLineHeight("1.3em")
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
                this._dom.style.flexDirection = "row";
                this._dom.style.alignItems = "center";
                this.setTextAlign("left")._dom.style.justifyContent = "flex-start";
                break;
            case app_constant.Gravity.CENTER:
                this.setDisplayType(app_constant.Display.FLEX);
                this._dom.style.flexDirection = "row";
                this._dom.style.alignItems = "center";
                this.setTextAlign("center")._dom.style.justifyContent = "center";
                break;
            case app_constant.Gravity.CENTER_RIGHT:
                this._dom.style.flexDirection = "row";
                this._dom.style.textAlign = "right";
                this._dom.style.alignItems = "center";
                this.setTextAlign("right")._dom.style.justifyContent = "flex-end";
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
            .setDirection(senjs.constant.Direction.BOTTOM)
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

    /**
     * Set tips when user hover mouse to it
     * @param {string} text 
     */
    setTooltip(text) {
        // if (this.__tips_uitl == undefined) {
        //     this.__tips_uitl = new ToolTipUtils(this);
        // }
        // this.__tips_uitl.setTips(text);
        return this;
    }
}

let _tips_instance = null;

class ToolTipUtils {
    /**
     * 
     * @param {BaseTextView} focusView 
     */
    constructor(focusView) {
        this.focusView = focusView;
        this.focusView.getDOM().addEventListener("mouseenter", this.onMouseEnter.bind(this));
        this.focusView.getDOM().addEventListener("mouseout", this.onMouseOut.bind(this));
        this.focusView.getDOM().addEventListener("mousemove", this.onMouseMove.bind(this));
        this.pn_tooltip = null;
        this.tips = "";
        this.is_out = false;
    }


    onMouseEnter(e) {
        this.is_out = false;
        if (_tips_instance != null) {
            _tips_instance.destroy();
        }
        if (this.pn_tooltip == null) {
            setTimeout(() => {
                if (this.is_out) {
                    return;
                }

                this.pn_tooltip = _tips_instance = new senjs.layout.FrameLayout()
                    .setPosition(senjs.constant.Position.FIXED)
                    .setBackground('#fff').setShadow("rgba(0,0,0,0.1)", 0, 0, 3)
                    .setTop(e.clientY + 2)
                    .setLeft(e.clientX + 2)
                    .setMaxWidth((senjs.app.info.display.SCREEN_WIDTH - this.focusView.getRelativeLeft() - 10))
                    .setHtml(this.tips)
                    .setAbsoluteZIndex(senjs.app.findHighestZIndex() + 1)
                    .setMinWidth(this.focusView.getWidth() * 0.8).setCss({
                        'font-size': '0.75em'
                    }).setPadding('0.7em');
                senjs.app._addViewToSuperRoot(this.pn_tooltip);
                this.pn_tooltip.events.override.onMeasured((view, w, h) => {
                    var anchor_y = e.clientY + 5;
                    if (anchor_y + h > senjs.app.info.display.SCREEN_HEIGHT) {
                        anchor_y -= h + 5;
                        view.setTop(anchor_y);
                    }
                });
                this.focusView.events.override.onDestroy(() => {
                    if (this.pn_tooltip != null) {
                        this.pn_tooltip.destroy();
                    }
                });
                this.pn_tooltip.events.override.onDestroy((view) => {
                    this.pn_tooltip = null;
                    if (_tips_instance == view) {
                        _tips_instance = null;
                    }
                });
            }, 400);
        }
    }

    onMouseMove(e) {
        if (_tips_instance != null) {
            var anchor_y = e.clientY;
            if (anchor_y + _tips_instance.getHeight() > senjs.app.info.display.SCREEN_HEIGHT) {
                anchor_y -= _tips_instance.getHeight() + 5;
            } else {
                anchor_y += 5;
            }
            _tips_instance
                .setTop(anchor_y)
                .setLeft(e.clientX + 2);
        }
    }



    onMouseOut(e) {
        if (_tips_instance != null) {
            _tips_instance.destroy();
            _tips_instance = null;
        }
        this.is_out = true;
    }

    setTips(text) {
        if (_tips_instance != null) {
            _tips_instance.setHtml(text);
        }
        this.tips = text;
    }

}