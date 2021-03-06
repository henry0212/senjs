import { Waiter } from "../core/waiter.js";
import { senjs } from "../index.js";


export class FilePicker {



    /**
     * 
     * {
     *  accept: 'minetype' 
     *  capture: 'camera...'
     * }
     * @param {Object} options 
     * @returns {Promise<file>}
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
            file.style.zIndex = -1;
            file.style.visibility = "hidden";
            file.onchange = (e) => {
                if (Object.keys(e.target.files).length > 0) {
                    next(e.target.files[0]);
                } else {
                    next(null);
                }
                file.remove();
            };
            document.body.appendChild(file);
            new Waiter(() => {
                file.click();
            }, 100);
        })
    }

    static onMultifilePicked(options) {
        options = options || {};
        return new Promise((next) => {
            var results = [];
            var file = document.createElement("input");
            file.type = "file";
            file.multiple = "multiple";
            file.style.zIndex = -1;
            file.style.visibility = 'hidden';
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
            document.body.appendChild(file);
            new Waiter(() => {
                file.click();
            }, 200);
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
            reader.onload = function (e) {
                next(e.target.result);
            }
            reader.readAsArrayBuffer(file);
        });
    }

    static loadFileToBlob(file, minetype) {
        return new Promise(next => {
            var reader = new FileReader();
            reader.onloadend = function () {
                var byteCharacters = atob((reader.result.slice(reader.result.indexOf(',') + 1)));
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var blob = new Blob([byteArray], { type: minetype });
                var url = URL.createObjectURL(blob);
                next(url);
            }
            reader.readAsDataURL(file);
        });
    }
}