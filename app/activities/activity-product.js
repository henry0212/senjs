import { BaseActivity } from "./base-activity.js";
import { senjs } from "../../src/index.js";
import { Combobox } from "../custom-widgets/combobox.js";
import { TextView } from "../custom-widgets/text-view.js";
import { my_context } from "../main-app.js";
import { EditText } from "../../src/io/widget/edit-text.js";
import { Button } from "../custom-widgets/button.js";
import { ViewCategoryItem } from "../adapter-views/view-category-item.js";
import { ProductEditor } from "../custom-views/product-editor.js";
import { ViewProductItem } from "../adapter-views/view-product-item.js";
import { DbUtil } from "../db-utils/database.js";
import { CategoryModel } from "../models/category-model.js";
import { List } from "../../src/util/list-util.js";
import { ProductModel } from "../models/product-model.js";
import { ViewProductItemAsRow } from "../adapter-views/view-product-item-as-row.js";


export class ProductActivity extends BaseActivity {
    constructor() {
        super();
        senjs.util.RouterUtil.updatePath("/activity/product", "Product Management");
        this._data = {
            categories: new List(),
            products: new List()
        }
        this.dbUtil = DbUtil.newInstance();
        this.dbUtil.setOnSuccess(this.onRequestSuccess.bind(this));
        this.dbUtil.setOnFailed(this.onRequestFailed.bind(this));
     //   this.dbUtil.createSomeProducts();
        this._meta.category_selecting = null;
    }

    onCreated() {
        this.toFillParent();
        this.initView();
        this.initAdapter();
        this.initData();
        this.initEvent();
    }

    initView() {
        this.views = {
            panel_toolbar: new senjs.layout.LinearLayout("100%", "5em")
                .toTopParent()
                .toLeftParent().toBottomParent()
                .setGravity(senjs.constant.Gravity.CENTER),
            panel_category: new senjs.layout.LinearLayout("20%", "50%")
                .setBackground("#fff")
                .setShadow("rgba(0,0,0,0.05)", 0, 0, 3),
            panel_product: new senjs.layout.LinearLayout("60%")
                .setBackground("#fff")
                .setShadow("rgba(0,0,0,0.05)", 0, 0, 3),
            lb_category: new TextView(my_context.strings.category),
            lb_product: new TextView(my_context.strings.product),
            btn_new_category: new senjs.widget.IconView("add"),
            btn_new_product: new senjs.widget.IconView("add"),
            tab_view_type: new senjs.widget.TabButton(),
            lsv_product: new senjs.widget.ListView(),
            lsv_category: new senjs.widget.ListView()
        }

        this.views.panel_category
            .toBelowOf(this.views.panel_toolbar)
            .toLeftParent().setLeft("10%").setTop(10);

        this.views.panel_product
            .toBelowOf(this.views.panel_toolbar)
            .toRightOf(this.views.panel_category)
            .setBottom(20)
            .setTop(10)
            .setLeft(10);

        this.views.lb_category
            .setWidth("100%")
            .setPadding("1em")
            .setBorderBottom(1, "rgba(0,0,0,0.1)");

        this.views.lb_product
            .setStyleLikeOf(this.views.lb_category)
            .setBackground("#fff");

        this.views.btn_new_category
            .toTopParent()
            .setBackground(senjs.res.material_colors.Green.g500)
            .setIconColor("rgba(255,255,255,0.9)")
            .toRightParent()
            .setTop("0.1em")
            .setRight("0.1em")
            .setPadding("0.2em")
            .setPaddingTop("0.15em")
            .setPaddingBottom("0.15em")
            .setIconSize("2em");

        this.views.btn_new_product
            .setStyleLikeOf(this.views.btn_new_category);

        this.views.tab_view_type.addButton({
            icon: "view_module",
            text: ""
        })

        this.views.tab_view_type.addButton({
            icon: "view_list",
            text: ""
        })

        this.views.tab_view_type.setPaddingTop("0.15em")
            .setTop("0.1em")
            .setPadding("0.2em")
            .setPaddingTop("0.15em")
            .setPaddingBottom("0.15em")
            .setHeight("2.5em")
            .setWidth("15%")
            .toTopParent().toLeftOf(this.views.btn_new_product)

        this.views.lsv_category
            .toLeftParent().toRightParent().toBottomParent()
            .toBelowOf(this.views.lb_category).setPaddingTop(5);

        this.views.lsv_product
            .toLeftParent()
            .toRightParent()
            .toBottomParent()
            .toBelowOf(this.views.lb_product)
            .setTop(-10).setPaddingTop(15);


        this.views.panel_category
            .addView(this.views.lb_category)
            .addView(this.views.btn_new_category)
            .addView(this.views.lsv_category);

        this.views.panel_product
            .addView(this.views.lsv_product)
            .addView(this.views.lb_product)
            .addView(this.views.tab_view_type)
            .addView(this.views.btn_new_product);

        this
            .addView(this.views.panel_toolbar)
            .addView(this.views.panel_category)
            .addView(this.views.panel_product);
    }

