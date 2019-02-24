import { senjs } from "../../src/index.js";
import { DbUtil } from "../db-utils/database.js";
import { ViewProductSaleItem } from "../adapter-views/view-sale-product-item.js";
import { my_context } from "../main-app.js";
import { OrderDetailModel } from "../models/order-detail-model.js";
import { ViewOrderDetailItem } from "../adapter-views/view-order-detai-item.js";
import { SoftKeyboard } from "../custom-views/soft-keyboard.js";
import { TextView } from "../custom-widgets/text-view.js";
import { TablePickerDialog } from "../dialog/dialog-table-picker.js";
import { ProductModel } from "../models/product-model.js";
import { TableOrderView } from "../custom-views/table-order.js";
import { OrderTempModel } from "../models/order-temp-model.js";
import { IconView } from "../../src/io/widget/icon-view.js";
import { TableOrderModel } from "../models/table-order-model.js";
import { TableModel } from "../models/table-model.js";


export class SaleActivity extends senjs.layout.FrameLayout {
    constructor() {
        super("100%", "100%");
        this.setBackground(senjs.res.material_colors.Grey.g100);
        this.dbUtil = new DbUtil();
        this.dbUtil.setOnSuccess(this.onRequestSuccess.bind(this));
        this.dbUtil.setOnFailed(this.onRequestFailed.bind(this));
        
    }

    onCreated() {
        if (senjs.util.RouterUtil.getCurrentParameter()) {
            senjs.util
                .RouterUtil
                .updatePath("/activity/sale?" + senjs.util.RouterUtil.parameterJsonToString(senjs.util.RouterUtil.getCurrentParameter()), "Sale");

        } else {
            senjs.util
                .RouterUtil
                .updatePath("/activity/sale", "Sale");
        }
        this.initViews();
        this.initData();
        this.initEvent();
        
    }

