
import { BaseTextView } from "./base-text-view.js";

export class TextView extends BaseTextView{
    constructor(){
        super(document.createElement("span"));
    }
}