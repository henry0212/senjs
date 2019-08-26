
var __pool_vars = {

}

export class GlobalVariableService {

    constructor(key) {
        this._meta = {
            key: key,
            value: '',
        }

        __pool_vars[key] = this;
        this._listener = {
            onValueChanges: [],
            onRemoves: []
        }
    }

    /**
     * 
     * @param {string} name 
     * @returns {GlobalVariableService}
     */
    static key(name) {
        if (__pool_vars[name] == undefined) {
            __pool_vars[name] = new GlobalVariableService(name);
        }
        return __pool_vars[name];
    }

    set(value) {
        __pool_vars[this._meta.key].value = value;
        console.log(this._listener.onValueChanges);
        this._listener.onValueChanges.forEach((listener) => {
            try {
                listener.call(this, value);
            } catch (error) {
                console.info(error.message);
            }
        });
        return this;
    }

    get() {
        return this._meta.value;
    }

    remove() {
        delete __pool_vars[key];
        this._listener.onRemoves.forEach((listener) => {
            try {
                listener.call(this, value);
            } catch (error) {
                console.log(error);
            }
        });
    }

    addOnValueChanged(listener) {
        this._listener.onValueChanges.push(listener);
        return this;
    }

    addOnRemoved(listener) {
        this._listener.onRemoves.push(listener);
        return this;
    }
}
