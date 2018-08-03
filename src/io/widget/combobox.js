import { LinearLayout } from '../layout/linear-layout.js'
import { BaseTextView } from './base-text-view.js';
import { TextView } from './text-view.js';
import { IconView } from './icon-view.js';
import { ListView } from './list-view.js';
import { FrameLayout } from '../layout/frame-layout.js';
import { app_constant } from '../../res/constant.js';
import { app_theme, material_colors } from '../../res/theme.js';
import { StickyLayout } from '../layout/sticky-layout.js';
import { List } from '../../util/list-util.js';
import { BaseAdapter } from '../../adapter/base-adapter.js';

export class Combobox extends LinearLayout {
    constructor() {
        super();
        this.setWidth("max-content");
        this._view = {};
        this._meta = {
            pickerData: new List(),
            adapter_view: null,
            isShowingBox: false,
            selected_index: -1
        }
        this._listener = {
            onClicked: null,
            onSelected: null
        };
        this._view.label = new FrameLayout();
        this._view.icon_dropdown = new IconView("arrow_drop_down")
            .setIconColor(app_theme.combobox.status_default.icon);
        this._view.label.setGravity(app_constant.Gravity.CENTER);
        this.addView(this._view.label);
        this.addView(this._view.icon_dropdown);
        this.setPaddingLeft(5)
            .setPaddingTop(3)
            .setPaddingBottom(3)
            .setBorder(1, "#ddd").setRadius(4);

        var default_label = new TextView();
        default_label.setText("...");
        this._view.label.addView(default_label);

        super.setOnClick(() => {
            if (this._view.onClicked) {
                this._view.onClicked(this);
            }
            this._meta.isShowingBox = !this._meta.isShowingBox;
            if (this._meta.isShowingBox) {
                this.showSelectBox();
            } else {
                this.hideSelectBox();
            }
        })
    }

    setOnClick(cb) {
        this._listener.onClicked = cb;
        return this;
    }
    
    /**
     *  set list data
     * @param {Array} list
     */
    setPickerData(list) {
        this._meta.pickerData = new List(list);
        return this;
    }

    showSelectBox() {
        if (this._meta.adapter_view == null) {
            var error = new Error();
            error.message = "Adapter view is not valid, please call setView before";
            throw error;
        }
        var adapter = new BaseAdapter(this._meta.pickerData);
        var stickyList = new StickyLayout(this)
            .setShadow("rgba(0,0,0,0.2)", 0, 0, 4)
            .setMaxHeight("60%")
            .setScrollType(app_constant.ScrollType.VERTICAL)
            .setMinWidth(100);

        var listView = new ListView();
        adapter.setView(this._meta.adapter_view);
        listView.setAdapter(adapter);
        listView.setWidth("100%");
        stickyList.addView(listView);

        listView.setOnItemClicked((view, dataItem, position) => {
        this._meta.selected_index = position;
        stickyList.destroyWithCustomAnimation("");
            this._view.label.removeAllView();
            view.moveTo(this._view.label);
            if (this._listener.onSelected) {
                this._listener.onSelected(view, dataItem, position);
            }
        })

        stickyList.events.override.onDestroy(() => {
            this._meta.isShowingBox = false;
        });
    }

    hideSelectBox() {

    }

    /**
     * Set picker view item
     * @param {View} view 
     */
    setView(view) {
        this._meta.adapter_view = view;
        return this;
    }

    /**
     * Triggered when user select a item
     * @callback onSelected 
     * @param {View} view 
     * @param {*} selectedItem
     * @param {number} position
     */

    /**
     * Triggered when user select a item
     * @param {onSelected} cb 
     */
    setOnSelected(cb) {
        this._listener.onSelected = cb;
        return this;
    }

    /**
     * Set the direction of text
     * @param {int} gravity 
     */
    setTextGravity(gravity) {
        this._view.label.setTextGravity(gravity);
        return this;
    }

    /**
     * set current index selected
     * @param {number} index 
     */
    setSelectedIndex(index) {
        
        if (this._meta.pickerData.size() - 1 < index) {
            throw new Error("Index must lower data size");
        }
        this._meta.selected_index = index;
        this._view.label.removeAllView();
        this._view.label.addView(this._meta.adapter_view(this._meta.pickerData.get(index), index, null));
        return this;
    }

    getSelectedIndex(){
        return this._meta.selected_index;
    }

}