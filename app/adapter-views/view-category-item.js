import { senjs } from "../../src/index.js";
import { TextView } from "../../src/io/widget/text-view.js";
import { MoreOptionBox } from "../custom-views/more-option-box.js";
import { my_context } from "../main-app.js";
import { CategoryModel } from "../models/category-model.js";


export class ViewCategoryItem extends senjs.layout.FrameLayout {
    constructor() {
        super();
        this.setWidth("100%");
        this._dataItem = null;
        this._position = -1;
        this._listener = {
            onOptionSelected: null
        }
        this.views = {
            lb_name: new TextView().setWidth("80%").ellipsis(),
            btn_option: new senjs.widget.IconView("more_horiz")
                .setIconColor(senjs.res.dimen.font.small)
                .setIconColor("rgba(0,0,0,0.6)")
        }
        this.setPadding("1em");

        this.views.btn_option
            .toRightParent().toTopParent()
            .setRight("0.2em").setTop("0.2em")
            .setPadding("0.5em")

        this
            .addView(this.views.lb_name)
            .addView(this.views.btn_option);

        this.views.btn_option.setOnClick(view => {
            var optionBox = new MoreOptionBox(view);
            optionBox.setArrayOption(my_context.arrays.category_more_option);
            optionBox.setOnSelected((dataItem, option_position) => {
                if (this._listener.onOptionSelected) {
                    this._listener.onOptionSelected(this, this._dataItem, this._position, option_position);
                }
            })
        })
    }

    onCreated(view) {
        super.onCreated(view);
    }

    /**
     * 
     * @param {CategoryModel} categoryItem 
     * @param {position} position 
     */
    setDataItem(categoryItem, position) {
        this._position = position;
        this._dataItem = categoryItem;
        this.views.lb_name.setText(categoryItem.name);
        if (categoryItem.id == -1 || categoryItem.isNewModel) {
            this.views.btn_option.setVisibility(senjs.constant.Visibility.GONE);
        } else {
            this.views.btn_option.setVisibility(senjs.constant.Visibility.VISIBLE);
        }
        return this;
    }

    setOnOptionSeleted(listener) {
        this._listener.onOptionSelected = listener;
        return this;
    }
}