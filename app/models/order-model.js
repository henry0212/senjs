import { BaseModel } from "./base-model.js";

const _status = {
    PENDING: 1,
    BOOKED: 2,
    SELECTING: 3
}

const _properties = () => {
    return {
        isSelecting: false,
        total: 0,
        discount: 0,
        paid: 0
    }
}

export class OrderModel extends BaseModel {

    static get STATUS() {
        return _status;
    }

    constructor() {
        super();
        this._properties = _properties();
        this._foreigner.orderDetails = [];
    }

    set status(val) {
        this._properties.status = val;
    }

    get status() {
        return this._properties.status;
    }

    get discount() {
        return this._properties.discount;
    }

    set discount(val) {
        this._properties.discount = val;
    }

    get paid() {
        return this._properties.paid;
    }

    set paid(val) {
        this._properties.paid = val;
    }

    set orderDetails(arg) {
        this._foreigner.orderDetails = arg;
    }

    get orderDetails() {
        return this._foreigner.orderDetails;
    }

    get tables() {
        return this._foreigner.tables || [];
    }

    set tables(val) {
        return this._foreigner.tables = val;
    }
}