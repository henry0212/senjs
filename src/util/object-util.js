export class ObjectUtil {

    static copyObject(object) {
        var keys = Object.keys(object);
        var clone = new Object();
        keys.forEach(function (key) {
            if (object[key] instanceof Array) {
                clone[key] = [];
                object[key].forEach(function (child) {
                    clone[key].push(ObjectUtil(child));
                });
            }
            else {
                clone[key] = object[key];
            }
        });
        return clone;
    }
}