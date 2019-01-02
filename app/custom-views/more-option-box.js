import { senjs } from "../../src/index.js";
import { TextView } from "../../src/io/widget/text-view.js";

/**
      * @callback OptionSelected
      * @param {any} selectedItem
      * @param {number} position     
   */

export class MoreOptionBox extends senjs.layout.StickyLayout {
    constructor(view) {
        super(view);
        this._data = [];
        this._selected_listener = null;
        this.setMinWidth(120)
        var lsv_option = new senjs.widget.ListView()
            .setWidth("100%");

        this.adapter_option = new senjs.adapter.BaseAdapter([])
            .setView((dataItem, position, convertView) => {
                convertView = new TextView(dataItem)
                    .setWidth("100%")
                    .setPadding("0.5em");
                return convertView;
            });
        this.setRadius(4).setShadow("rgba(0,0,0,0.1)", 0, 0, 4);
        lsv_option.setHeightSameContent(true);
        lsv_option.setAdapter(this.adapter_option);
        lsv_option.setOnItemClicked((view, dataItem, position) => {
            if (this._selected_listener) {
                this._selected_listener(dataItem, position);
            }
            this.destroyWithAnimate();
        });

        this.addView(lsv_option);
    }

    /**
     * 
     * @param {[string]} arrayString 
     */
    setArrayOption(arrayString) {
        this._data = arrayString;
        this.adapter_option.setList(this._data);
        return this;
    }

    /**
     * 
     * @param {OptionSelected} listener 
     * @return {MoreOptionBox}
     */
    setOnSelected(listener) {
        this._selected_listener = listener;
        return this;
    }
}