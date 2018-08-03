import { Waiter } from "../core/waiter.js";
import { dh } from "../index.js";


export class FilePicker {


    /**
     * {
     *  accept: 'minetype' 
     *  capture: 'camera...'
     * }
     * @param {Object} options 
     */
    static onFilePicked(options) {
        options = options || {};
        return new Promise((next) => {
            var file = document.createElement("input");
            file.type = "file";
            if (options.hasOwnProperty("accept")) {
                file.accept = options.accept;
            }
            if (options.hasOwnProperty("capture")) {
                file.capture = options.capture;
            }
            file.onchange = (e) => {
                if (Object.keys(e.target.files).length > 0) {
                    next(e.target.files[0]);
                } else {
                    next(null);
                }
            };
            new Waiter(() => {
                file.click();
            }, 500);
        })
    }

    static onMultifilePicked(options) {
        options = options || {};
        return new Promise((next) => {
            var results = [];
            var file = document.createElement("input");
            file.type = "file";
            file.multiple = "multiple";
            if (options.hasOwnProperty("accept")) {
                file.accept = options.accept;
            }

            file.onchange = (e) => {
                if (Object.keys(e.target.files).length > 0) {
                    next(e.target.files);
                } else {
                    next([]);
                }
            };
            new Waiter(() => {
                file.click();
            }, 500);
        })
    }

    static singleFileToBase64(file) {
        return new Promise(next => {
            var reader = new FileReader();
            reader.onload = function (e) {
                var base64 = e.target.result.toString();
                next(base64);
            }
            reader.readAsDataURL(file);
        })
    }

    static multiFileToBase64(files) {
        return new Promise(next => {
            var keys = Object.keys(files);
            if (keys.length == 0) {
                next([]);
                return;
            }
            var reader = new FileReader();
            var results = [];
            reader.onloadend = function () {
                results.push(reader.result.toString());
                if (keys.length == 0) {
                    next(results);
                } else {
                    reader.readAsDataURL(files[keys.shift()]);
                }
            }
            reader.readAsDataURL(files[keys.shift()]);
        })
    }

    static singleFileToBinaryString(file) {
        return new Promise(next => {
            var reader = new FileReader();
            reader.onload = function () {
                var base64 = reader.result.toString();
                next(base64);
            }
            reader.readAsBinaryString(file);
        })
    }
    static singleFileToArrayBuffer(file) {
        return new Promise(next => {
            var reader = new FileReader();
            reader.onload = function () {
                var base64 = reader.result.toString();
                next(base64);
            }
            reader.readAsArrayBuffer(file);
        })
    }
}