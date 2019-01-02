import { BaseModel } from "./base-model.js";

const _status = {
    PENDING: 1,
    BOOKED: 2,
    SELECTING: 3
}

const _properties = () => {
    return {
        tableNo: 0,
        isDisable: 0,
        status: _status.PENDING,
        isSelecting: false
    }
}

export class TableModel extends BaseModel {

    static get STATUS() {
        return _status;
    }

    constructor() {
        super();
        this._properties = _properties();
    }

    get tableNo() {
        return this._properties.tableNo;
    }

    set tableNo(val) {
        this._properties.tableNo = val;
    }

    set status(val) {
        this._properties.status = val;
    }

    get status() {
        return this._properties.status;
    }

    set order(arg) {
        this._foreigner.order = arg;
    }

    get order() {
        return this._foreigner.order;
    }
}