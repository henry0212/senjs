import { View } from "../../core/view.js";
import { app_constant } from "../../res/constant.js";
import { app_theme } from "../../res/theme.js";

export class SliderButton extends View {
    constructor() {
        super(document.createElement("div"));

    }

    onInit() {
        super.onInit();
        this.listener = {
            onClicked: null,
            onStateChanged: null
        }

        this.meta_data = {
            isSliderEnable: false
        }

        var view_thum = new View(document.createElement("a"));
        this.addView(view_thum);
        this.setBackground(app_theme.sliderButton.status_default.background)
            .setShadow("rgba(0,0,0,0.2)", 0, 0, 2, true)
            .setHeight(24).setWidth(48).setFloat("left")
            .setTransitionAll(".1");

        // initView
        view_thum
            .setBackground(app_theme.sliderButton.status_default.thum)
            .setPosition(app_constant.Position.ABSOLUTE)
            .toLeftParent().setLeft(2)
            .toTopParent().setTop(2)
            .toBottomParent().setBottom(2)
            .setShadow("rgba(0,0,0,0.4)", 0, 0, 2)
            .setTransitionAll(".2");

        var self = this;

        super.setOnClick((view) => {
            this.setStateEnable(!this.meta_data.isSliderEnable)
            if (this.listener.onClicked) {
                this.listener.onClicked(this);
            }
            if (this.listener.onStateChanged) {
                this.listener.onStateChanged(this, this.meta_data.isSliderEnable);
            }
        })
    }

    onMeasured(view, width, height) {
        this.getViewAt(0).setWidth(height - 4).setHeight(height - 4).setRadius(height);
        this.setRadius(height);
    }

    setOnClick(listener) {
        this.listener.onClicked = listener;
    }

    /**
     * @param listener 
     * @description this event will be called after the button status changed
     * 
     */
    setOnStateChanged(listener) {
        this.listener.onStateChanged = listener;
    }

    /**
     * set button enable or disable status
     * @param {boolean} flag 
     */
    setStateEnable(flag) {
        this.meta_data.isSliderEnable = flag;
        if (this.meta_data.isSliderEnable) {
            this.getViewAt(0).setLeft(this.getWidth() - this.getViewAt(0).getWidth() - 2)
                .setBackground(app_theme.sliderButton.status_checked.thum);
            this.setBackground(app_theme.sliderButton.status_checked.background);
        } else {
            this.getViewAt(0).setLeft(2).setBackground(app_theme.sliderButton.status_default.thum);
            this.setBackground(app_theme.sliderButton.status_default.background);
        }
    }

    isSliderEnable() {
        return this.meta_data.isSliderEnable;
    }
}