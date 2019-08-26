import { IconView } from "./icon-view.js";



export class AwesomeIcon extends IconView{
    constructor(icon_name){
        super();
        this.setIcon(icon_name);
        // this.setIconClassKey("fas");
    }

    setIcon(icon_name){
        this.setClassName(icon_name);
        return this;
    }

    
}