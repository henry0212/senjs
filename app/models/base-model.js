


const _properties = () => {
    return {
        id: "",
        createdAt: 0,
        modifiedAt: 0,
        isDeleted: 0,
    }
}

export class BaseModel {

    constructor() {
        this.__properties = _properties();
        this.__properties.createdAt = Date.now();
        this.__properties.modifiedAt = this.__properties.createdAt;

        this._foreigner = {

        }
    }

    set _properties(object) {
        var keys = Object.keys(object);
        for (let key of keys) {
            this.__properties[key] = object[key];
        }
    }

    get _properties() {
        return this.__properties;
    }

    get id() {
        return this.__properties.id;
    }

    set id(val) {
        this.__properties.id = val;
    }

    get createdAt() {
        return this._properties.createdAt;
    }

    set createdAt(val) {
        this._properties.createdAt = val;
    }

    get modifiedAt() {
        return this._properties.modifiedAt;
    }

    set modifiedAt(val) {
        this._properties.modifiedAt = val;
    }

    set isDeleted(val) {
        this.isDeleted = val;
    }

    get isDeleted() {
        return this.isDeleted;
    }

    get isNewModel() {
        return this.id == null || this.id === "";
    }

    get isSelecting() {
        return this._isSelecting;
    }

    set isSelecting(val) {
        this._isSelecting = val;
    }

    fromJSON(json) {
        this._properties = json;
        return this;
    }
    toJSON() {
        return this._properties;
    }
}