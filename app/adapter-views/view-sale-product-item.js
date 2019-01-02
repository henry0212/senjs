import { senjs } from "../../src/index.js";
import { TextView } from "../../src/io/widget/text-view.js";
import { ProductModel } from "../models/product-model.js";


export class ViewProductSaleItem extends senjs.layout.FrameLayout {


    constructor() {
        super();
        this.data = {
            productItem: null
        }
        this.initViews();
    }

    onCreated(view) {
        super.onCreated(view);
    }

    initViews() {
        this.views = {
            panel_root: new senjs.layout.LinearLayout("100%"),
            imv_icon: new senjs.widget.ImageView(),
            lb_name: new TextView(),
            lb_price: new TextView()
        }

        this.views.panel_root
            .setPadding("0.5em")
            .setOrientation(senjs.constant.Orientation.VERTICAL)
            .setShadow("rgba(0,0,0,0.2)", 0, 0, 2);

        this.views.imv_icon.setWidth("100%")
            .setHeight(window.innerHeight * 0.2)
            .setScaleType(senjs.constant.ImageScale.AUTO);

        this.views.lb_name
            .setWidth("100%")
            .setTextSize("1.2em")
            .setTop("0.8em");

        this.views.lb_price
            .setWidth("100%")
            .setTextSize("1em")
            .setTop("0.6em");

        this.setPadding("0.4em");

        this.views.panel_root
            .addView(this.views.imv_icon)
            .addView(this.views.lb_name)
            .addView(this.views.lb_price);

        this.addView(this.views.panel_root);
        this.views.panel_root.setBackground("#fff");
    }

    /**
     * 
     * @param {ProductModel} productItem 
     */
    setDataItem(productItem) {
        this.data.productItem = productItem;
        this.views.imv_icon.setImage(productItem.icon);
        this.views.lb_name.setText(productItem.name);
        this.views.lb_price.setText(productItem.price + "/" + productItem.unit);
        return this;
    }
}