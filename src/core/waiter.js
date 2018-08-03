import { app, Thread } from './app-context.js'
import { List } from '../util/list-util.js'

var info = {
    currentId: 0,
    WaiterStack: new List()
}


export class Waiter {
    constructor(callback, duration) {
        if (info.currentId == 0) {
            info.WaiterStack = new List();
        }
        var wait = {
            waiter: null,
            waiterId: 0,
            remove: function () {
                this.remove(this.waiterId);
            },
        }

        this._waiter = setTimeout(() => {
            callback();
            this.remove();
        }, duration);
        info.currentId++;
        this.waiterId = info.currentId;
        info.WaiterStack.add(this);
    }

    remove() {
        if (this._waiter != null) {
            clearTimeout(this._waiter);
            info.WaiterStack.remove(this);
        }
    }
    removeAll() {
        info.WaiterStack.foreach(function (wt) {
            clearTimeout(wt);
        });
        info.WaiterStack = new List();
    }
}