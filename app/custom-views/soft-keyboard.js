import { senjs } from "../../src/index.js";
import { Button } from "../custom-widgets/button.js";
import { TextView } from "../../src/io/widget/text-view.js";
import { IconView } from "../../src/io/widget/icon-view.js";

const key_letters = "1234567890 qwertyuiop adsfghjkl zcvbnm"
const key_numbers = "123 456 789 .0,"

export class SoftKeyboard extends senjs.layout.FrameLayout {
    constructor() {
        super();
        this.listener = {
            onTextChanged: null
        }
    }

    onCreated(v) {
        super.onCreated(v);
        this.initViews();
    }

    initViews() {
        this.views = {
            label_text: new TextView("")
                .toTopParent().toLeftParent().toRightParent()
                .setWidth("100%")
                .setTextAlign("center")
                .setHeight("3.2em")
                .setTextSize(senjs.res.dimen.font.larger)
                .setBorderBottom(1, "rgba(0,0,0,0.1)")
                .setGravity(senjs.constant.Gravity.CENTER),
            btn_backspace: new IconView("backspace")
                .toTopParent()
                .toLeftParent()
                .setIconSize(senjs.res.dimen.icon.larger)
                .setHeight("2.8em")
                .setRotate(180)
                .setPaddingLeft("0.5em")
                .setPaddingRight("0.5em"),
            btn_clear: new IconView("clear").setHeight("2.2em")
                .setBackground(senjs.res.material_colors.Red.g400)
                .setIconColor("#fff")
                .setIconSize(senjs.res.dimen.icon.big)
                .setWidth("100%")
        }
        var panel_letter = new senjs.layout.LinearLayout("100%")
            .setTop("4.4em")
            .setOrientation(senjs.constant.Orientation.VERTICAL);
        var letters_arrays = key_letters.split(" ");
        var panel_line;
        for (var i = 0; i < letters_arrays.length; i++) {
            panel_line = new senjs.layout.LinearLayout("100%")
                .setHeight("100%")
                .setGravity(senjs.constant.Gravity.CENTER);
            panel_letter.addView(panel_line);
            for (var j = 0; j < letters_arrays[i].length; j++) {
                var button_letter = new TextView(letters_arrays[i].charAt(j))
                    .setTextSize(senjs.res.dimen.font.large)
                    .setPaddingLeft("0.8em").setPaddingRight("0.8em")
                    .setPaddingTop("1em").setPaddingBottom("1em");
                panel_line.addView(button_letter);
                button_letter.setOnClick(this.onClicked.bind(this));
            }
        }
        var numbers_array = key_numbers.split(" ");
        for (var i = 0; i < numbers_array.length; i++) {
            panel_line = new senjs.layout.LinearLayout("100%")
                .setHeight("100%")
                .setGravity(senjs.constant.Gravity.CENTER);
            panel_letter.addView(panel_line);
            for (var j = 0; j < numbers_array[i].length; j++) {
                var button_letter = new TextView(numbers_array[i].charAt(j))
                    .setWidth("100%")
                    .setTextSize(senjs.res.dimen.font.larger)
                    .setPaddingLeft("1em").setPaddingRight("1em")
                    .setPaddingTop("1em").setPaddingBottom("1em")
                    .setTextAlign("center");
                panel_line.addView(button_letter);
                button_letter.setOnClick(this.onClicked.bind(this));
            }
        }
        this
            .addView(this.views.label_text)
            .addView(panel_letter)
            .addView(this.views.btn_backspace)
            .addView(this.views.btn_clear);

        this.views.btn_backspace.setOnClick(view => {
            if (this.views.label_text.getText().length > 0) {
                this.views.label_text.setText(this.views.label_text.getText().substring(0, this.views.label_text.getText().length - 1));
                this.callTextChange();
            }
        })
        this.views.btn_clear.setOnClick(view => {
            if (this.views.label_text.getText().length > 0) {
                this.views.label_text.setText("");
                this.callTextChange();
            }
        })

        var service_key_up = senjs.app.service.register.onKeyDown((event, arg) => {
            if (key_letters.indexOf(arg.key) > -1 || key_numbers.indexOf(arg.key) > -1) {
                this.views.label_text.setText(this.views.label_text.getText() + arg.key);
                this.callTextChange();
            } else if (arg.keyCode == 8 && this.views.label_text.getText().length > 0) {
                this.views.label_text.setText(this.views.label_text.getText().substring(0, this.views.label_text.getText().length - 1));
                this.callTextChange();
            } else if (arg.keyCode == 27) {
                this.views.btn_clear.events.perform.click();
            }
        });
        this.events.override.onDestroy(() => {
            if (service_key_up)
                service_key_up.remove();
        });
    }

    onClicked(view) {
        this.views.label_text.setText(this.views.label_text.getText() + view.getText());
        this.callTextChange();
    }

    callTextChange() {
        if (this.listener.onTextChanged) {
            this.listener.onTextChanged(this.views.label_text.getText());
        }
    }

    setOnTextChanged(listener) {
        this.listener.onTextChanged = listener;
        return this;
    }
}