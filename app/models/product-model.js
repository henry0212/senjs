import { BaseModel } from "./base-model.js";

var _props = () => {
    return {
        name: "",
        code: "",
        price: 0,
        unit: "",
        icon: "",
        categoryId: "",
        isDisable: false
    };
}

export class ProductModel extends BaseModel {
    constructor() {
        super();
        this._properties = _props();
    }

    get categoryId() {
        return this._properties.categoryId;
    }

    set categoryId(val) {
        return this._properties.categoryId = val;
    }

    get name() {
        return this._properties.name;
    }

    set name(val) {
        return this._properties.name = val;
    }

    get code() {
        return this._properties.code;
    }

    set code(val) {
        return this._properties.code = val;
    }

    get price() {
        return this._properties.price;
    }

    set price(val) {
        return this._properties.price = val;
    }

    get unit() {
        return this._properties.unit;
    }

    set unit(val) {
        return this._properties.unit = val;
    }

    get icon() {
        return this._properties.icon;
    }

    set icon(val) {
        return this._properties.icon = val;
    }

    set categoryId(val) {
        return this._properties.categoryId = val;
    }

    set categoryId(val) {
        return this._properties.categoryId = val;
    }

    set isDisable(val) {
        return this._properties.isDisable = val;
    }

    set isDisable(val) {
        return this._properties.isDisable = val;
    }
}