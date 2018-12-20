import { senjs } from "../../index.js";
import { BaseLayout } from "./base-layout.js";


export class SwipeLayout extends senjs.layout.FrameLayout {
    constructor(width, height) {
        super(width, height);
    }

    
    onCreated(view) {
        this._views = {
            hidden_layout: new senjs.layout.FrameLayout()
        }
    }

    /**
     * 
     * @param {BaseLayout} layout 
     */
    setHiddenLayout(layout){

    }
}