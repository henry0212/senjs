import core from './core/index.js';
import layout from './io/layout/index.js';
import widget from './io/widget/index.js';
import res from './res/index.js';
import util from './util/index.js';
import adapter from './adapter/index.js';
import lib from './libs/index.js';
import dialog from './io/dialog/index.js';
import './css/index.js';
import { SandBoxAplication } from './core/application.js';

const senjs = {
    app: core.app,
    core: core,
    dialog: dialog,
    layout: layout,
    widget: widget,
    constant: res.app_constant,
    util: util,
    adapter: adapter,
    Waiter: core.Waiter,
    Thread: core.Thread,
    Service: core.Service,
    lib: lib,
    res: {
        theme: res.app_theme,
        dimen: res.app_size,
        material_colors: res.material_colors
    },
    sandbox: {
        Application: SandBoxAplication
    },
    onReady: core.app.onStart
}

export { senjs };
export default senjs;