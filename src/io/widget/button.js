import { View } from "../../core/view.js";
import { BaseTextView } from "./base-text-view.js";

export class Button extends BaseTextView {
    constructor(text) {
        super(document.createElement("button"));
        this.setText(text || "button");
    }

    onInit() {
        super.onInit();
        this.setCursor("pointer");
        this.setPadding(5)
            .setWidth("max-content")
            .setBorder(0, "transparent")
            .setBackground("transparent")
            .setCss({
                'margin': '0px'
            })
            .bold();
    }
}