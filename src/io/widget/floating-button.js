import { IconView } from "./icon-view.js";
import app_resource from "../../res/index.js";


export class FloatingButton extends IconView {
    constructor(icon_name) {
        super(icon_name);

    }

    onInit() {
        super.onInit();
        this.setRadius('50%')
            .setIconSize(app_resource.app_size.icon.s32)
            .setShadow("rgba(0,0,0,0.4)", 0, 0, 4)
            .setBackground("#fff")
            .setTextGravity(app_resource.app_constant.Gravity.CENTER)
            .setWidth(app_resource.app_size.icon.s56)
    }

    setWidth(size) {
        super.setWidth(size);
        super.setHeight(size);
        return this;
    }

    setHeight(size) {
        super.setWidth(size);
        super.setHeight(size);
        return this;
    }
}