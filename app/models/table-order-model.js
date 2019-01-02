import { BaseModel } from "./base-model.js";
import { OrderModel } from "./order-model.js";

const _status = {
    PENDING: 1,
    BOOKED: 2,
    SELECTING: 3
}

const _properties = () => {
    return {
        tables: [],
        name: "",
    }
}

export class TableOrderModel extends BaseModel {

    static get STATUS() {
        return _status;
    }

    constructor() {
        super();
        this._properties = _properties();
    }

    get tables() {
        return this._properties.tables;
    }


    /**
     * 
     */
    set tables(val) {
        val = val.toArray != undefined ? val.toArray() : val;
        this._properties.tables = val;
        this.id = val.reduce((join, item) => {
            return join + "" + item.tableNo;
        }, "");
        this.name = val.reduce((join, item) => {
            return join + "," + item.tableNo;
        }, "");
    }

    get name() {
        return this._properties.name;
    }

    set name(val) {
        this._properties.name = val;
    }

    set order(arg) {
        this._foreigner.order = arg;
    }

    /**
     * @returns {OrderModel}
     */
    get order() {
        return this._foreigner.order;
    }
}