import { View } from "../../core/view.js";
import { BaseList } from "./base-list.js";
import { senjs } from "../../index.js";

export class HorizontalListView extends BaseList {
    constructor() {
        super();

    }

    override_onCreated(View) {
        this.view.frame_scroller.setRotate(-90);
    }
}