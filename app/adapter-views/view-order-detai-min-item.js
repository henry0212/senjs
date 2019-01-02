import { senjs } from "../../src/index.js";
import { TextView } from "../custom-widgets/text-view.js";
import { OrderDetailModel } from "../models/order-detail-model.js";
import { DbUtil } from "../db-utils/database.js";

export class ViewOrderDetailMinItem extends senjs.layout.FrameLayout {
    constructor() {
        super();
        this
            .setWidth("100%")
            .setPaddingLeft("0.2em")
            .setPaddingRight("0.2em");

        this.views = {

        }

        this.views.sub_container = new senjs.layout.LinearLayout("96%")
            .setRadius(0)
            .setLeft("2%")
            .setPadding("0.8em")
            .setBorderBottom(1, "rgba(0,0,0,0.1)")
            .setGravity(senjs.constant.Gravity.TOP_LEFT)
            .setOrientation(senjs.constant.Orientation.HORIZONTAL)

        this.views.lb_name = new TextView()
            .setTextAlign("left")
            .setWidth("60%")
            .bold()
            .ellipsis()
            .setTextSize("1em");

        this.views.lb_quantity = new TextView()
            .setWidth("20%")
            .setLeft("5%")
            .setTextAlign("right")
            .setTextSize("1em");

        this.views.lb_total = new TextView()
            .setWidth("25%")
            .setTextAlign("right")
            .setTextSize("1em");

        this.views.sub_container
            .addView(this.views.lb_name)
            .addView(this.views.lb_quantity)
            .addView(this.views.lb_total);

        this.addView(this.views.sub_container);

    }

    /**
     * 
     * @param {OrderDetailModel} dataItem 
     * @param {number} position 
     */
    setDataItem(dataItem, position) {
        try {
            this._dataItem = dataItem;
            this.views.lb_name.setText(dataItem.product.name);
            this.views.lb_quantity.setText("x " + dataItem.quantity);
            this.views.lb_total.setText("0");

        } catch (ex) {
            console.error(ex);
        }
        return this;
    }
}