import { senjs } from "../../src/index.js";
import { TextView } from "../custom-widgets/text-view.js";
import { ProductModel } from "../models/product-model.js";

export class ViewProductItemAsRow extends senjs.layout.FrameLayout {
    constructor() {
        super();
        this
            .setWidth("100%")
            .setPaddingLeft("1em")
            .setPaddingRight("1em");

        this.views = {}

        this.views.sub_container = new senjs.layout.LinearLayout("100%")
            .setRadius(0)
            .setPadding("3em")
            .setBorderBottom(1, "rgba(0,0,0,0.1)")
            .setGravity(senjs.constant.Gravity.CENTER)
            .setOrientation(senjs.constant.Orientation.HORIZONTAL)

        this.views.imv_icon = new senjs.widget.ImageView()
            .setWidth(128).setMaxWidth("14%")
            .toLeftParent().toTopParent().toBottomParent()
            .setTop("1em").setBottom("1em")
            .setScaleType(senjs.constant.ImageScale.AUTO);

        var panel_info = new senjs.layout.LinearLayout("85%")
            .setLeft("15%") 
            .setOrientation(senjs.constant.Orientation.HORIZONTAL)

        this.views.lb_name = new TextView()
            .setTextAlign("center")
            .setTextSize(senjs.res.dimen.font.large)
            .setWidth("100%");
        this.views.lb_code = new TextView()
            .setTextAlign("center")
            .setWidth("100%");
        this.views.lb_price = new TextView()
            .setTextAlign("center")
            .setWidth("100%");

        this.views.sub_container.addView(this.views.imv_icon)
            .addView(panel_info);
        panel_info.addView(this.views.lb_name)
            .addView(this.views.lb_code)
            .addView(this.views.lb_price);
        this.addView(this.views.sub_container);

    }

    /**
     * 
     * @param {ProductModel} dataItem 
     * @param {*} position 
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