    initAdapter() {

        this.adapters = {
            adapter_category: new senjs.adapter.BaseAdapterV2([]),
            adapter_product: new senjs.adapter.BaseAdapterV2([])
        }

        this.adapters
            .adapter_category
            .setView((dataItem, position, convertView) => {
                if (convertView == null) {
                    convertView = new ViewCategoryItem();
                    convertView.setOnOptionSeleted(this.onCategoryOptionSelected.bind(this));
                }
                convertView.setDataItem(dataItem, position);
                return convertView;
            });

        this.adapters
            .adapter_product
            .setColumn(4)
            .setView((dataItem, position, convertView) => {
                if (convertView == null) {
                    convertView = this.views.tab_view_type.focusingIndex == 0 ? new ViewProductItem() : new ViewProductItemAsRow();
                }
                convertView.setDataItem(dataItem, position);
                return convertView;
            });

        this.views.lsv_category.setAdapter(this.adapters.adapter_category);
        this.views.lsv_product.setAdapter(this.adapters.adapter_product);

        this.views.tab_view_type.setOnTabChanged((view, index) => {
            this.adapters.adapter_product.setColumn(index == 0 ? 3 : 1).notifyDataSetChanged();
        })
    }

    initEvent() {
        this.views.btn_new_category.setOnClick(this.onClicked.bind(this));
        this.views.btn_new_product.setOnClick(this.onClicked.bind(this));
        this.views.lsv_category.setOnItemClicked(this.onCategoryItemClicked.bind(this));
        this.views.lsv_product.setOnItemClicked(this.onProductItemClicked.bind(this));
    }

    initData() {
        this.dbUtil.allCategories();
        this.dbUtil.allProducts();
    }

    /**
     * Database here - Successfully
     */
    onRequestSuccess(responseData, request_code) {
        switch (request_code) {
            case DbUtil.request_code.ALL_CATEGORY:
                console.log(responseData);
                this._data.categories = new List(responseData).orderByAscending("createdAt");
                var cate_all = new CategoryModel();
                cate_all.name = my_context.strings.all;
                cate_all.id = -1;
                this._meta.category_selecting = cate_all;
                this._data.categories.addAt(cate_all, 0);
                this.adapters.adapter_category.setList(this._data.categories);
                break;
            case DbUtil.request_code.ALL_PRODUCT:
                this._data.products = new List(responseData).orderByAscending("createdAt");
                this.adapters.adapter_product.setList(this._data.products);
                this.views.lb_product.setText(my_context.strings.product + ": <b>" + dataItem.name + "</b>" + " (" + this.adapters.adapter_product.getCount() + ")");
                break;
            case DbUtil.request_code.NEW_CATEGORY:
                this.adapters.adapter_category.addItem(new CategoryModel().fromJSON(responseData));
                if (this.views.category_editor) {
                    this.views.category_editor.dismiss();
                }
                break;
            case DbUtil.request_code.UPDATE_CATEGORY:
                var temp = this.adapters.adapter_category.getList().single("id", responseData.id);
                if (temp != null) {
                    var index = this.adapters.adapter_category.getList().indexOf(temp);
                    if (index > -1)
                        this.adapters.adapter_category.getList().set(index, new CategoryModel().fromJSON(responseData));
                    this.adapters.adapter_category.notifyDataSetChangedAt(index);
                } else {
                    this.adapters.adapter_category.notifyDataSetChanged();
                }
                if (this.views.category_editor) {
                    this.views.category_editor.dismiss();
                }
                break;
            case DbUtil.request_code.NEW_PRODUCT:
                this._data.products.add(new ProductModel().fromJSON(responseData));
                this.updateProductList();
                this.dismissProductEditor();
                break;
            case DbUtil.request_code.UPDATE_PRODUCT:
                this.updateProductList();
                this.dismissProductEditor();
                break;
        }
    }

