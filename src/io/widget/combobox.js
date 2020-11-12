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
import { senjs } from '../../index.js';
import { BaseDialog } from '../dialog/base-dialog.js';

export class Combobox extends LinearLayout {

    /**
    * @typedef {Object} PickerBoxType
    * @property {number} DROP_DOWN = 1 
    * @property {number} DIALOG = 2
    */

    /**
     * Callback when user select a item
     * @callback onSelected 
     * @param {View} view 
     * @param {*} selectedItem
     * @param {number} position
     */

    /**
     * @returns {PickerBoxType}
     */
    static get PICKER_BOX_TYPE() {
        return {
            DROP_DOWN: 1,
            DIALOG: 2
        }
    }

    constructor() {
        super();
    }

    onInit() {
        super.onInit();
        this.setWidth("max-content");
        this._view = {};
        this._meta = {
            pickerData: new List(),
            adapter_view: null,
            isShowingBox: false,
            selected_index: -1,
            picker_box_type: 2,
            default_text: "...",
            default_view: null
        }
        this._listener = {
            onClicked: null,
            onSelected: null
        };
        this.setGravity(app_constant.Gravity.CENTER);
        this._view.label = new FrameLayout().setWidth("100%");
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
        default_label.setText(this._meta.default_text);
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

    setList(list) {
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

        var stickyList;

        switch (this._meta.picker_box_type) {
            case Combobox.PICKER_BOX_TYPE.DROP_DOWN:
                stickyList = new StickyLayout(this)
                    .setAnimation('combobox-dropdown-open')
                    .setShadow("rgba(0,0,0,0.2)", 0, 0, 4)
                    .setMaxHeight(this._senjs.app.info.display.SCREEN_HEIGHT - (this.getRelativeTop() + this.getHeight() + 10))
                    .setScrollType(app_constant.ScrollType.VERTICAL)
                    .setMinWidth(100);
                break;
            case Combobox.PICKER_BOX_TYPE.DIALOG:
                stickyList = new BaseDialog()
                    .setMinWidth(window.innerWidth < 400 ? window.innerWidth * 0.9 : window.innerWidth * 0.4)
                    .setMaxWidth("90%")
                stickyList.show();
                break;
        }

        var listView = new ListView();
        adapter.setView(this._meta.adapter_view);
        listView.setAdapter(adapter);
        listView.setWidth("100%");
        stickyList.addView(listView);
        console.log(this._meta.pickerData)
        listView.setOnItemClicked((view, dataItem, position) => {
            this._meta.selected_index = position;
            this._view.label.removeAllView();
            view.moveTo(this._view.label);
            stickyList.destroy();
            if (this._listener.onSelected) {
                this.postDelay(() => {
                    this._listener.onSelected(view, dataItem, position);
                }, 100);
            }
        })

        stickyList.events.override.onDestroy(() => {
            this._meta.isShowingBox = false;
        });
        listView.setHeightSameContent(true);
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
     *  when user select a item
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
        } else if (index == -1) {
            this._meta.selected_index = index;
            this._view.label.removeAllView();
            return this;
        }
        this._meta.selected_index = index;
        this._view.label.removeAllView();
        this._view.label.addView(this._meta.adapter_view(this._meta.pickerData.get(index), index, null));
        return this;
    }

    getSelectedIndex() {
        return this._meta.selected_index;
    }

    getSelectedItem() {
        return this._meta.pickerData.get(this._meta.selected_index);
    }

    setDefaultText(text) {
        this._meta.default_text = text;
        if (this._meta.selected_index == -1) {
            this._view.label.getViewAt(0).setText(text);
        }
        return this;
    }

    setDefaultView(view) {
        this._meta.default_view = view;
        if (this._meta.selected_index == -1) {
            this._view.label
                .removeAllView()
                .addView(view);
            console.log(view);
        }
        return this;
    }

    /**
     * 
     * @param {number} type 
     *  DROP_DOWN = 1,
     *  DIALOG = 2,
     *  call static Combobox.PICKER_BOX_TYPE to get more
     */
    setPickerType(type) {
        this._meta.picker_box_type = type;
        return this;
    }
}