import { FrameLayout } from "../layout/frame-layout.js";
import { senjs } from "../../index.js";

export class ProgressingBar extends FrameLayout {
    constructor() {
        super();
        this.__views = {
            percent_bar: new senjs.layout.LinearLayout('0%').setGravity(senjs.constant.Gravity.CENTER)
                .toTopParent().toBottomParent().toLeftParent().setTransitionAll('0.1','linear')
                .addToParent(this).setCss({
                    'font-size': '70%'
                })
        }
    }

    setProgressBackground(color) {
        this.__views.percent_bar.setBackground(color);
        return this;
    }

    setProgressTextColor(color) {
        this.__views.percent_bar.setCss({
            color: color
        });
        return this;
    }

    setPercent(number) {
        this.__views.percent_bar.setWidth(number + "%").setHtml(number + "%");
        return this;
    }

}