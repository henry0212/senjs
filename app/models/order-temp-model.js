import { OrderModel } from "./order-model.js";
import { OrderDetailModel } from "./order-detail-model.js";
import { TableModel } from "./table-model.js";


export class OrderTempModel extends OrderModel {

    constructor() {
        super();
        this._properties.orderDetails = [];
        this._properties.tables = [];

    }

    /**
     * @return {OrderModel}
     */
    toOrder() {
        var order = new OrderModel();
        Object.keys(this._properties).forEach(k => {
            order._properties[k] = this._properties[k];
        })
        return order;
    }

    /**
     * @returns {OrderDetailModel}
     */
    // get orderDetails() {
    //     return this._properties.orderDetails;
    // }

    // set orderDetails(val) {
    //     super.orderDetails = val;
    // }

    set tables(val) {
        this._properties.tables = val.map(item => { return item.toJSON(); });
        if (this._properties.tables.toArray != undefined) {
            this._properties.tables = this._properties.tables.toArray();
        }
    }

    get tables() {
        return this._properties.tables;
    }

    toJSON() {
        this._properties.orderDetails = this._foreigner.orderDetails.map(item => {
            var temp = item.toJSON != undefined ? item.toJSON() : item;
            if (item.product && item.product.toJSON != undefined) {
                temp.product = item.product.toJSON();
            }else if(item.product){
                temp.product = item.product;
            }
            return temp;
        });
        return this._properties;
    }

    fromJSON(data) {
        this._foreigner.orderDetails = data.orderDetails;
        this.tables = data.tables.map(item => {
            return new TableModel().fromJSON(item);
        });
        this._foreigner.product = data.product;
        delete data.orderDetails;
        delete data.tables;
        delete data.product;
        this._properties = data;
        return this;
    }
}