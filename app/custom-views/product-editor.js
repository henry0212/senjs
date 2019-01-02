import { senjs } from "../../src/index.js";
import { IconView } from "../../src/io/widget/icon-view.js";
import { FilePicker } from "../../src/libs/file-picker.js";
import { TextView } from "../../src/io/widget/text-view.js";
import { my_context } from "../main-app.js";
import { EditText } from "../../src/io/widget/edit-text.js";
import { ProductModel } from "../models/product-model.js";
import { Combobox } from "../custom-widgets/combobox.js";
import { DbUtil } from "../db-utils/database.js";

export class ProductEditor extends senjs.layout.BannerLayout {
    constructor(productItem) {
        super();
        this.toFillParent();

        this._listener = {};

        var imv_icon = new senjs.widget.ImageView()
            .setId("imv_icon");

        this._productModel = productItem;
        this._base64 = "";

        var panel_banner = new senjs.layout.LinearLayout("100%", 300);
        panel_banner.setGravity(senjs.constant.Gravity.CENTER);
        this.setback

        var panel_icon_editor = new senjs.layout.FrameLayout(180, 180)
            .setShadow("rgba(0,0,0,0.2)", 0, 0, 3)
            .setBackground("#fff")
            .setRadius(4);

        var btn_edit_icon = new IconView("camera_alt")

        var lb_toolbar_text = new TextView(productItem ? my_context.strings.edit_product : my_context.strings.new_product);
        lb_toolbar_text
            .setPadding("0.5em")
            .setPaddingTop("0.8em")
            .setPaddingBottom("0.8em");

        btn_edit_icon.toFillParent()
            .setId("btn_edit_icon")
            .setIconSize(50)
            .setId("btn_edit_icon")
            .setCursor("pointer")
            .setIconColor("rgba(0,0,0,0.5");

        imv_icon.toFillParent()
            .setScaleType(senjs.constant.ImageScale.COVER)
            .setBackground("#fff");

        panel_icon_editor
            .addView(imv_icon)
            .addView(btn_edit_icon);
        panel_banner.addView(panel_icon_editor);

        this.setBannerImageBlur(40);


        btn_edit_icon.setOnClick(this.onClicked.bind(this));

        var panel_main_container = new senjs.layout.LinearLayout("100%")
            .setPadding("1em")
            .setOrientation(senjs.constant.Orientation.VERTICAL);

        var lb_name = new TextView(my_context.strings.product_name)
            .setTextSize(senjs.res.dimen.font.small)
            .setTextColor("rgba(0,0,0,0.5)");

        var lb_category = new TextView(my_context.strings.category)
            .setTextSize(senjs.res.dimen.font.small)
            .setTextColor("rgba(0,0,0,0.5)");

        var lb_code = new TextView(my_context.strings.product_code)
            .setStyleLikeOf(lb_name);

        var lb_price = new TextView(my_context.strings.product_price)
            .setStyleLikeOf(lb_name);

        var lb_unit = new TextView(my_context.strings.product_unit)
            .setStyleLikeOf(lb_name);

        var default_view = new TextView(my_context.strings.category)
            .setWidth("100%")
            .setPadding("0.5em");

        var dropdown_category = this._views.dropdown_category = new Combobox()
            .setId("dropdown_category")
            .setWidth("100%")
            .setPadding("0.4em")
            .setBottom("2em")
            .setPickerType(Combobox.PICKER_BOX_TYPE.DROP_DOWN)
            .setDefaultView(default_view)
            .setView((category, position, convertView) => {
                convertView = new TextView(category.name);
                convertView
                    .setWidth("100%")
                    .setPadding("0.5em");
                return convertView;
            });

        var txt_product_name = this._views.txt_product_name = new EditText()
            .setId("txt_product_name")
            .setWidth("100%")
            .setPadding("0.8em")
            .setPaddingLeft(0)
            .setPaddingRight(0)
            .setBottom("2em");

        var txt_product_code = this._views.txt_product_code = new EditText()
            .setId("txt_product_code")
            .setStyleLikeOf(txt_product_name);

        var txt_price = this._views.txt_price = new EditText()
            .setId("txt_product_price")
            .setStyleLikeOf(txt_product_name);

        var txt_unit = this._views.txt_unit = new EditText()
            .setId("txt_product_unit")
            .setStyleLikeOf(txt_product_name);


        var btn_save = new senjs.widget.FloatingButton("save")
            .setId("btn_save")
            .setBackground(senjs.res.material_colors.Blue.g500)
            .setIconColor("#fff")
            .setAbsoluteZIndex(10)
            .toBottomParent().toRightParent().setRight("0.5em").setBottom("0.5em");

        panel_main_container
            .addView(dropdown_category)
            .addView(lb_name)
            .addView(txt_product_name)
            .addView(lb_code)
            .addView(txt_product_code)
            .addView(lb_price)
            .addView(txt_price)
            .addView(lb_unit)
            .addView(txt_unit)

        this.addViewToBanner(panel_banner)
            .addViewToToolbar(lb_toolbar_text)
            .addViewToContent(panel_main_container)
            .addViewToRoot(btn_save);

        if (!this._productModel.isNewModel) {
            imv_icon.setImage(this._productModel.icon);
            txt_product_name.setText(this._productModel.name);
            txt_product_code.setText(this._productModel.code);
            txt_price.setText(this._productModel.price);
            txt_unit.setText(this._productModel.unit);
            btn_edit_icon.setOpacity(0);
            this.setBannerImage(this._productModel.icon);

        }

        btn_save.setOnClick(this.onClicked.bind(this));
        dropdown_category.setOnSelected(this.onDropDownSelected.bind(this));

        DbUtil.getInstance().allCategories()
            .then(categoies => {
                dropdown_category.setPickerData(categoies);
                if (!this._productModel.isNewModel) {
                    var cate = new senjs.util.List(categoies).single("id", this._productModel.categoryId);
                    if (cate) {
                        default_view.setText(cate.name);
                    }
                }
            })
    }

    onDropDownSelected(view, selectedValue, position) {
        this._productModel.categoryId = selectedValue.id;
    }

    async onClicked(view) {
        switch (view.getId()) {
            case "btn_edit_icon":
                try {
                    var file = await FilePicker.onFilePicked({ accept: "images/*", capture: 'camera' });
                    this._base64 = await FilePicker.singleFileToBase64(file);
                    senjs.app.findViewById("imv_icon").setImage(this._base64);
                    senjs.app.findViewById("btn_edit_icon").setOpacity(0);
                    this.setBannerImage(this._base64);
                } catch (error) {
                    console.error(error);
                }
                break;
            case "btn_save":
                if(!this.validate()){
                    return;
                }
                if (this._productModel == undefined) {
                    this._productModel = new ProductModel();
                }
                this._productModel.icon = this._base64.length > 0 ? this._base64 : this._productModel.icon;
                this._productModel.name = senjs.app.findViewById("txt_product_name").getText();
                this._productModel.code = senjs.app.findViewById("txt_product_code").getText();
                this._productModel.price = senjs.app.findViewById("txt_product_price").getText();
                this._productModel.unit = senjs.app.findViewById("txt_product_unit").getText();
                if (this._listener.onSaveClicked) {
                    this._listener.onSaveClicked(this._productModel);
                }
        }
    }

    validate() {
        var isValid = true;
        if(this._views.txt_product_name.getText().length == 0){
            this._views.txt_product_name.setError("adf");
            isValid = false;
        }
        return isValid;
    }


    setOnSaveClicked(listener) {
        this._listener.onSaveClicked = listener;
        return this;
    }
}