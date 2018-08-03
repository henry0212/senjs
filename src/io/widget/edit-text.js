import { BaseTextView } from "./base-text-view.js";

import { material_colors } from "../../res/theme.js";

export class EditText extends BaseTextView {
    constructor() {
        super(document.createElement("input"));
        this.getDOM().type = "text";
        this.setPaddingTop(5)
            .setPaddingBottom(5)
            .setBorder(0, "transparent")
            .setBorderBottom(1, material_colors.Grey.g300)
            .setBackground("transparent");
        this._dom.style.boxSizing = "border-box";
        this.setTextSize
        this.listener = {
            onTextChanged: null,
            onKeyUp: null
        };
        
        this.appEvent.setOnKeyUp(this.override_onKeyUp);

    }

    getText() {
        return this.getDOM().value;
    }

    setText(text) {
        this.getDOM().value = text;
        return this;
    }

    override_onKeyUp(view, keycode, e) {
        if (this.listener.onTextChanged) {
            this.listener.onTextChanged(this, this.getText());
        }
        if (this.listener.onKeyUp) {
            this.listener.onKeyUp(this, keycode, e);
        }
    }



    /**
     * 
     * @callback onKeyup
     * @param {EditText} view
     * @param {keycode} keycode
     * @param {*} e
     */

    /**
     * set key up event when user input text
     * @param {onKeyup} listener
     *  
     */
    setOnKeyUp(listener) {
        this.listener.onKeyUp = listener;
    }

    setOnTextChanged(listener) {
        this.listener.onTextChanged = listener;
    }

    getLength() {
        return this.getText().length || 0;
    }

}