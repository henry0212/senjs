import { IconView } from "./icon-view.js";



export class AwesomeIcon extends IconView {
    constructor(icon_name) {
        super();
        this.icon_name = icon_name;
    }

    onInit() {
        this.setIcon(this.icon_name);
    }

    setIcon(icon_name) {
        this.icon_name = icon_name;
        this.setClassName(icon_name);
        return this;
    }


}