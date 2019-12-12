
import { BaseTextView } from "./base-text-view.js";

export class TextView extends BaseTextView {
    constructor(text) {
        super(document.createElement("span"));
        this.setText(text != undefined ? text : "");
    }
}