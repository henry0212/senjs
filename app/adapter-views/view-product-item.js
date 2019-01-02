import { senjs } from "../../src/index.js";
import { TextView } from "../custom-widgets/text-view.js";
import { ProductModel } from "../models/product-model.js";

export class ViewProductItem extends senjs.layout.FrameLayout {
    constructor() {
        super();
        this
            .setPadding("0.5em")
            .setWidth("100%");

        this.views = {}

        this.views.sub_container = new senjs.layout.LinearLayout("100%")
            .setShadow("rgba(0,0,0,0.1)", 0, 0, 1)
            .setRadius(0)
            .setPadding("0.5em")
            .setOrientation(senjs.constant.Orientation.VERTICAL)


        this.views.imv_icon = new senjs.widget.ImageView()
            .setWidth("100%").setHeight(220)
            .setScaleType(senjs.constant.ImageScale.AUTO);

       
        this.views.lb_name = new TextView()
            .setTextSize(senjs.res.dimen.font.large)
            .setTop("0.5em");
        this.views.lb_code = new TextView()
            .setTop("0.5em");
        this.views.lb_price = new TextView()
            .setTop("0.5em");

        this.views.sub_container
           .addView(this.views.imv_icon)
            .addView(this.views.lb_name)
            .addView(this.views.lb_code)
            .addView(this.views.lb_price);
        this.addView(this.views.sub_container);

    }

    /**
     * 
     * @param {ProductModel} dataItem 
     * @param {number} position 
     */
    setDataItem(dataItem, position) {
        this._dataItem = dataItem;
        this.views.imv_icon.setImage(dataItem.icon);
        this.views.lb_name.setText(dataItem.name);
        this.views.lb_code.setText(dataItem.code);
        this.views.lb_price.setText(dataItem.price);
        return this;
    }
}