    /**
  * Database here - Failed
  */
    onRequestFailed(error, request_code) {

    }

    onClicked(view) {
        switch (view) {
            case this.views.btn_new_category:
                this.showCategoryEditor();
                break;
            case this.views.btn_new_product:
                this.showProductEditor();
                break;
        }
    }

    onCategoryItemClicked(view, dataItem, position) {
        this.dismissProductEditor();
        this._meta.category_selecting = dataItem;
        this.updateProductList();
        this.views.lb_product.setText(my_context.strings.product + ": <b>" + dataItem.name + "</b>" + " (" + this.adapters.adapter_product.getCount() + ")");
    }

    onProductItemClicked(view, dataItem, position) {
        this.showProductEditor(dataItem);
    }

    onCategoryOptionSelected(view, categoryItem, position, option_position) {
        switch (option_position) {
            case 0: // edit
                this.showCategoryEditor(categoryItem);
                break;
            case 1: //delete
                break;
        }
    }

    updateProductList() {
        if (this._meta.category_selecting.id == -1) {
            this.adapters.adapter_product.setList(this._data.products);
        } else {
            this.adapters.adapter_product.setList(this._data.products.filter(item => { return item.categoryId == this._meta.category_selecting.id }));
        }
    }

    showCategoryEditor(categoryItem) {
        var frame = this.views.panel_category.showQuicklyLayout()
            .setPadding("0.5em");
        var lb_title = new TextView(categoryItem ? my_context.strings.edit_category : my_context.strings.create_category)
            .setWidth("100%")
            .setPaddingTop("0.5em")
            .setPaddingBottom("1em");

        var txt_category_new = new EditText()
            .setWidth("100%")
            .setPadding("1em")
            .setText(categoryItem ? categoryItem.name : "")
            .setHint(my_context.strings.category_name)

        var btn_save = new Button(my_context.strings.save)
            .setWidth("48%")
            .setFloat("left")
            .setTop("1em");

        var btn_cancel = new Button(my_context.strings.cancel)
            .setWidth("48%")
            .setFloat("right")
            .setTop("1em");

        frame
            .addView(lb_title)
            .addView(txt_category_new)
            .addView(btn_save)
            .addView(btn_cancel);

        btn_cancel.setOnClick(view => {
            frame.dismiss();
        });

        btn_save.setOnClick(view => {
            if (categoryItem == undefined) {
                categoryItem = new CategoryModel();
                categoryItem.name = txt_category_new.getText();
                this.dbUtil.newCategory(categoryItem);
            } else {
                categoryItem.name = txt_category_new.getText();
                categoryItem.modifiedAt = Date.now();
                this.dbUtil.updateCategory(categoryItem);
            }
        });
        frame.events.override.onDestroy(v => {
            this.views.category_editor = null;
        });
        return this.views.category_editor = frame;
    }

    showProductEditor(productItem) {
        productItem = productItem != undefined ? productItem : new ProductModel();
        var view_editor = new ProductEditor(productItem);
        this.views.product_editor_dialog = this.views.panel_product.showQuicklyLayout()
            .toLeftParent()
            .toRightParent()
            .toBottomParent()
            .setLeft("20%")
            .setRight("20%")
            .setShadow("rgba(0,0,0,0.3)", 0, 0, 4)
            .setTop(5).setBottom(5)
            .setOutsideBackground("rgba(0,0,0,0.6)");
        // .setOutsideBackground("rgba(255,255,255,0.8)");


        this.views.product_editor_dialog.addView(view_editor);
        this.views.product_editor_dialog.setAnimation("storyBoard_instance_in");
        this.views.product_editor_dialog.show();
        view_editor.setOnSaveClicked(modifiedItem => {
            if (modifiedItem.isNewModel) {
                this.dbUtil.newProduct(modifiedItem);
            } else {
                console.log(modifiedItem);
                this.dbUtil.updateProduct(modifiedItem);
            }
        });
    }

    dismissProductEditor() {
        if (this.views.product_editor_dialog) {
            this.views.product_editor_dialog.dismiss();
            this.views.product_editor_dialog = null;
        }
        return this;
    }
}