    initViews() {
        this.views = {
            panel_left: new senjs.layout.FrameLayout("72.5%"),
            panel_right: new senjs.layout.FrameLayout("25%"),
            lsv_product: new senjs.widget.ListView().setScrollBarHidden(true),
            lsv_order_detail: new senjs.widget.ListView(),
            btn_save_order: new TextView(my_context.strings.save_order),
            btn_pay_order: new TextView(my_context.strings.pay_order),
            btn_cancel_order: new TextView(my_context.strings.cancel_order),
            tab_category: new senjs.widget.TabButton(),
            soft_keyboard: new SoftKeyboard(),
            lb_order_title: new TextView(my_context.strings.order_info),
            lb_time: new TextView("04 Nov 2018 - 12:00"),
            btn_customer: new TextView(my_context.strings.customer),
            btn_print_kitchen: new TextView(my_context.strings.kitchen_printer),
            btn_table: new TextView(my_context.strings.table),
            lb_total: new TextView("0"),
            table_order_view: new TableOrderView(),
            btn_order_temp: new IconView("shopping_cart")
        }

        this.views.panel_left
            .toLeftParent()
            .toTopParent()
            .toBottomParent()

        this.views.soft_keyboard
            .setBackground("#fff")
            .setLeft("2%")
            .setTop("3em")
            .setWidth("31%")
            .setShadow("rgba(0,0,0,0.2)", 0, 0, 2);

        this.views.lsv_product
            .toRightOf(this.views.soft_keyboard)
            .toAboveOf(this.views.tab_category)
            .toRightParent()
            .toTopParent()
            .setPaddingTop("2.7em")
            .setLeft(10)
            .setBottom("-1em")
            .setPaddingBottom("1em");

        this.views.panel_right
            .setPadding('0.5em')
            .setBackground("#fff")
            .setShadow("rgba(0,0,0,0.1)", 0, 0, 2)
            .toRightParent()
            .toTopParent()
            .toBottomParent()
            .setTop("3em")
            .setRight("2%")
            .setBottom("5%");

        this.views.lb_order_title
            .setWidth("100%")
            .setTextSize(senjs.res.dimen.font.extreme)
            .setTextAlign("center")
            .setTop("0.5em").setBottom("0.5em");

        this.views.lb_time.setWidth("100%").setTop("0.5em").setBottom("0.5em");

        this.views.btn_customer.setWidth("49%").setPadding("1em").setFloat("left").setTextAlign("center")
            .setBackground(senjs.res.material_colors.Grey.g50)
            .setBorder(1, senjs.res.material_colors.Grey.g100);

        this.views.btn_print_kitchen.setWidth("49%").setLeft("2%").setPadding("1em").setFloat("left").setTextAlign("center")
            .setBackground(senjs.res.material_colors.Grey.g50)
            .setBorder(1, senjs.res.material_colors.Grey.g100);

        this.views.btn_table.setWidth("100%").setPadding("1em").setTop("0.5em").setFloat("left").setTextAlign("center")
            .setBackground(senjs.res.material_colors.Grey.g50)
            .setBorder(1, senjs.res.material_colors.Grey.g100);

        this.views.lb_total
            .setTextSize(senjs.res.dimen.font.extreme)
            .setTextAlign("right")
            .setPaddingTop("0.8em")
            .setPaddingBottom("0.8em")
            .setBorderTop(1, senjs.res.material_colors.Grey.g100)
            .setTop("0.5em").setBottom("0.5em");

        this.views.lb_time.setWidth("100%").setTop("0.5em").setBottom("0.5em");

        this.views.btn_order_temp.toTopParent().toRightParent()
            .setTop('2em')
            .setPadding("0.7em")
            .setPaddingTop("0.8em")
            .setPaddingBottom("0.8em")
            .setBackground(senjs.res.material_colors.Light_Blue.g600)
            .setIconColor("#fff")
            .setIconSize(senjs.res.dimen.icon.big)
            .setShadow("rgba(0,0,0,0.3)", 0, 0, 4);

        this.views.btn_pay_order
            .setWidth("100%")
            .setTextAlign("center")
            .setTextSize(senjs.res.dimen.font.larger)
            .toBottomParent()
            .toLeftParent()
            .setPadding("1em")
            .setBackground(senjs.res.material_colors.Green.g500)
            .setBorderBottom(1, '#fff')
            .setTextColor("#fff");


        this.views.btn_save_order
            .setWidth("50%")
            .setTextAlign("center")
            .setTextSize(senjs.res.dimen.font.larger)
            .toBottomParent()
            .toLeftParent()
            .setPadding("1em")
            .setBackground(senjs.res.material_colors.Blue.g500)
            .setBorderRight(1, '#fff')
            .setTextColor("#fff");

        this.views.btn_cancel_order
            .setWidth("50%")
            .setTextAlign("center")
            .setTextSize(senjs.res.dimen.font.larger)
            .toBottomParent()
            .toRightParent()
            .setPadding("1em")
            .setBackground(senjs.res.material_colors.Red.g500)
            .setTextColor("#fff");

        this.views.tab_category
            .setBackground("#fff")
            .setShadow("rgba(0,0,0,0.1)", 0, 0, 2)
            .toBottomParent()
            .toRightParent()
            .setHeight("4em")
            .setBottom("5%")
            .setRight("0.2em")
            .setCursorColor(senjs.res.material_colors.Green.g500)
            .setCursorHeight('5%')
            .setTextColor(senjs.res.material_colors.Green.g800, senjs.res.material_colors.Grey.g600)
            .setLeft("15.5%");

        this.views.panel_left
            .addView(this.views.soft_keyboard)
            .addView(this.views.lsv_product)
            .addView(this.views.tab_category);

        this.views.panel_right
            .addView(this.views.lb_order_title)
            .addView(this.views.lb_time)
            .addView(this.views.btn_customer)
            .addView(this.views.btn_print_kitchen)
            .addView(this.views.btn_table)
            .addView(this.views.btn_pay_order)
            .addView(this.views.btn_save_order)
            .addView(this.views.btn_cancel_order)
            .addView(this.views.lb_total)
            .addView(this.views.lsv_order_detail);

        this.views.btn_pay_order.toAboveOf(this.views.btn_cancel_order);

        this.views.lb_total
            .toRightParent()
            .toLeftParent()
            .setLeft("0.5em")
            .setRight("0.5em")
            .toAboveOf(this.views.btn_pay_order);

        this.views.lsv_order_detail
            .toTopParent()
            .toLeftParent()
            .toRightParent()
            .setBottom(-2)
            .setTop(10)
            .toBelowOf(this.views.btn_table)
            .toAboveOf(this.views.lb_total);


        this.addView(this.views.panel_left)
            .addView(this.views.panel_right)
            .addView(this.views.btn_order_temp)
            .addView(this.views.table_order_view);
    }

