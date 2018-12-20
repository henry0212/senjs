import { BaseTextView } from "./base-text-view.js";

import { material_colors } from "../../res/theme.js";
import { KeyChangeListener } from "../../core/event-v2.js";

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
            onKeyUp: null,
            onKeyChanged: null
        };

        new KeyChangeListener(this.override_onKeyChange)
            .bindToView(this);
    }

    getText() {
        return this.getDOM().value;
    }

    setText(text) {
        this.getDOM().value = text;
        return this;
    }

    override_onKeyChange(view, args) {
        if (this.listener.onTextChanged) {
            this.listener.onTextChanged(this, this.getText());
        }
        if (args.action == KeyChangeListener.MotionAction.KEY_UP && this.listener.onKeyUp) {
            this.listener.onKeyUp(this, args.keycode, args._e);
        }
        if (this.listener.onKeyChanged) {
            this.listener.onKeyChanged(view, args);
        }
    }

    setHint(hint) {
        this._dom.placeholder = hint;
        return this;
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
        return this;
    }

    setOnTextChanged(listener) {
        this.listener.onTextChanged = listener;
        return this;
    }

    getLength() {
        return this.getText().length || 0;
    }

    /**
     * 
     * @param {KeyChangeListener} listener 
     * @returns {EditText}
     */
    setOnKeyChanged(listener) {
        this.listener.onKeyChanged = listener;
        return this;
    }
}