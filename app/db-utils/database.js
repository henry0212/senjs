import { senjs } from "../../src/index.js";
import { CategoryModel } from "../models/category-model.js";
import { StorageUtil } from "./storage.js";
import { ProductModel } from "../models/product-model.js";
import { ImageRefactor } from "../../src/libs/image-refactor.js";
import { List } from "../../src/util/list-util.js";
import { OrderTempModel } from "../models/order-temp-model.js";
import { TableModel } from "../models/table-model.js";
import { temp_images } from './image-data.js';

var _databaseInstance = null;


const data_caching = {
    categories: new senjs.util.List(),
    products: new senjs.util.List(),
    orderTemps: new senjs.util.List(),
    tables: new senjs.util.List()
}


const request_code = {
    SIGN_IN_GOOGLE: 1,
    SIGN_IN_FACEBOOK: 2,
    ALL_CATEGORY: 3,
    NEW_CATEGORY: 4,
    UPDATE_CATEGORY: 5,
    DELETE_CATEGORY: 6,
    ALL_PRODUCT: 7,
    NEW_PRODUCT: 8,
    UPDATE_PRODUCT: 9,
    NEW_ORDER_TEMP: 10,
    UPDATE_ORDER_TEMP: 11,
    DELETE_ORDER_TEMP: 12,
    ALL_ORDER_TEMP: 13,
    ALL_TABLE: 14

}

const table_name = {
    CATEGORY: "category",
    PRODUCT: "product",
    USER: "user",
    CUSTOMER: "customer",
    ORDER: "order",
    ORDER_TEMP: 'order_temp'
}

export class DbUtil {

    static get request_code() {
        return request_code;
    }


    /**
     * @returns {DbUtil}
     */
    static getInstance() {
        // if (_databaseInstance == null) {
        //     _databaseInstance = new DbUtil();
        // }
        // return _databaseInstance;
        return new DbUtil();
    }

    /**
     * @returns {DbUtil}
     */
    static newInstance() {
        return new DbUtil();
        // return _databaseInstance = new DbUtil();
    }

    constructor() {
        this._onErrorCallbacks = [];
        this.listener = {
            onSuccess: null,
            onFailed: null
        }
    }

    openConnection() {
        if (this.database == undefined) {
            this.database = firebase.firestore();
            const settings = { timestampsInSnapshots: true };
            this.database.settings(settings);
        }
        return this.database;
    }

    openTable(table_name) {
        return this.openConnection().collection(table_name);
    }

    signInViaFacebook(email, password) {
        return this;
    }

    signInViaGoogle(email, password) {
        return this;
    }

    newCategory(category) {
        senjs.app.showLoading();
        this.openTable(table_name.CATEGORY)
            .add(category.toJSON())
            .then((docRef) => {
                category.id = docRef.id;
                data_caching.categories.add(category);
                saveListToLocal(table_name.CATEGORY, data_caching.categories);
                this.callSuccess(category, request_code.NEW_CATEGORY);
            }).catch((err) => {
                this.callFailed(err, request_code.NEW_CATEGORY);
            });
    }

    updateCategory(category) {
        senjs.app.showLoading();
        this.openTable(table_name.CATEGORY)
            .doc(category.id)
            .set(category.toJSON())
            .then((docRef) => {
                var index = data_caching.categories.indexOf(data_caching.categories.single("id", category.id));
                if (index > -1) {
                    data_caching.categories.get(index).fromJSON(category);
                }
                this.callSuccess(category, request_code.UPDATE_CATEGORY);
            }).catch((err) => {
                this.callFailed(err, request_code.UPDATE_CATEGORY);
            });
    }

    allCategories() {
        return PromiseInstance(next => {
            if (data_caching.categories.size() > 0) {
                this.callSuccess(data_caching.categories.clone().toArray(), request_code.ALL_CATEGORY);
                next(data_caching.categories.clone().toArray())
                return;
            }
            senjs.app.showLoading();
            this.openTable(table_name.CATEGORY)
                .get()
                .then((snapshots) => {
                    data_caching.categories = new senjs.util.List(snapshots.docs.map(doc => {
                        var rs = new CategoryModel().fromJSON(doc.data());
                        rs.id = doc.id;
                        return rs;
                    }));
                    saveListToLocal(table_name.CATEGORY, data_caching.categories);
                    if (this.callSuccess(data_caching.categories.clone().toArray(), request_code.ALL_CATEGORY) == true) {
                        next(data_caching.categories.clone().toArray());
                    }
                }).catch((err) => {
                    this.callFailed(err, request_code.ALL_CATEGORY);
                });
        });
    }