    initData() {
        this.data = {
            products: new senjs.util.List(),
            categories: new senjs.util.List(),
            orderTemps: new senjs.util.List(),
            currentTempOrder: new OrderTempModel()
        }
        this.adapters = {
            adapter_category: new senjs.adapter.BaseAdapter(),
            adapter_product: new senjs.adapter.BaseAdapterV2()
                .setColumn(4)
                .setView(this.onRenderProductItem.bind(this)),
            adapter_order_detail: new senjs.adapter.BaseAdapterV2(this.data.currentTempOrder.orderDetails)
                .setView(this.onRenderOrderDetailView.bind(this))
        }
        this.views.lsv_product.setAdapter(this.adapters.adapter_product);
        this.views.lsv_order_detail.setAdapter(this.adapters.adapter_order_detail);

        this.dbUtil.allCategories();
        this.dbUtil.allProducts();
        this.dbUtil.allOrderTemp();
    }

    initEvent() {
        this.views.btn_table.setOnClick(this.onClicked.bind(this));
        this.views.btn_save_order.setOnClick(this.onClicked.bind(this));
        this.views.btn_pay_order.setOnClick(this.onClicked.bind(this));
        this.views.btn_cancel_order.setOnClick(this.onClicked.bind(this));
        this.views.btn_order_temp.setOnClick(this.onClicked.bind(this));
        this.views.lsv_product.setOnItemClicked(this.onProductItemClicked.bind(this));
        this.views.lsv_order_detail.setOnItemClicked(this.onOrderDetailItemClicked.bind(this));
        this.views.tab_category.setOnTabChanged((view, tabIndex) => {
            if (tabIndex == 0) {
                this.adapters.adapter_product.setList(this.data.products);
            } else {
                this.adapters.adapter_product.setList(this.data.products.filter(item => item.categoryId == this.data.categories.get(tabIndex - 1).id));
            }
        });

        var waiter_filter;
        this.views.soft_keyboard.setOnTextChanged(text => {
            if (waiter_filter != null) {
                waiter_filter.remove();
            }
            waiter_filter = new senjs.Waiter(() => {
                if (text.length == 0) {
                    if (this.views.tab_category.focusingIndex == 0) {
                        this.adapters.adapter_product.setList(this.data.products);
                    } else {
                        this.adapters.adapter_product.setList(this.data.products.filter(item => item.categoryId == this.data.categories.get(this.views.tab_category.focusingIndex - 1).id));
                    }
                } else {
                    this.adapters.adapter_product.setList(this.data.products.filter(item => {
                        return item.name.toLowerCase().indexOf(text) > -1 || item.code.toLowerCase().indexOf(text) > -1;
                    }));
                }
                waiter_filter = null;
            }, 200);
        });

        this.views.table_order_view.setOnOrderTableItemClicked((orderTable, position) => {
            this.setOrderTable(orderTable);
            this.views.table_order_view.closePage();
        })
    }

    onRequestSuccess(responseData, request_code) {
        switch (request_code) {
            case DbUtil.request_code.ALL_CATEGORY:
                this.data.categories = new senjs.util.List(responseData);
                // this.adapters.adapter_category.setList(this.data.categories);
                this.views.tab_category.addButton({
                    icon: "",
                    text: "<b>" + my_context.strings.all + "</b>"
                });
                this.data.categories.foreach(item => {
                    this.views.tab_category.addButton({
                        icon: "",
                        text: "<b>" + item.name + "</b>"
                    });
                });
                break;
            case DbUtil.request_code.ALL_PRODUCT:
                console.log(this.data.products);
                this.data.products = new senjs.util.List(responseData);
                this.adapters.adapter_product.setList(this.data.products);
                break;
            case DbUtil.request_code.NEW_ORDER_TEMP:
                this.data.orderTemps.add(responseData);
                var tableOrder = new TableOrderModel();
                tableOrder.tables = this.data.currentTempOrder.tables;
                tableOrder.tables.forEach(item => {
                    item.status = TableModel.STATUS.BOOKED;
                });
                tableOrder.order = this.data.currentTempOrder;
                this.views.table_order_view.addTableOrder(tableOrder);
                this.refreshOrder();
                break;
            case DbUtil.request_code.UPDATE_ORDER_TEMP:
                var tableOrder = new TableOrderModel();
                tableOrder.tables = this.data.currentTempOrder.tables;
                tableOrder.tables.forEach(item => {
                    item.status = TableModel.STATUS.BOOKED;
                });
                tableOrder.order = this.data.currentTempOrder;
                this.views.table_order_view.updateTableOrder(tableOrder);
                this.refreshOrder();
                break;
            case DbUtil.request_code.ALL_ORDER_TEMP:
                this.data.orderTemps = new senjs.util.List(responseData);
                var tableList = this.data.orderTemps.map(orderTemp => {
                    var tableOrder = new TableOrderModel();
                    tableOrder.tables = orderTemp.tables;
                    tableOrder.order = orderTemp;
                    return tableOrder;
                });
                this.views.table_order_view.setOrderTableList(tableList);
                break;
        }
    }

