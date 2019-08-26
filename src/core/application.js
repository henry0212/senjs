import { senjs } from "../index.js";
import { WindowLayout } from "../io/layout/window-layout.js";



export class SandBoxAplication extends WindowLayout {
    /**
     * Base on IFrame element app_src allow html or js file
     * @param {any} app_src 
     * 
     */
    constructor(app_src) {
        this._meta.app_src = app_src;
        super(width, height);
        this._init();
        this._initEvironment();
    }

    _init() {
        this._views = {
            iframe: new senjs.core.View(document.createElement("iframe")).setCss({
                'width': '100%',
                'height': '100%',
                'position': 'absolute',
                'left': '0',
                'right': '0',
                'top': '0',
                'bottom': '0'
            })
        };

        this.addView(this._views.iframe);
    }

    _initEvironment() {
        if (app_src.indexOf(".js") > -1) {
            var html = `<html>
                        <head>
                            <script type='text/javascript' src='${ this._meta.app_src}' ></script>
                        </head>
                        <body>
                        </body>
                    </html>`;

            this._meta.html_blob = new Blob([html], 'text/html');
            this._views.iframe._dom.src = URL.createObjectURL(this._meta.html_blob);
        } else {
            this._views.iframe._dom.src = this._meta.app_src;
        }
    }

    _onDestroy() {
        super._onDestroy();
    }
}