import { senjs } from "../../src/index.js";
import { TextView } from "../custom-widgets/text-view.js";
import { OrderDetailModel } from "../models/order-detail-model.js";
import { ViewOrderDetailItem } from "./view-order-detai-item.js";
import { TableOrderModel } from "../models/table-order-model.js";
import { OrderModel } from "../models/order-model.js";
import { OrderTempModel } from "../models/order-temp-model.js";
import { ViewOrderDetailMinItem } from "./view-order-detai-min-item.js";

export class ViewOrderInfo extends senjs.layout.FrameLayout {
    constructor() {
        super('100%');
        this.initViews();
    }

    initViews() {
        this.views = {
            root: new senjs.layout.FrameLayout("73%")
                .setFloat("right"),
            lb_table: new TextView(),
            lb_date: new TextView(),
            lsv_order_detail: new senjs.layout.LinearLayout()
                .setOrientation(senjs.constant.Orientation.VERTICAL)
        }

        this.adapter_order_detail = new senjs.adapter.BaseAdapter()
            .setView(this.onRenderOrderDetailItem.bind(this));

        this.adapter_order_detail._meta.isFixedSize = true;

        this.views.lb_date.setWidth("100%")
            .setPaddingTop("0.5em")
            .setPaddingBottom("0.5em");

        this.views.lsv_order_detail
            .setWidth("100%");

        this.views.lb_table.setWidth("25%")
            .toLeftParent()
            .toTopParent()
            .setBackground("#fff")
            .setTextColor("#000")
            .bold()
            .setTextAlign("right")
            .setTextSize("2.2em")
            .setRadius(10)
            .setFloat("left")
            .setPaddingLeft('0.5em')
            .setPaddingRight("0.6em")
            .ellipsis()
            .setTextColor(senjs.res.material_colors.Amber.g100)
            .setBackground('transparent');

        this.views.root
            .setRadius(10)
            .setPadding("0.5em")
            .setBackground(senjs.res.material_colors.Grey.g50);

        this.setBackground("transparent");


        this.views.root
            .addView(this.views.lb_date)
            .addView(this.views.lsv_order_detail);

        this
            .addView(this.views.lb_table)
            .addView(this.views.root);
    }


    /**
     * 
     * @param {OrderDetailModel} orderDetail 
     * @param {number} position 
     * @param {ViewOrderDetailItem} convertView 
     */
    onRenderOrderDetailItem(orderDetail, position, convertView) {
        if (convertView == null) {
            convertView = new ViewOrderDetailMinItem();
        }
        convertView.setDataItem(orderDetail);
        return convertView;
    }

    /**
     * 
     * @param {TableOrderModel} tableOrder 
     * @param {*} position 
     */
    setDataItem(tableOrder, position) {
        this._tableOrder = tableOrder;
        this._position = position;
        this.views.lb_date.setText(tableOrder.order.createdAt);
        this.views.lsv_order_detail.removeAllView();
        tableOrder.order.orderDetails.forEach((item, index) => {
            this.views.lsv_order_detail.addView(this.onRenderOrderDetailItem(item, index, null));
        })

        this.views.lb_table.setText(tableOrder.tables.reduce((merger, currentItem) => {
            return merger + "," + currentItem.tableNo;
        }, ""));
        if (this.views.lb_table.getText().length > 0) {
            this.views.lb_table.setText(
                this.views.lb_table.getText().substr(1));
        }
        return this;
    }

}