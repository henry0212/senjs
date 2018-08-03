
import { app, dhCts } from "../../core/app-context.js";
import { Checkbox } from "./checkbox.js";
import { app_theme } from "../../res/theme.js";
import { app_constant } from "../../res/constant.js";

const icon_state = {
    uncheck: "radio_button_unchecked",
    checked: "radio_button_checked"
}

export class RadioButton extends Checkbox {
    constructor(groupId) {
        super();
        this._meta.groupId = groupId;
    }

    onClicked() {
        if (!this._meta.isChecked) {
            super.onClicked();
        }
    }

    setGroupId(groupId) {
        this._meta.groupId = groupId;
        return this;
    }

    setChecked(isChecked) {
        if (this.info.state != app_constant.VIEW_STATE.running) {
            this.events.override.onCreated(() => {
                this.setChecked(isChecked);
            })
        } else if (isChecked && this._meta.isChecked) {
            return;
        } else if (isChecked) {
            this._view.icon
                .updateIcon(icon_state.checked)
                .setIconColor(app_theme.radio_button.status_checked.icon);
            this._view.label
                .setFontWeight(app_theme.radio_button.status_checked.fontWeight)
                .setTextColor(app_theme.radio_button.status_checked.text)
            this.setBackground(app_theme.radio_button.status_checked.background);
            var group_radio = dhCts.findView(view => {
                return view && view.info.id != this.info.id && view._meta && view._meta.groupId == this._meta.groupId;
            });
            console.log(group_radio);
            group_radio.foreach(radio => {
                radio.setChecked(false);
            });
        } else {
            this._view.icon
                .updateIcon(icon_state.uncheck)
                .setIconColor(app_theme.radio_button.status_default.icon);
            this._view.label
                .setFontWeight(app_theme.radio_button.status_default.fontWeight)
                .setTextColor(app_theme.radio_button.status_default.text)
            this.setBackground(app_theme.radio_button.status_default.background);
        }
        this._meta.isChecked = isChecked;
        return this;
    }
}