    allProducts() {
        return PromiseInstance(next => {
            if (data_caching.products.size() > 0) {
                this.callSuccess(data_caching.products.clone().toArray(), request_code.ALL_PRODUCT);
                return;
            }
            senjs.app.showLoading();
            this.openTable(table_name.PRODUCT)
                .get()
                .then((snapshots) => {
                    data_caching.products = new senjs.util.List(snapshots.docs.map(doc => {
                        var rs = new ProductModel().fromJSON(doc.data());
                        rs.id = doc.id;
                        return rs;
                    }));
                    data_caching.products = data_caching.products.orderByAscending("createdAt");
                    data_caching.products.addAll(data_caching.products);
                    data_caching.products.addAll(data_caching.products);
                    data_caching.products.addAll(data_caching.products);
                    data_caching.products.addAll(data_caching.products);
                    data_caching.products.addAll(data_caching.products);
                    data_caching.products.addAll(data_caching.products);
                    data_caching.products.addAll(data_caching.products);
                    data_caching.products.addAll(data_caching.products);
                    // saveListToLocal(table_name.PRODUCT, data_caching.products);
                    if (this.callSuccess(data_caching.products.toArray(), request_code.ALL_PRODUCT) == false) {
                        next(data_caching.products.clone().toArray())
                    }
                }).catch((err) => {
                    this.callFailed(err, request_code.ALL_PRODUCT);
                });
        });
    }

    async newProduct(product) {
        try {
            senjs.app.showLoading();
            if (product.icon && product.icon.indexOf("base64") > -1) {
                // Reduce size
                product.icon = await (await new ImageRefactor(product.icon)
                    .resize(192, 192)
                    .done())
                    .toBase64(60);
                product.icon = await StorageUtil.getInstance().storeBase64ToGallery(product.icon);
            }
            this.openTable(table_name.PRODUCT)
                .add(product.toJSON())
                .then((docRef) => {
                    data_caching.products.add(product);
                    saveListToLocal(table_name.PRODUCT, data_caching.products);
                    product.id = docRef.id;
                    this.callSuccess(product, request_code.NEW_PRODUCT);
                }).catch((err) => {
                    this.callFailed(err, request_code.NEW_PRODUCT);
                });
        } catch (error) {
            console.error(error);
        }
    }

    createSomeProducts() {
        this.allCategories().then(cates => {
            var render = (index, i, callback) => {
                console.log("p", i);
                var begin = 40 * index, end = begin + 40;
                var product = new ProductModel();
                product.code = `p${i + 1}`;
                product.name = `Product ${i + 1}`;
                product.icon = temp_images[senjs.util.NumberUtil.randomNumber(0, temp_images.length - 1)];
                product.price = senjs.util.NumberUtil.randomNumber(0, 5) * 5000;
                product.categoryId = cates[index].id;
                product.unit = "cup";
                this.newProduct(product).then(() => {
                    console.log("created", product.name, cates[index].name);
                    if (i < end) {
                        render(index, i + 1, callback);
                    } else if (i >= end && index < cates.length) {
                        render(index + 1, i, callback);
                    } else {
                        callback();
                    }
                })
            }
            render(0, 0, function () {
                console.log("Finised");
            })
        });
    }

    async updateProduct(product) {
        try {
            senjs.app.showLoading();
            if (product.icon && product.icon.indexOf("base64") > -1) {
                // Reduce size
                product.icon = await (await new ImageRefactor(product.icon)
                    .resize(240, 240)
                    .done())
                    .toBase64(90);
                product.icon = await StorageUtil.getInstance().storeBase64ToGallery(product.icon);
            }
            this.openTable(table_name.PRODUCT)
                .doc(product.id)
                .set(product)
                .then((docRef) => {
                    var index = data_caching.products.indexOf(data_caching.products.single("id", product.id));
                    if (index > -1) {
                        data_caching.products.get(index).fromJSON(product);
                    }
                    this.callSuccess(product, request_code.UPDATE_PRODUCT);
                }).catch((err) => {
                    this.callFailed(err, request_code.UPDATE_PRODUCT);
                });
        } catch (error) {
            console.error(error);
        }
    }

    async allTables() {
        if (data_caching.tables.size() == 0) {
            for (var i = 1; i <= 120; i++) {
                var temp = new TableModel();
                temp.tableNo = i;
                temp.id = i;
                temp.status = TableModel.STATUS.PENDING;
                data_caching.tables.add(temp)
            }
        }
        this.callSuccess(data_caching.tables.clone().toArray(), request_code.ALL_TABLE);
        return data_caching.tables.toArray();
    }

