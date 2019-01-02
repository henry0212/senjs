

import { BaseModel } from "./base-model.js";


const _properties = () => {
    return {
        quantity: 0,
        total: 0,
        discount: 0,
        productId: "",
        price: 0
    }
}

export class OrderDetailModel extends BaseModel {


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


    set product(arg) {
        this._foreigner.product = arg;
        this._properties.productId = arg.id;
        this.price = this._foreigner.product.price;
    }

    get product() {
        return this._foreigner.product;
    }

    get price() {
        return this._properties.price;
    }

    set price(val) {
        this._properties.price = val;
    }

    get total() {
        var total = this._properties.quantity * this.product.price;
        return total - this.discount * total / 100;
    }

    get discount() {
        return this._properties.discount;
    }

    set discount(val) {
        this._properties.discount = val;
    }

    set quantity(val) {
        this._properties.quantity = val;
    }

    get quantity() {
        return this._properties.quantity;
    }

    get productId() {
        return this._properties.productId;
    }
}