    onRequestFailed(responseData, request_code) {

    }

    onClicked(view) {
        switch (view) {
            case this.views.btn_table:
                new TablePickerDialog()
                    .setOnTablePicked(this.onTablePicked.bind(this))
                    .show();
                break;
            case this.views.btn_save_order:
                console.log(this.data.currentTempOrder);
                if (this.data.currentTempOrder.isNewModel) {
                    this.dbUtil.newOrderTemp(this.data.currentTempOrder);
                } else {
                    this.dbUtil.updateOrderTemp(this.data.currentTempOrder);
                }
                break;
            case this.views.btn_pay_order:
                break;
            case this.views.btn_cancel_order:
                this.data.currentTempOrder = new OrderTempModel();
                this.adapters.adapter_order_detail.setList(this.data.currentTempOrder.orderDetails);
                break;
            case this.views.btn_order_temp:
                this.views.table_order_view.openPage();
                break;
        }
    }

    onRenderProductItem(productItem, position, convertView) {
        if (convertView == null) {
            convertView = new ViewProductSaleItem();
        }
        convertView.setDataItem(productItem, position);
        return convertView;
    }

    onRenderOrderDetailView(orderItem, position, convertView) {
        if (convertView == null) {
            convertView = new ViewOrderDetailItem();
        }
        convertView.setDataItem(orderItem, position);
        return convertView;
    }

    /**
     * 
     * @param {ViewProductSaleItem} view 
     * @param {ProductModel} productItem 
     * @param {number} position 
     */
    onProductItemClicked(view, productItem, position) {
        if (this.data.currentTempOrder == null) {
            this.data.currentTempOrder = new OrderTempModel();
            this.adapters.adapter_order_detail.setList(this.data.currentTempOrder.orderDetails)
        }
        var orderDetail = this.adapters.adapter_order_detail.getList().single("productId", productItem.id);
        if (orderDetail != null) {
            orderDetail.quantity++;
            // this.adapters.adapter_order_detail.notifyDataSetChangedAt(
            //     this.adapters.adapter_order_detail.getList().indexOf(orderDetail));
        this.adapters.adapter_order_detail.notifyDataSetChanged();

            return;
        }
        orderDetail = new OrderDetailModel();
        orderDetail.product = productItem;
        orderDetail.quantity++;
        this.adapters.adapter_order_detail.getList().add(orderDetail);
        this.adapters.adapter_order_detail.notifyDataSetChanged();
        // this.adapters.adapter_order_detail.addItem(orderDetail);
        console.log(this.adapters.adapter_order_detail);
    }

    /**
     * 
     * @param {ViewOrderDetailItem} view 
     * @param {OrderDetailModel} orderDetail 
     * @param {numner} position 
     */
    onOrderDetailItemClicked(view, orderDetail, position) {
        if (orderDetail.quantity > 1) {
            orderDetail.quantity--;
            // this.adapters.adapter_order_detail.notifyDataSetChangedAt(position);
            this.adapters.adapter_order_detail.notifyDataSetChanged();
        } else {
            this.adapters.adapter_order_detail.getList().removeAt(position);
            this.adapters.adapter_order_detail.notifyDataSetChanged();
        }
    }

    onTablePicked(tableModels) {
        if (tableModels.size() == 0) {
            this.data.currentTempOrder.tables = [];
            this.views.btn_table.setText(my_context.strings.table);
            return;
        }
        var str_table = tableModels.reduce((result, current) => {
            return result.length > 0 ? (result + ", " + current.tableNo) : (result + current.tableNo);
        }, "");
        this.data.currentTempOrder.tables = tableModels;
        this.views.btn_table.setText(my_context.strings.table + ": " + str_table);
    }

    refreshOrder() {
        this.data.currentTempOrder = new OrderTempModel();
        this.adapters.adapter_order_detail.setList(this.data.currentTempOrder.orderDetails);
        this.views.btn_table.setText(my_context.strings.table);
        return this;
    }

    setOrderTable(orderTable) {
        this.data.currentTempOrder = orderTable.order;
        var str_table = orderTable.tables.reduce((result, current) => {
            return result.length > 0 ? (result + ", " + current.tableNo) : (result + current.tableNo);
        }, "");
            this.views.btn_table.setText(my_context.strings.table + ": " + str_table);
        this.adapters.adapter_order_detail.setList(orderTable.order.orderDetails);
        return this;
    }

}