    /**
     * 
     * @param {OrderTempModel} orderTempModel 
     */
    async newOrderTemp(orderTempModel) {
        try {
            this.openTable(table_name.ORDER_TEMP)
                .add(orderTempModel.toJSON())
                .then((docRef) => {
                    orderTempModel.id = docRef.id;
                    data_caching.orderTemps.add(orderTempModel);
                    saveListToLocal(table_name.ORDER_TEMP, data_caching.orderTemps);
                    this.callSuccess(orderTempModel, request_code.NEW_ORDER_TEMP);
                }).catch((err) => {
                    console.error(err);
                    this.callFailed(err, request_code.NEW_ORDER_TEMP);
                });
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 
     * @param {OrderTempModel} orderTempModel 
     */
    async updateOrderTemp(orderTempModel) {
        try {
            this.openTable(table_name.ORDER_TEMP)
                .doc(orderTempModel.id)
                .set(orderTempModel.toJSON())
                .then((docRef) => {
                    var index = data_caching.orderTemps.indexOf(data_caching.orderTemps.single("id", orderTempModel.id));
                    if (index > -1) {
                        data_caching.orderTemps.set(index, orderTempModel);
                    }
                    saveListToLocal(table_name.ORDER_TEMP, data_caching.orderTemps);
                    this.callSuccess(orderTempModel, request_code.UPDATE_ORDER_TEMP);
                }).catch((err) => {
                    console.error(err);
                    this.callFailed(err, request_code.UPDATE_ORDER_TEMP);
                });
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * @returns {Array}
     */
    async allOrderTemp() {
        await this.allTables();
        return PromiseInstance(next => {
            if (data_caching.orderTemps.size() > 0) {
                this.callSuccess(data_caching.orderTemps.clone().toArray(), request_code.ALL_ORDER_TEMP);
                return data_caching.orderTemps.clone().toArray();
            }
            senjs.app.showLoading();
            this.openTable(table_name.ORDER_TEMP)
                .get()
                .then((snapshots) => {
                    data_caching.orderTemps = new senjs.util.List(snapshots.docs.map(doc => {
                        var rs = new OrderTempModel().fromJSON(doc.data());
                        rs.id = doc.id;
                        return rs;
                    }));
                    data_caching.orderTemps.foreach(item => {
                        item.tables.forEach(table => {
                            var table_booked = data_caching.tables.toArray().find(temp => {
                                return temp.id == table.id;
                            });
                            if (table_booked) {
                                table_booked.status = TableModel.STATUS.BOOKED;
                            }
                        })
                    });
                    saveListToLocal(table_name.ORDER_TEMP, data_caching.orderTemps);
                    if (this.callSuccess(data_caching.orderTemps.toArray(), request_code.ALL_ORDER_TEMP) == false) {
                        next(data_caching.orderTemps.clone().toArray())
                    }
                }).catch((err) => {
                    console.log(err);
                    this.callFailed(err, request_code.ALL_ORDER_TEMP);
                });
        });
    }

    setOnSuccess(listener) {
        this.listener.onSuccess = listener;
        return this;
    }

    setOnFailed(listener) {
        this.listener.onFailed = listener;
        return this;
    }

    callSuccess(result, request_code) {
        senjs.app.hideLoading();
        if (this.listener.onSuccess) {
            this.listener.onSuccess(result, request_code);
            return true;
        } else {
            return false;
        }
    }

    callFailed(error, request_code) {
        senjs.app.hideLoading();
        if (this.listener.onFailed) {
            this.listener.onFailed(error, request_code);
            return true;
        } else {
            return false;
        }
    }
}

var PromiseInstance = (callback) => {
    return new Promise(next => {
        callback(next);
    }, error => {
        console.error(error);
    });
}

/**
 * 
 * @param {string} table_name 
 * @param {List} listData 
 */
var saveListToLocal = (table_name, listData) => {
    // convert to array before save 
    localStorage.setItem(table_name, JSON.stringify(listData.toArray().map(item => {
        return item.toJSON();
    })));
}

/**
 * 
 * @param {string} table_name 
 * @param {List} out_list - the list need to contain result
 */
var readListFromLocal = (table_name, out_list) => {
    out_list.clear();
    if (localStorage.getItem(table_name)) {
        out_list.addAll(JSON.parse(localStorage.getItem(table_name)));
    }
    return out_list;
}


