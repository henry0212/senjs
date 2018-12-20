import { senjs } from "../../src/index.js";


export class AdapterViewMenuGuideItem extends senjs.layout.LinearLayout {
    constructor() {
        super('100%','auto');
        this.dataItem = null;
    }

    initViews() {
        this.views = {
            lb_title: new senjs.widget.TextView(),
        }
        if (this.dataItem) {
            this.views.lb_title.setText(this.dataItem.name);
        }
        this.addView(this.views.lb_title);
    }

    setDataItem(dataItem) {
        this.dataItem = dataItem;
        if (this.views.lb_title) {
            this.views.lb_title.setText(this.dataItem.name);
        }
    }
}