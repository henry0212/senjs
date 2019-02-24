import { senjs } from "../../src/index.js";
import { TableOrderModel } from "../models/table-order-model.js";
import { ViewOrderInfo } from "../adapter-views/view-order-info.js";
import { DbUtil } from "../db-utils/database.js";
import { List } from "../../src/util/list-util.js";
import { ViewTableItem } from "../adapter-views/view-table-item.js";
import { ViewTablesUtingItem } from "../adapter-views/view-tables-using-item.js";

export class TableOrderView extends senjs.layout.DrawerLayout {
    constructor() {
        super("37%", "100%");
        this.setDirection(senjs.constant.Direction.RIGHT);
        this.setBackground('linear-gradient(-90deg, #000000, transparent)');
        this.initViews();
        this.initData();
        this.setDimEnable(true);

    }

    onCreated(view) {
        super.onCreated(view);
        var delay = null;
        senjs.app.service.register.onKeyUp((service, e) => {
            if (delay) {
                return;
            }
            if (e.keyCode == 37) {
                this.openPage();
            } else if (e.keyCode == 39) {
                this.closePage();
            } else if (e.keyCode == 16 || e.keyCode == 192) {
                if (this.isOpening()) {
                    this.closePage();
                } else {
                    this.openPage();
                }
            }
            delay = new senjs.Waiter(() => {
                delay = null;
            }, 300);
        })
    }

    initViews() {
        this.views = {
            lsv_table: new senjs.widget.ListView(),
            lsv_order: new senjs.widget.ListView().setScrollBarHidden(true)
        }

        this.views.lsv_order
            .toRightParent()
            .toTopParent()
            .toBottomParent()
            .setWidth("98%")
            .setRight("2%")
            .setPaddingTop("1em")
            .setPaddingBottom("1em")

        this.views.lsv_table
            .toLeftParent()
            .toTopParent()
            .toBottomParent()
            .setTop("15%")
            .setBottom("15%")
            .setWidth("30%");

        this.addView(this.views.lsv_order)
        // .addView(this.views.lsv_table);

    }

    async initData() {
        this.data = {
            table_orders: new senjs.util.List()
        }
        this.adapter = {
            adapter_order: new senjs.adapter.BaseAdapterV2(this.data.tables_booked)
                .setView(this.onRenderOrderItem.bind(this)),
            adapter_table: new senjs.adapter.BaseAdapter(this.data.tables_booked)
                .setView(this.onRenderTableItem.bind(this)),
        }
        this.adapter.adapter_order.setList(this.data.table_orders);
        this.views.lsv_order.setAdapter(this.adapter.adapter_order);
        this.views.lsv_table.setAdapter(this.adapter.adapter_table);
    }

    /**
     *f
     * @param {TableOrderModel} tableOrder 
     * @param {*} position 
     * @param {ViewOrderInfo} convertView 
     */
    onRenderOrderItem(tableOrder, position, convertView) {
        if (convertView == null) {
            convertView = new ViewOrderInfo();
            convertView
                .setTop(40);
            // convertView.views.lb_table.setTransitionAll(".05")
            // document.body.clientTop
            this.views.lsv_order.events.override.onScrolled((view, args) => {

                if (convertView.getParentView() != null && convertView.getParentView().offSetTop() < args.scrollY) {
                    var scroll = args.scrollY - convertView.getParentView().offSetTop();
                    if (scroll + convertView.views.lb_table._dom.offsetHeight + 40 < convertView.getParentView().getHeight()) {
                        convertView.views.lb_table.setTranslateY(scroll);
                    }
                } else {
                    convertView.views.lb_table.setTranslateY(0);
                }
                // if ()
            })
        }
        convertView.setDataItem(tableOrder);
        return convertView;
    }

    /**
     * 
     * @param {TableOrderModel} tableOrder 
     * @param {*} position 
     * @param {ViewTablesUtingItem} convertView 
     */
    onRenderTableItem(tableOrder, position, convertView) {
        if (convertView == null) {
            convertView = new ViewTablesUtingItem();

        }
        convertView.setDataItem(tableOrder);
        return convertView;
    }

    /**
     * 
     * @param {List} tableOrderList 
     */
    setOrderTableList(tableOrderList) {
        this.adapter.adapter_order.setList(tableOrderList);
        return this;
    }

    /**
     * 
     * @param {TableOrderModel} tableOrderModel 
     */
    addTableOrder(tableOrderModel) {
        // this.data.table_orders.add(tableOrderModel);
        this.adapter.adapter_order.addItem(tableOrderModel);
        // this.adapter.adapter_table.addItem(tableOrderModel);
        return this;
    }

    setOnOrderTableItemClicked(listener) {
        this.views.lsv_order.setOnItemClicked((view, item, position) => {
            listener(item, position);
        });
    }

    updateTableOrder(tableOrder) {
        var index = this.adapter.adapter_order.getList().indexOf(this.adapter.adapter_order.getList().single("id", tableOrder.id));
        if (index > -1) {
            this.adapter.adapter_order.getList().set(index, tableOrder);
            // this.adapter.adapter_order.notifyDataSetChangedAt(index);
            this.adapter.adapter_order.notifyDataSetChanged();
        }
    }

    openPage() {
        return super.openPage();
    }
}