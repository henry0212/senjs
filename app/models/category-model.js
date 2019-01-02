import { BaseModel } from "./base-model.js";


const _properties = () => {
    return {
        name: "",
        isDisable: 0
    }
}

export class CategoryModel extends BaseModel {


    constructor() {
        super();
        this._properties = _properties();
    }

    get name() {
        return this._properties.name;
    }

    set name(val) {
        this._properties.name = val;
    }

}