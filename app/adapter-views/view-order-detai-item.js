import { senjs } from "../../src/index.js";
import { TextView } from "../custom-widgets/text-view.js";
import { OrderDetailModel } from "../models/order-detail-model.js";

export class ViewOrderDetailItem extends senjs.layout.FrameLayout {
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
            .setPadding("1.2em")
            .setBorderBottom(1, "rgba(0,0,0,0.1)")
            .setGravity(senjs.constant.Gravity.TOP_LEFT)
            .setOrientation(senjs.constant.Orientation.HORIZONTAL)

        this.views.imv_icon = new senjs.widget.ImageView()
            .toLeftParent().toTopParent().toBottomParent()
            .setWidth(128).setMaxWidth("14%")
            .setTop("0.8em").setBottom("0.8em")
            .setScaleType(senjs.constant.ImageScale.AUTO);

        var panel_info = new senjs.layout.LinearLayout("100%")
            .setLeft("0%")
            .setOrientation(senjs.constant.Orientation.VERTICAL);

        var panel_price = new senjs.layout.LinearLayout("100%")
            .setTop("1em")
            .setOrientation(senjs.constant.Orientation.HORIZONTAL);

        this.views.lb_name = new TextView()
            .setTextAlign("left")
            .bold()
            .setTextSize("1.5em")
            .setTextSize(senjs.res.dimen.font.large)
            .setWidth("100%");

        this.views.lb_price = new TextView()
            .setTextAlign("left")
            .setTextSize("1.2em")
            .setWidth("100%");

        this.views.lb_quantity = new TextView()
            .setTextAlign("center")
            .setTextSize("1.2em")
            .bold()
            .setWidth("100%");

        this.views.lb_total = new TextView()
            .setTextAlign("right")
            .setTextSize("1.2em")
            .setWidth("100%");


        panel_info
            .addView(this.views.lb_name)
            .addView(panel_price);

        panel_price
            .addView(this.views.lb_price)
            .addView(this.views.lb_quantity)
            .addView(this.views.lb_total);

        this.views.sub_container
            // .addView(this.views.imv_icon)
            .addView(panel_info);

        this.addView(this.views.sub_container);

    }

    /**
     * 
     * @param {OrderDetailModel} dataItem 
     * @param {number} position 
     */
    setDataItem(dataItem, position) {
        this._dataItem = dataItem;
        this.views.imv_icon.setImage(dataItem.product.icon);
        this.views.lb_name.setText(dataItem.product.name);
        this.views.lb_price.setText(dataItem.product.price);
        this.views.lb_quantity.setText("x " + dataItem.quantity);
        this.views.lb_total.setText("0");
        return this;
    }
}