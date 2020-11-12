import { senjs } from "../index.js";
import { StringUtil } from "../util/string-util.js";
import { View } from "./view.js";


const __APP_SHARING_DOMAIN = window.location.protocol + "//" + window.location.hostname;

let __COUNT_KEY = 0;
let _SEN_JS_SOURCE = '';

let __senjs_host = null;

export class SandBoxAplication extends View {
    /**
     * Base on IFrame element app_src allow html or js file
     * @param {any} app_src 
     * 
     */
    constructor(app_src) {
        super(document.createElement('iframe'));
        // if (_SEN_JS_SOURCE.length == 0) {
        //     throw 'Must be config the senjs source dir'
        // }
        this._meta.app_src = app_src || null;
        this._key_pools = [];
        this._listeners = {
            onDataReceived: []
        }
        this._init();
        this._initEvironment();
    }

    static set CONFIG_SENJS_SOURCE(value) {
        _SEN_JS_SOURCE = value;
    }

    _init() {
        this.setCss({
            'width': '100%',
            'height': '100%',
            'position': 'absolute',
            'left': '0',
            'right': '0',
            'top': '0',
            'bottom': '0'
        });
    }

    _initEvironment() {
        if (this._meta.app_src == null) {

            var html = `<html>
                        <head>
                        </head>
                        <body>
                        </body>
                    </html>`;

            this._meta.html_blob = new Blob([html], { type: 'text/html' });
            this._dom.src = URL.createObjectURL(this._meta.html_blob);
        } else {
            this._dom.src = this._meta.app_src;
        }
        // setTimeout(() => {
        //     this._dom.contentWindow.postMessage({
        //         key: "__senjs",
        //         data: senjs,
        //     }, __APP_SHARING_DOMAIN, false);
        // }, 1000);
       // console.log(senjs.toString());
    }

    _initEvent() {
        window.addEventListener('message', this._onMessageReceived.bind(this));
    }

    _onMessageReceived(event) {
        // Filter Message first before call the listeners
        var _d = event.data;
        if (typeof _d.key === 'string' && _d.key === '__senjs') {
            senjs = _d.data;
            console.log("__senjs", senjs);
        } else if (this._key_pools.indexOf(_d.key) > -1) {
            this._listeners.onDataReceived.forEach((cb) => {
                cb.call(this, _d.key, _d.data);
            })
        }
    }

    _onDestroy() {
        super._onDestroy();
    }

    passData(key, data) {
        __COUNT_KEY++;
        const self_key = StringUtil.randomString(16) + key + "_" + key;
        this._key_pools.push(self_key);
        var post_options = {
            key: key,
            data: data
        };
        this._dom.postMessage(post_options, __APP_SHARING_DOMAIN, false);
    }

    addOnDataReceived(listener) {
        this._listeners.onDataReceived.push(listener);
        return this;
    }
}