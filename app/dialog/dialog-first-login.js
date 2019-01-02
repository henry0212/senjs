import { senjs } from "../../src/index.js";
import { my_context } from "../main-app.js";
import { Button } from "../custom-widgets/button.js";
import { TextView } from "../custom-widgets/text-view.js";


export class FirstLoginDialog extends senjs.dialog.BaseDialog {
    constructor() {
        super();
        this.listener = {
            onConfirmed: null,
            onCancelled: null
        }

        // this.setWidth("35%");

        this.views = {
            panel_container: new senjs.layout.LinearLayout("100%")
                .setPadding("2em")
                .setOrientation(senjs.constant.Orientation.VERTICAL)
                .setGravity(senjs.constant.Gravity.CENTER),
            lb_message: new TextView(my_context.strings.label_first_login_dialog_message)
                .setTextAlign(senjs.constant.TextAlign.CENTER),
            btn_confirm: new Button(my_context.strings.label_bring_to_create_product).setPadding("0.5em").setTop("1em"),
            btn_cancel: new Button(my_context.strings.label_not_allow_create_product_before).setPadding("0.5em"),
        }

        this.views.panel_container
            .addView(this.views.lb_message)
            .addView(this.views.btn_confirm)
            .addView(this.views.btn_cancel)

        this.views.btn_confirm.setOnClick(this.onClicked.bind(this));
        this.views.btn_cancel.setOnClick(this.onClicked.bind(this));

        this.addView(this.views.panel_container);


    }

    onClicked(view) {
        switch (view) {
            case this.views.btn_confirm:
                if (this.listener.onConfirmed) {
                    this.listener.onConfirmed();
                }
                this.dismiss();
                break;
            case this.views.btn_cancel:
                if (this.listener.onCancelled) {
                    this.listener.onCancelled();
                }
                this.dismiss();
                break;
        }
    }


    setOnConfirmed(listener) {
        this.listener.onConfirmed = listener;
        return this;
    }

    setOnCancelled(listener) {
        this.listener.onCancelled = listener;
        return this;
    }
}