import { Thread } from '../core/thread.js'


export class List {
    constructor(list) {
        this.src_array = list != null ? list : new Array();
        this.find = {};
        this.find.equal = (key, value) => {
            var arrayKey = key.split(".");
            if (arrayKey.length == 0) {
                return this.filter(item => {
                    return item[key] == value;
                })
            } else {
                var result;
                arrayKey.forEach(k => {
                    result = this.filter(item => {
                        return item[k] == value;
                    })
                })
                return result;
            }
        }
        this.find.like = (key, value) => {
            var arrayKey = key.split(".");
            if (arrayKey.length == 0) {
                return this.filter(item => {
                    return item[key].toString().indexOf(value) > -1;
                })
            } else {
                var result;
                arrayKey.forEach(k => {
                    result = this.filter(item => {
                        return item[k].toString().indexOf(value) > -1;
                    })
                });
                return result;
            }
        }
    }

    equal() {
    }

    add(object) {
        this.src_array.push(object);
    }


    addAt(object, index) {
        this.src_array.splice(index, 0, object);
    }

    addAll(list) {
        if (list instanceof Array) {
            this.src_array = this.src_array.concat(list);
        }
        else {
            this.src_array = this.src_array.concat(list.toArray());
        }
    }

    remove(object) {
        var index = this.src_array.indexOf(object);
        if (index == -1) {
            return null;
        }
        else {
            return this.src_array.splice(index, 1)[0];
        }
    }

    forEach(cb, isReverse) {
        foreach(cb, isReverse);
    }

    removeAt(index) {
        if (index < this.size()) {
            return this.src_array.splice(index, 1)[0];
        }
        return null;
    }

    removeRange(from, to) {
        return new List(this.src_array.splice(from, to - from + 1));
    }

    removeAll(listObject) {
        if (listObject instanceof  List) {
            listObject = listObject.toArray();
        }
        for (var i = 0; i < listObject.length; i++) {
            this.remove(listObject[i]);
        }
        return this.src_array;
    }

    clear() {
        this.src_array = new Array();
    }

    clone() {
        return new  List(this.src_array.slice(0));
    }

    set(index, value) {
        this.src_array[index] = value;
    }

    get(index) {
        if (index >= this.src_array.length) {
            return null;
        }
        else {
            return this.src_array[index];
        }
    }

    take(from, to) {
        return new List(this.src_array.slice(from, to + 1));
    }


    last() {
        return this.size() > 0 ? this.get(this.size() - 1) : null;
    }


    shift() {
        return this.src_array.shift();
    }


    pop() {
        return this.src_array.pop();
    }


    entityToList(entity_key) {
        return new List(this.src_array.map(function (item) {
            return item[entity_key];
        }));
    }


    splice(index, count) {
        return new List(this.src_array.splice(index, count));

    }


    size() {
        return this.src_array.length;
    }


    foreach(foreachCallback, isReverse) {
        var size = this.src_array.length;

        if (size == 0) {
            return;
        }
        if (isReverse) {
            for (var i = size - 1; i >= 0; i--) {
                foreachCallback(this.src_array[i], i);
            }
        }
        else {
            for (var i = 0; i < size; i++) {
                foreachCallback(this.src_array[i], i);
            }
        }
    }

    foreachWithTimer(foreachCallback, delay, onFinish, isResever) {
        var i = 0;
        var thread;
        var max_loop = 5;
        var self = this;
        try {
            if (!isResever) {
                thread = new Thread(function (thred) {
                    for (var l = 0;
                        l < max_loop;
                        l++) {
                        if (i >= self.size()) {
                            if (onFinish != null) {
                                onFinish();
                            }
                            thred.remove();
                            return;
                        }
                        foreachCallback(self.get(i), i);
                        i++;
                    }
                }
                    , delay == null ? 20 : delay);
            }
            else {
                i = self.size() - 1;
                thread = new Thread(function (thred) {
                    for (var l = 0;
                        l < max_loop;
                        l++) {
                        if (i < 0) {
                            if (onFinish != null) {
                                onFinish();
                            }
                            thred.remove();
                            return;
                        }
                        foreachCallback(self.get(i), i);
                        i--;
                    }
                }
                    , delay == null ? 20 : delay);
            }
        }
        catch (ex) {
            if (thread != null) {
                thread.remove();
            }
            console.error(ex);
        }
        this.stop = function () {
            thread.remove();
        }
        return this;
    }


    asyncForeach(foreachCallback, onFinish, isReverse, clock) {
        var self = this;
        var arThread = new Array();
        isReverse = isReverse || false;
        var forceStop = false;
        var max_loop = 5;
        var i = 0;
        clock = clock || 1;
        if (isReverse) {
            var i = self.size() - 1;
            for (var c = 0; c < clock; c++) {
                arThread.push(new Thread(function (thread) {
                    for (var k = 0; k < max_loop; k++) {
                        if (i < 0) {
                            if (onFinish != null && arThread.length == 1) {
                                onFinish();
                            }
                            if (arThread.length == 0) {
                                return;
                            }
                            arThread.shift().remove();
                            return;
                        }
                        foreachCallback(self.get(i), i);
                        i--;
                    }
                }, 5));
            }
        }
        else {
            var size = self.size();
            for (var c = 0;
                c < clock;
                c++) {
                arThread.push(new Thread(function (thread) {
                    for (var k = 0; k < max_loop; k++) {
                        if (i >= size) {
                            if (onFinish != null && arThread.length == 1) {
                                onFinish();
                            }
                            if (arThread.length == 0) {
                                return;
                            }
                            var thr = arThread.shift();
                            thr.remove();
                            return;
                        }
                        foreachCallback(self.get(i), i);
                        i++;
                    }
                }, 5));
            }
        }
        this.stop = function () {
            forceStop = true;
            while (arThread.length > 0) {
                arThread.shift().stop();
            }
        }
        return this;
    }


    toArray() {
        return this.src_array || [];
    }


    indexOf(object) {
        return this.src_array.indexOf(object);
    }


    single(key, value) {
        return this.size() == 0 ? null : (this.find.equal(key, value).get(0) || null);
    }


    sum(key) {
        return this.src_array.reduce(function (a, b) {
            return (a || 0) + b[key];
        }, 0);
    }

    reduce(cb, initValue) {
        return this.src_array.reduce(cb, initValue);
    }

    Sum(lambda) {
        return this.src_array.reduce(lambda, 0);
    }


    groupBy(key) {
        var array = new List(this.src_array.reduce(function (array, item) {
            (array[item[key]] = array[item[key]] || []).push(item);
            return array;
        }
            , {
            }
        )).toArray();
        var result = new  List();
        var keys = Object.keys(array);
        for (var i = 0;
            i < keys.length;
            i++) {
            result.add(array[keys[i]]);
        }
        return result;
    }


    orderByDescending(key) {
        return new List(this.src_array.sort(function (a, b) {
            return b[key] - a[key];
        }
        ));
    }


    orderByAscending(key) {
        return List(this.src_array.sort(function (a, b) {
            return a[key] - b[key];
        }
        ));
    }


    addNewItems(key, newList) {
        var cloneNew = newList.clone();
        var newItems = new List();
        var newItem;
        while (cloneOld.size() > 0) {
            newItem = cloneNew.shift();
            if (this.find.equal(key, newItem[key]).size() == -1) {
                newItems.add(newItem);
            }
        }
    }
    filter(lambda) {
        return new List(this.src_array.filter(lambda));
    }
}
