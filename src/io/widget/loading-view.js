import { LinearLayout } from "../layout/linear-layout.js";
import { senjs } from "../../index.js";


export class LoadingView extends LinearLayout {
    constructor() {
        super();
    }

    onInit() {
        super.onInit();
        for (var i = 0; i < 4; i++) {
            this.addView(new senjs.widget.TextView().setClassName('anim-loading-view')
                .setCss({
                    'animation-delay': (0.2 * i) + 's'
                }))
        }
        this.setGravity(senjs.constant.Gravity.CENTER);
        this.setCss({ 'color': senjs.res.material_colors.Grey.g500 });
    }

    setCircleColor(color) {
        this.setCss({ 'color': color });
        return this;
    }

}