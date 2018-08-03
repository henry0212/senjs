import { LinearLayout } from "../layout/linear-layout.js";
import { List } from "../../util/list-util.js";
import { app_constant } from "../../res/constant.js";
import { FrameLayout } from "../layout/frame-layout.js";
import { TextView } from "./text-view.js";
import { IconView } from "./icon-view.js";
import { app_theme } from "../../res/theme.js";
import { View } from "../../core/view.js";

export class TabButton extends FrameLayout {
    constructor() {
        super();
        this._view = {
            cursor: null,
            button_container: null
        }

        this._meta = {
            list_meta: new List(),
            focusingIndex: 0
        }

        this._cache.buttons = new List();

        this._listener = {
            onTabChanged: null
        }

        this._view.button_container = new LinearLayout().setMinWidth("100%").setHeight("100%");
        this._view.button_container.setOrientation(app_constant.Orientation.HORIZONTAL);
        this._view.cursor = new View()
            .setTransition("all",'.2','ease-out')    
            .setHeight(2)
            .toLeftParent()
            .toBottomParent()
            .setBackground(app_theme.tabButton.status_default.cursor)
            .setPosition(app_constant.Position.ABSOLUTE);

        super.addView(this._view.button_container);
        super.addView(this._view.cursor);
    }



    /**
     * Add button to tab
     * @param {*} meta - { icon: "material_icon" , "text":"string" } 
     */
    addButton(meta) {
        this._meta.list_meta.add(meta);
        var panel = new LinearLayout()
            .setOrientation(app_constant.Orientation.HORIZONTAL)
            .setBackground(app_theme.tabButton.status_default.background);

        var label = new TextView()
            .setText(meta.text).setWidth("100%").setHeight("100%")
            .setTextGravity(app_constant.Gravity.CENTER)
            .setTextColor(app_theme.tabButton.status_default.text);

        var icon = new IconView(meta.icon).setHeight("100%");
        panel.setTag(this._meta.list_meta.size() - 1);
        panel.addView(icon)
            .addView(label);
        icon.setAbsoluteZIndex(3);
        this._view.button_container.addView(panel);
        this._cache.buttons.add(panel);

        panel.setOnClick((view) => {
            this._cache.buttons.get(this._meta.focusingIndex).getViewAt(1).setTextColor(app_theme.tabButton.status_default.text);
            this._cache.buttons.get(this._meta.focusingIndex).getViewAt(0).setIconColor(app_theme.tabButton.status_default.icon);
            this._meta.focusingIndex = view.getTag();
              if (this._listener.onTabChanged) {
                this._listener.onTabChanged(this, this._meta.focusingIndex);
            }
            view.setBackground(app_theme.tabButton.status_selecting.background);
            view.getViewAt(1).setTextColor(app_theme.tabButton.status_selecting.text);
            view.getViewAt(0).setIconColor(app_theme.tabButton.status_selecting.icon);
            this._view.cursor.setWidth(view.getWidth()).setLeft(view._dom.offsetLeft);
        });

        this._cache.buttons.foreach(view => {
            view.setMinWidth(`${100 / this._meta.list_meta.size()}%`)
        })

        this._view.cursor.setWidth(`${100 / this._meta.list_meta.size()}%`);
        

        return this;
    }

    /**
     * Trigger when tag change 
     * @callback onTabChanged 
     * @param {TabButton} view
     * @param {number} tabIndex
     */
    /**
     * @param {onTabChanged} cb
     */
    setOnTabChanged(cb) {
        this._listener.onTabChanged = cb;
    }

    /**
     * Get tab button at index
     * @param {number} index 
     */
    getButtonAt(index){
        return this._cache.buttons.get(index);
    }

    addView() {
        throw new Error("Cannot add view to here, use TabButton.addButton() instead");
    }
}