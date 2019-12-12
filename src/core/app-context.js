import { View } from './view.js'
import { app_constant } from '../res/constant.js';
import { app_size } from '../res/dimen.js';
import { app_theme, material_colors } from '../res/theme.js';
import { List } from '../util/list-util.js';
import { NumberUtil } from '../util/number-util.js';
import { ScreenUtil } from '../util/screen-util.js';
import { StringUtil } from '../util/string-util.js';
import { app_event } from './event.js';
import { Thread as app_thread } from './thread.js';
import { Waiter as app_waiter } from './waiter.js';
import { FrameLayout } from '../io/layout/frame-layout.js';
import { IconView } from '../io/widget/icon-view.js';
import { Service } from './service.js';
import res from '../res/index.js';
import { senjs } from '../index.js';
import { AwesomeIcon } from '../io/widget/awesome-icon.js';
import { GlobalVariableService } from './global-variable.js';

var app_url = "";

var _isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i) != null;
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i) != null;
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) != null;
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i) != null;
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i) != null;
    },
    any: function () {
        return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows());
        //return false;
    }
}

const app_context = {
    ROOT_BODY: null,
    APP_WINDOW: null,
    DIALOG_FRAME: null,
    onAppStarted: [],
    onKeyEnterListener: null,
    onF4Key: null,
    currentTabControlFocus: null,
    default_animation_waiter: 700,
    readyListener: null,
    preventKeyUp: false,
    isMouseDown: 0,
    customMainWindowElemId: null,
    libs: {
        chart: {
            imported: false,
            src: function () {
                return "js/senjs/libs/chart.js";
            }
        }
    },
    WIFI: {
        STATUS: 1,
        STATE: {
            AVAILABLE: 1,
            NO_NETWORK: 0
        }
    },
    BODY: null,
    IS_HORIZENTAL: true,
    SIZE_UNIT: "px",
    SIZE_PERCENT: "%",
    DEFUALT_INSCREAD_FONT_SIZE: 0,
    SCALE: 1,
    DEFAULT_CHECKBOX_SIZE: 22,
    DEFAULT_AUTO_TEXT_COLOR: 0.7,
    DEFAULT_AUTO_BORDER_TEXT_COLOR: 0.7,
    INDEX_DIALOG: 100000,
    INDEX_LOADING: 200000

}


let _view_destroy_pool = new List();
var _dialog_loading = null;

const _view_pool = {
    info: {
        threadRemove: 0,
        removeList: new Array()
    },
    resumseList: new List(),
    emptyIds: new List(),
    adapters: new List(),
    lists: new List(),
    add: function (view) {
        if (thread_freeMemory) {
            thread_freeMemory.stop();
            thread_freeMemory = null;
        }
        view.info.id = this.genId();
        if (view.info.id == this.lists.size()) {
            _view_pool.lists.add(view);
        } else {
            _view_pool.lists.set(view.info.id, view);
        }
    },
    get: function (controlIdx) {
        if (controlIdx == -1) {
            return null;
        }
        return _view_pool.lists.get(controlIdx);
    },
    getByUid: function (uid) {
        return uid.length == 0 ? null : _view_pool.lists.src_array.find(function (item) {
            return item != null && item.info.uid == uid;
        });
    },
    forceRemove: function (controlId) {
        this.forceRemoveChilds(controlId);
        _view_pool.remove(controlId);
    },
    forceRemoveChilds: function (controlId) {
        var v = _view_pool.get(controlId);
        if (v != null) {
            v.info.childControls = [];
            v.setHtml("");
        }
        _view_pool.lists.filter(function (view, position) {
            if (view != null && view.info.parents.indexOf(controlId) != -1 && view.info.id != -1) {
                _view_pool.remove(view.info.id);
                _view_destroy_pool.add({
                    idx: controlId,
                    view: free_item
                });
            }
            return view;
        });
    },
    remove: function (controlId) {
        let free_item = _view_pool.lists.src_array[controlId];
        if (free_item) {
            _view_destroy_pool.add({
                idx: controlId,
                view: free_item
            });
            //  _view_pool.lists.src_array[controlId] = null;
            this.emptyIds.add(controlId);
            if (thread_freeMemory) {
                thread_freeMemory.stop();
                thread_freeMemory = null;
            }
        }
    },
    allChilds: function (parentId) {
        if (_view_pool.get(parentId) == null) {
            return new List();
        }
        return _view_pool.lists.filter(function (item) {
            return item != null && item.info.parent == parentId && item.info.isDestroy == false;
        });
    },
    allParents: function (viewId) {
        var view = _view_pool.get(viewId);
        var result = new List();
        if (view != null) {
            for (var i = 0; i < view.info.parents.length; i++) {
                var p = _view_pool.get(view.info.parents[i]);
                if (p != null) {
                    result.add(p);
                }
            }
        }
        return result;
    },
    allRootChilds: function (parentId) {
        if (_view_pool.get(parentId) == null) {
            return new List();
        }
        return _view_pool.lists.filter(function (item) {
            return item != null && (item.info.parents.indexOf(parentId) != -1) && item.info.isDestroy == false;
        });
    },
    allEstimateRootChilds: function (parentId) {
        if (_view_pool.get(parentId) == null) {
            return new List();
        }
        return _view_pool.lists.filter(function (item) {
            return item != null && (item.info.estimate_parents.indexOf(parentId) != -1) && item.info.isDestroy == false;
        });
    },
    removeAllChilds: function (parentId) {
        var childs = _view_pool.allChilds(parentId).toArray();
        var item;
        while ((item = childs.pop())) {
            item.info.isDestroy = true;
        }
    },
    addAdapter: function (adapter) {
        _view_pool.adapters.add(adapter);
    },
    genId: function () {
        if (this.emptyIds.size() == 0) {
            return _view_pool.lists.size();
        } else {
            var reuseId = this.emptyIds.shift();
            if (this.lists.filter(function (i) {
                i != null
                    && i.info.parents.indexOf(reuseId) > -1
            }).size() == 0
                && _view_pool.get(reuseId) == null) {
                return reuseId;
            } else {
                return _view_pool.lists.size();
            }
        }
    },
    clearRootParent: function (viewId) {
        var parentId;
        var view = this.get(viewId);
        if (view != null) {
            view.info.parent = -1;
            var parent = this.get(view.info.parent);
            if (parent != null) {
                parentId = parent.info.id
                senjs.List(parent.info.childControls).remove(viewId);
            }
            var childs = this.allRootChilds(parentId);
            childs.filter(function (child, i) {
                senjs.List(child.info.parents).remove(parentId);
                return child;
            });
        }
    },
    countNullableViewChild: function (parentId) {
        return _view_pool.allChilds().filter(function (i) { return i == null; }).size();
    },
    findView: function (lambda) {
        return this.lists.filter(lambda);
    },
    findViewByKey: function (key, value) {
        return this.lists.find.equal(key, value);
    }
}

var _viewId_pool = {
    ids: new List(),
    add: function (uid, cid) {
        senjsUIds.ids.add({ uid: uid, id: cid });
    },
    remove: function (cid) {
        senjsUIds.ids.remove(this.ids.filter(function (item) {
            return item.id == cid;
        }).get(0));
    },
    get: function (uid) {
        return this.ids.filter(function (item) {
            return item.uid == uid;
        }).get(0);
    }
}


let _toast_loading;

export const Toast = {

    Base: function (icon_name, message, options) {
        let default_otps = {
            duration: 3000,
            text_color: '#222222',
            icon_color: '#222222',
            background: '#ffffff'
        }
        options = Object.assign(default_otps, options);
        let wrapper = new senjs.layout.LinearLayout()
            .setPadding(5).setGravity(senjs.constant.Gravity.CENTER)
            .setBackground(options.background || default_otps.background)
            .toTopParent().toLeftParent().toRightParent().setRadiusAt(0, 0, 4, 4).setTop(0).setMargin("auto").setShadow('rgba(0,0,0,0.4)', 0, 0, 8)
            .setAnimation("openPageFromTop");

        let icon = icon_name.search("fa-") > -1 ? new senjs.widget.AwesomeIcon(icon_name) : new senjs.widget.IconView(icon_name);

        icon.setIconColor(options.icon_color || default_otps.icon_color)
            .setIconSize("2em");

        let lb_message = new senjs.widget.TextView(message).setTextColor(options.text_color || default_otps.text_color).setLeft(5).setRight(5);

        wrapper.addView(icon).addView(lb_message);
        wrapper.setZIndex(10000);
        app._addViewToSuperRoot(wrapper);
        if (options.duration > 0) {
            setTimeout(() => {
                wrapper.destroyWithCustomAnimation("closePageFromTop")
            }, options.duration);
        }
        // wrapper.events.override.onCreated((view) => {
        //     view.setLeft((window.innerWidth - view.getWidth()) / 2);
        // })
        return wrapper;
    },
    Error: function (message, duration) {
        this.Base("error", message, {
            text_color: '#ffffff',
            icon_color: '#ffffff',
            background: senjs.res.material_colors.Red.g500,
            duration: duration || 1500
        });
    },
    Success: function (message, duration) {
        this.Base("check_circle", message, {
            text_color: '#ffffff',
            icon_color: '#ffffff',
            background: senjs.res.material_colors.Green.g500,
            duration: duration || 1500
        });
    },
    ShowLoading: function (message, options) {
        if (_toast_loading != null) {
            return;
        }
        options = Object.assign({
            text_color: '#ffffff',
            icon_color: '#ffffff',
            background: senjs.res.material_colors.Blue.g500,
            duration: 0
        }, options || {})
        _toast_loading = this.Base("autorenew", message, options);
        _toast_loading.getViewAt(0).setAnimation("rotate_infinite");
    },
    HideLoading: function () {
        if (_toast_loading) {
            setTimeout(() => {
                _toast_loading.destroyWithCustomAnimation("closePageFromTop")
                _toast_loading = null;
            }, 200);
        }
    }
}


export const senjsAdps = {
    lists: new List(),
    count: 0,
    add: function (senjsAdapter) {
        this.count++;
        senjsAdapter.id = "adax" + this.count;
        senjsAdps.lists.add(senjsAdapter);
    },
    find: function (id) {
        return senjsAdps.lists.single("id", id);
    },
    remove: function (id) {
        senjsAdps.lists.remove(senjsAdps.lists.single("id", id));
    }
}

var application_start = async () => {
    setTimeout(() => {
        app_url = window.location.pathname;
        app_context.SCREEN_WIDTH = window.innerWidth;
        app_context.SCREEN_HEIGHT = window.innerHeight;
        app.info.display.SCREEN_WIDTH = window.innerWidth;
        app.info.display.SCREEN_HEIGHT = window.innerHeight;
        app_context.REAL_WIDTH = window.innerWidth;
        app_context.REAL_HEIGHT = window.innerHeight;
        app_size.init();
        app_context.IS_HORIZENTAL = true;

        app_context.ROOT_BODY = new View(document.body);
        app_context.ROOT_BODY.setPosition("relative");
        app_context.ROOT_BODY.info.isCreated = true;
        app_context.ROOT_BODY.info.state = app_constant.VIEW_STATE.running;
        senjsCts.lists.clear();
        app_context.APP_WINDOW = app.mainFrame = new FrameLayout().toFillParent();
        app_context.APP_WINDOW.setWidth("100%");
        app_context.APP_WINDOW.setHeight("100%");
        app_context.APP_WINDOW.info.id = 0;

        if (app_context.customMainWindowElemId != null && document.getElementById(app_context.customMainWindowElemId) != undefined) {
            document.getElementById(app_context.customMainWindowElemId).appendChild(app.mainFrame._dom);
        } else {
            app_context.ROOT_BODY._dom.appendChild(app.mainFrame._dom);
        }
        delete app.mainFrame.getParentView;

        app_context.APP_WINDOW.info.isCreated = true;
        app_context.APP_WINDOW.info.state = app_constant.VIEW_STATE.running;

        app.mainFrame.setPosition(app_constant.Position.ABSOLUTE);
        _view_pool.add(app_context.APP_WINDOW);
        app_context.APP_WINDOW.setBackgroundColor(app_theme.APPICATION_COLOR);




        //app_size.init();
        IconView.init();
        AwesomeIcon.init();
        app_service_context.start();
        app_service_context.registerDashboard = function (returnView) {
            on_custom_dashboard = returnView;
        }

        for (var i = 0; i < app_context.onAppStarted.length; i++) {
            app_context.onAppStarted[i](app_context.APP_WINDOW);
        }
        service_reduceControlPool();
        service_freeMemory();
        // service_clearTrash();
    }, 200);
}

/**
 * @typedef {Object} ServiceArgument
 * @property {number} id
 * @property {function} remove
 */

/**
 * @callback ServiceCallback
 * @param {ServiceArgument} serviceArgument
 * @param {*} args - orginal javascript event (e);
 */

const app_service_context = {
    override_key_up: null,
    override_key_down: null,
    override_key_enter: null,
    override_key_esc: null,
    override_key_tab: null,
    override_mouse_up: null,
    override_mouse_move: null,
    override_mouse_down: null,
    onKeyESCListener: null,
    onTempESCListener: null,
    onNextKeyListener: null,
    onPevKeyListener: null,
    onTabKeyListener: null,
    onNumberOneKeyListener: null,
    onNumberTwoKeyListener: null,
    onNumberThreeKeyListener: null,
    onNumberFourKeyListener: null,
    onALTandTABKeyListener: null,
    stackKeyUp: new List(),
    stackKeyDown: new List(),
    stackKeyESC: new List(),
    stackKeyTab: new List(),
    stackMouseDown: new List(),
    stackMouseUp: new List(),
    stackPopStates: new List(),
    stackMouseMove: new List(),
    start: () => {
        document.body.oncontextmenu = function () { return false; }
        document.body.onkeyup = function (event) {
            // if (!senjs.event.isEnablePageKeyUp) {
            //     return;
            // }
            if (event.keyCode == 13) {
                if (app_service_context.override_key_enter != null) {
                    app_service_context.override_key_enter();
                }
                if (app_service_context.onKeyEnterListener != null) {
                    app_service_context.onKeyEnterListener();
                }
            } else if (event.keyCode == 27) {
                if (app_service_context.onKeyESCListener != null) {
                    app_service_context.onKeyESCListener();
                }
                if (app_service_context.override_key_esc != null) {
                    app_service_context.override_key_esc.listener(app_service_context.override_key_esc);
                }
            } else if (app_service_context.onF4Key != null && event.keyCode == 115) {
                app_service_context.onF4Key();
            } else if (app_service_context.onPevKeyListener != null && event.keyCode == 37) {
                app_service_context.onPevKeyListener();
            } else if (app_service_context.onNextKeyListener != null && event.keyCode == 39) {
                app_service_context.onNextKeyListener();
            } else if (app_service_context.onALTandTABKeyListener != null && event.keyCode == 18) {
                isCurrentDownAlt = true;
            }
            if (event.keyCode == 9 && app_service_context.onTabKeyListener != null) {
                app_service_context.onTabKeyListener(app_service_context.currentTabControlFocus);
            } else if (app_service_context.onNumberOneKeyListener != null && event.keyCode == 49) {
                app_service_context.onNumberOneKeyListener();
            } else if (app_service_context.onNumberTwoKeyListener != null && event.keyCode == 50) {
                app_service_context.onNumberTwoKeyListener();
            } else if (app_service_context.onNumberThreeKeyListener != null && event.keyCode == 51) {
                app_service_context.onNumberThreeKeyListener();
            } else if (app_service_context.onNumberFourKeyListener != null && event.keyCode == 52) {
                app_service_context.onNumberFourKeyListener();
            }
            if (app_service_context.override_key_up != null && !app_service_context.preventKeyUp) {
                app_service_context.override_key_up.listener(event);
            }
        };
        document.body.onkeydown = function (event) {
            // if (!app.isEnablePageKeyUp) {
            //     return;
            // }
            if (event.keyCode == 9 && app_service_context.override_key_tab != null) {
                app_service_context.override_key_tab.listener(app_service_context.override_key_tab);
                event.preventDefault();
            }
            if (app_service_context.override_key_down != null) {
                app_service_context.override_key_down.listener(event);
            }
        };

        if (_isMobile.any()) {

            document.body.addEventListener("touchstart", (e) => {
                app_service_context.isMouseDown = true;
                // if (app_service_context.override_mouse_down != null) {
                //     app_service_context.override_mouse_down.listener(e);
                // }
                if (e.pageX == undefined) {
                    e.pageX = e.changedTouches[0].pageX;
                    e.pageY = e.changedTouches[0].pageY;
                }
                app_service_context.stackMouseDown.foreach((item) => {
                    item.listener(e);
                });
            })
            document.body.addEventListener("touchend", (e) => {
                app_service_context.isMouseDown = false;
                // if (app_service_context.override_mouse_up != null) {
                //     app_service_context.override_mouse_up.listener(e);
                // }
                if (e.pageX == undefined) {
                    e.pageX = e.changedTouches[0].pageX;
                    e.pageY = e.changedTouches[0].pageY;
                }
                app_service_context.stackMouseUp.foreach((item) => {
                    item.listener(e);
                });
            })

            document.body.addEventListener("touchmove", (e) => {
                // if (app_service_context.override_mouse_move != null) {
                //     app_service_context.override_mouse_move.listener(e);
                // }
                if (e.pageX == undefined) {
                    e.pageX = e.changedTouches[0].pageX;
                    e.pageY = e.changedTouches[0].pageY;
                }
                app_service_context.stackMouseMove.foreach((item) => {
                    item.listener(e);
                });
            })
        } else {
            document.body.addEventListener("mouseup", (e) => {
                app_service_context.isMouseDown = false;
                app_service_context.stackMouseUp.foreach((item) => {
                    item.listener(e);
                });
                // if (app_service_context.override_mouse_up != null) {
                //     app_service_context.override_mouse_up.listener(e);
                // }
            })

            document.body.addEventListener("mousedown", (e) => {
                app_service_context.isMouseDown = true;
                app_service_context.stackMouseDown.foreach((item) => {
                    item.listener(e);
                });
                // if (app_service_context.override_mouse_down != null) {
                //     app_service_context.override_mouse_down.listener(e);
                // }
            });

            document.body.addEventListener("mousemove", (e) => {
                // if (app_service_context.override_mouse_move != null) {
                //     app_service_context.override_mouse_move.listener(e);
                // }
                app_service_context.stackMouseMove.foreach((item) => {
                    item.listener(e);
                });

            });
        }
        window.addEventListener("popstate", function (e) {
            if (app_service_context.stackPopStates.size() > 0) {
                app.preventBackRoutingCallback = true;
                app_service_context.stackPopStates.pop().listener(e);
                e.preventDefault();
                return;
            }
            return false;
        })
    },
    register: {
        /**
         * 
         * @param {ServiceCallback} callback 
         */
        onKeyUp: function (callback) {
            if (callback == null) {
                app_service_context.override_key_up = null;

                if (app_service_context.stackKeyUp.size() > 0) {
                    app_service_context.stackKeyUp.remove(app_service_context.stackKeyUp.last());
                    app_service_context.override_key_up = app_service_context.stackKeyUp.last();
                }
                return;
            }
            var queue = new Object();
            app_service_context.stackKeyUp.add(queue);
            queue.id = parseFloat(new Date().getTime() + "" + app_service_context.stackKeyUp.size());
            queue.listener = function (arg) {
                callback(queue, arg);
            };
            queue.remove = function () {
                if (app_service_context.stackKeyUp.size() > 0) {
                    app_service_context.stackKeyUp.remove(app_service_context.stackKeyUp.find.equal("id", this.id).get(0));
                    app_service_context.override_key_up = app_service_context.stackKeyUp.last();
                } else {
                    app_service_context.override_key_up = null;
                }
            }
            app_service_context.override_key_up = queue;
            return queue;
        },
        onKeyDown: function (callback) {
            if (callback == null) {
                app_service_context.override_key_down = null;
                if (app_service_context.stackKeyDown.size() > 0) {
                    app_service_context.stackKeyDown.remove(app_service_context.stackKeyDown.last());
                    app_service_context.override_key_down = app_service_context.stackKeyDown.last();
                }
                return;
            }
            var queue = new Object();
            app_service_context.stackKeyDown.add(queue);
            queue.id = parseFloat(new Date().getTime() + "" + app_service_context.stackKeyDown.size());
            queue.listener = function (arg) {
                callback(queue, arg);
            };
            queue.remove = function () {
                if (app_service_context.stackKeyDown.size() > 0) {
                    app_service_context.stackKeyDown.remove(app_service_context.stackKeyDown.find.equal("id", this.id).get(0));
                    app_service_context.override_key_down = app_service_context.stackKeyDown.last();
                } else {
                    app_service_context.override_key_down = null;
                }
            };
            app_service_context.override_key_down = queue;
            return queue;
        },
        onKeyEnter: function (callback) {
            callback.remove = function () {
                app_service_context.override_key_enter = null
            }
            app_service_context.override_key_enter = callback;
            return app_service_context.override_key_enter;
        },
        onKeyESC: function (callback) {
            if (callback == null) {
                app_service_context.override_key_esc = null;
                if (app_service_context.stackKeyESC.size() > 1) {
                    app_service_context.stackKeyESC.remove(app_service_context.stackKeyESC.last());
                    app_service_context.override_key_esc = app_service_context.stackKeyESC.last();
                }
                return;
            }
            var queue = new Object();
            app_service_context.stackKeyESC.add(queue);
            queue.id = parseFloat(new Date().getTime() + "" + app_service_context.stackKeyESC.size());
            queue.listener = function (arg) {
                callback(queue, arg);
            };
            queue.remove = function () {
                if (app_service_context.stackKeyESC.size() > 1) {
                    app_service_context.stackKeyESC.remove(app_service_context.stackKeyESC.find.equal("id", this.id).get(0));
                    app_service_context.override_key_esc = app_service_context.stackKeyESC.last();
                } else {
                    app_service_context.override_key_esc = null;
                }
            };
            app_service_context.override_key_esc = queue;
            return queue;
        },
        onKeyTab: function (callback) {
            if (callback == null) {
                app_service_context.override_key_tab = null;
                if (app_service_context.stackKeyTab.size() > 0) {
                    app_service_context.stackKeyTab.remove(app_service_context.stackKeyTab.last());
                    app_service_context.override_key_tab = app_service_context.stackKeyTab.last();
                }
                return;
            }
            var queue = new Object();
            app_service_context.stackKeyTab.add(queue);
            queue.id = parseFloat(new Date().getTime() + "" + app_service_context.stackKeyTab.size());
            queue.listener = function () {
                callback(queue);
            };
            queue.remove = function () {
                if (app_service_context.stackKeyTab.size() > 0) {
                    app_service_context.stackKeyTab.remove(app_service_context.stackKeyTab.find.equal("id", this.id).get(0));
                    app_service_context.override_key_tab = app_service_context.stackKeyTab.last();
                } else {
                    app_service_context.override_key_tab = null;
                }
            };
            app_service_context.override_key_tab = queue;
            return queue;
        },
        onMouseDown: function (callback) {
            if (callback == null) {
                app_service_context.override_mouse_down = null;
                if (app_service_context.stackMouseDown.size() > 0) {
                    app_service_context.stackMouseDown.remove(app_service_context.stackMouseDown.last());
                    app_service_context.override_mouse_down = app_service_context.stackMouseDown.last();
                }
                return;
            }
            var queue = new Object();
            app_service_context.stackMouseDown.add(queue);
            queue.id = parseFloat(new Date().getTime() + "" + app_service_context.stackMouseDown.size());
            queue.listener = function (arg) {
                callback(queue, arg);
            };
            queue.remove = function () {
                if (app_service_context.stackMouseDown.size() > 0) {
                    app_service_context.stackMouseDown.remove(app_service_context.stackMouseDown.find.equal("id", this.id).get(0));
                    app_service_context.override_mouse_down = app_service_context.stackMouseDown.last();
                } else {
                    app_service_context.override_mouse_down = null;
                }
            };
            app_service_context.override_mouse_down = queue;
            return queue;
        },
        onMouseUp: function (callback) {
            if (callback == null) {
                app_service_context.override_mouse_up = null;
                if (app_service_context.stackMouseUp.size() > 0) {
                    app_service_context.stackMouseUp.remove(app_service_context.stackMouseUp.last());
                    app_service_context.override_mouse_up = app_service_context.stackMouseUp.last();
                }
                return;
            }
            var queue = new Object();
            app_service_context.stackMouseUp.add(queue);
            queue.id = parseFloat(new Date().getTime() + "" + app_service_context.stackMouseUp.size());
            queue.listener = function (arg) {
                callback(queue, arg);
            };
            queue.remove = function () {
                if (app_service_context.stackMouseUp.size() > 0) {
                    app_service_context.stackMouseUp.remove(app_service_context.stackMouseUp.find.equal("id", this.id).get(0));
                    app_service_context.override_mouse_up = app_service_context.stackMouseUp.last();
                } else {
                    app_service_context.override_mouse_up = null;
                }
            };
            app_service_context.override_mouse_up = queue;
            return queue;
        },
        onMouseMove: function (callback) {
            if (callback == null) {
                app_service_context.override_mouse_move = null;
                if (app_service_context.stackMouseMove.size() > 0) {
                    app_service_context.stackMouseMove.remove(app_service_context.stackMouseMove.last());
                    app_service_context.override_mouse_up = app_service_context.stackMouseMove.last();
                }
                return;
            }
            var queue = new Object();
            app_service_context.stackMouseMove.add(queue);
            queue.id = parseFloat(new Date().getTime() + "" + app_service_context.stackMouseMove.size());
            queue.listener = function (arg) {
                callback(queue, arg);
            };
            queue.remove = function () {
                if (app_service_context.stackMouseMove.size() > 0) {
                    app_service_context.stackMouseMove.remove(app_service_context.stackMouseMove.find.equal("id", this.id).get(0));
                    app_service_context.override_mouse_move = app_service_context.stackMouseMove.last();
                } else {
                    app_service_context.override_mouse_move = null;
                }
            };
            app_service_context.override_mouse_move = queue;
            return queue;
        },
        onBackPress: function (data, params, callback) {
            if (callback == null) {
                if (app_service_context.stackPopStates.size() > 0) {
                    app_service_context.stackPopStates.remove(app_service_context.stackPopStates.last());
                }
                return;
            }

            var queue = new Object();
            var url = app_url;
            // if (params && params instanceof Array) {
            //     var str_params = params.reduce((str, item) => {
            //         return str + "&" + item.key + "=" + item.value;
            //     }, "");
            //     if (str_params.length > 0) {
            //         url += "?" + str_params.substring(1, str_params.length);
            //     }
            // }

            var params = senjs.util.RouterUtil.getCurrentParameter();
            params = params == null ? {} : params;
            params._app_tag_ = new Date().getTime();
            senjs.util.RouterUtil.updateParams(params);
            // senjs.util.RouterUtil.register()

            // url += url.indexOf("?") == -1 ? "?" : "&";
            // url += "_app_tag_=" + new Date().getTime();

            app_service_context.stackPopStates.add(queue);
            queue.id = parseFloat(new Date().getTime() + "" + app_service_context.stackPopStates.size());
            queue.listener = function (arg) {
                callback(queue, arg);
            };
            queue.remove = function () {
                if (app_service_context.stackPopStates.size() > 0) {
                    app_service_context.stackPopStates.remove(app_service_context.stackPopStates.find.equal("id", this.id).get(0));
                }
                delete params._app_tag_;
                senjs.util.RouterUtil.updateParams(params);

            };
            return queue;
        }
    }
}

/**
 * @callback onAppStarted 
 * @param {View} mainFrame
 */

export var app = {
    mainFrame: app_context.APP_WINDOW,
    preventBackRoutingCallback: false,
    info: {
        display: {
            SCREEN_WIDTH: 0,
            SCREEN_HEIGHT: 0
        }
    },
    service: {
        register: app_service_context.register,
        remove: function (service) {
            if (service.remove) {
                service.remove();
            }
        }
    },
    globalVariable: GlobalVariableService,
    /**
     * 
     * @param { onAppStarted } callback 
     */
    onStart: function (callback) {
        app_context.onAppStarted.push(callback);
    },
    config: {
        enableAnimate: true,
    },
    isMobile: _isMobile,
    event: app_event,
    Thread: app_thread,
    registerMainFrame: function (elemId) {
        app_context.customMainWindowElemId = elemId;
    },
    findViewById: function (id) {
        if (!isNaN(id)) {
            return senjsCts.get(id);
        } else {
            return senjsCts.getByUid(id);
        }
    },
    findHighestZIndex: function () {
        var indexs = app_context.ROOT_BODY.getAllViews().toArray().map(item => {
            return item.info.zIndex;
        });
        indexs.push(1);
        return Math.max(indexs);
    },
    findAdapterById: function (id) {
        return senjsAdps.find(id);
    },
    _addViewToRoot: function (view) {
        app_context.APP_WINDOW.addView(view);
        return app;
    },
    Toast: Toast,
    _addViewToSuperRoot: function (view) {
        app_context.ROOT_BODY.addView(view);
        view.setZIndex(app_context.INDEX_DIALOG);
        // var destroy = view.destroy.bind(view);
        // view.destroy = () => {
        //     destroy();
        //     if (view.getDOM() instanceof Node) {
        //         view.getDOM().remove();
        //     } else {
        //         app_context.ROOT_BODY.getDOM().removeChild(view.getDOM());
        //     }
        //     return view;
        // }
        return app;
    },
    _addDialog: function (dialog) {
        var frame = new FrameLayout().toFillParent().setPosition("fixed");
        frame.setZIndex(app_context.INDEX_DIALOG).setTransition("opacity", ".1");
        var layer_below = new FrameLayout().toFillParent();
        layer_below.setTransition("opacity", ".1").setBackground("rgba(0,0,0,0.5");
        frame._dom.style.display = "flex";
        frame._dom.style.justifyContent = "center";
        frame._dom.style.flexDirection = "column";

        // app_context.APP_WINDOW.filterBlur(2);

        var container = new FrameLayout().setMargin("auto");
        container.addView(dialog);
        container.setWidth(dialog._dom.style.width)
            .setHeight(dialog._dom.style.height)
            .setMaxHeight("100%")
            .setScrollType(app_constant.ScrollType.VERTICAL);

        dialog._dom.style.width = "100%";
        dialog._dom.style.height = "100%";
        frame
            .addView(layer_below)
            .addView(container);

        app_context.ROOT_BODY.addView(frame);
        var dismiss = dialog.dismiss.bind(dialog);
        dialog.dismiss = function () {
            dismiss();
            return dialog;
        }
        dialog.events.override.onDestroy((view) => {
            if (service_back) {
                service_back.remove();
            }
            // app_context.APP_WINDOW.filterBlur(0);
            layer_below.setOpacity(0).postDelay(() => {
                // app_context.ROOT_BODY.removeChild(frame);
                frame.destroy();
            }, dialog.getAnimationDuration() - 150);
        })
        layer_below.setOnClick(() => {
            if (dialog._meta.preventTouchOutside == false) {
                dialog.dismiss();
            }
        })
        var service_back = app.service.register.onBackPress("", "", () => {
            service_back = null;
            dialog.dismiss();
        });
        return app;
    },
    showLoading: function () {
        if (_dialog_loading) {
            return;
        }
        _dialog_loading = new FrameLayout().toFillParent().setPosition("fixed");
        _dialog_loading._dom.style.display = "flex";
        _dialog_loading.setClassName("fadeIn");
        _dialog_loading._dom.style.justifyContent = "center";
        _dialog_loading._dom.style.flexDirection = "column";
        _dialog_loading.setBackground("rgba(0,0,0,0.2)").setZIndex(app_context.INDEX_DIALOG).setTransition("opacity", ".1");

        var container = new FrameLayout().setPadding(10).setRadius(4)
            .setBackground("rgba(0,0,0,0.8)")
            .setMargin("auto")
            .setWidth(app_size.icon.s48 + 20);
        var icon_loading = new IconView("autorenew").setIconColor("#fff")
            .setIconSize(app_size.icon.s48)
            .setClassName("rotate_infinite")
            .setIconColor(material_colors.White);
        container.addView(icon_loading);

        _dialog_loading.addView(container);

        app_context.ROOT_BODY.addView(_dialog_loading);
        return app;
    },
    hideLoading: function () {
        if (_dialog_loading) {
            _dialog_loading.destroy();
            app_context.ROOT_BODY.removeChild(_dialog_loading);
            _dialog_loading = null;
        }
        return app;
    }
}


window.addEventListener("load", function () {
    application_start();
})


export var
    Thread = app_thread,
    Waiter = app_waiter,
    senjsCts = app.senjs_viewPool = _view_pool,
    senjsUIds = app.idPool = _viewId_pool,
    isMobile = _isMobile;



export var brownserType = {
    isOpera: function () {
        return (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    },
    isFirefox: function () {
        return isFirefox = typeof InstallTrigger !== 'undefined';
    },
    isSafari: function () {
        return /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
    },
    isIE: function () {
        return !!window.chrome && !!window.chrome.webstore;
    },
    isEdge: function () {
        return !isIE && !!window.StyleMedia;
    },
    isChrome: function () {
        return !!window.chrome && !!window.chrome.webstore;
    }
}



function service_reduceControlPool() {
    // var isRunning = false;
    var thread;
    var serv_reduce = Service.register(function () {
        if (thread != null) {
            return;
        }

        var viewIndex = senjsCts.lists.size();

        thread = new Thread(function (thred) {
            viewIndex--;
            if (viewIndex <= senjsCts.lists.size() && senjsCts.lists.get(viewIndex) == null) {
                senjsCts.lists.removeAt(viewIndex);
            } else {
                thread = null;
                thred.remove();
            }
        }, 5);
    });
    serv_reduce.delay = 20000;
}

var thread_freeMemory;
function service_freeMemory() {
    var forceClearing = false;

    var serv_reduce = Service.register(function () {
        // Force Clear 
        /* if (_view_destroy_pool.size() > 2000 && !forceClearing) {
             forceClearing = true;
             console.log("forceClear");
             _view_destroy_pool.asyncForeach((free_item, index) => {
                 if (free_item) {
                     Object.keys(free_item).forEach(key => {
                         //free_item[key] = null;
                         delete free_item[key];
                     })
                 }
             }, function () {
                 _view_destroy_pool.clear();
                 thread_freeMemory = null;
                 forceClearing = false;
                 console.log("forceCleared");
             });
         } else */
        if (_view_destroy_pool.size() > 0 && thread_freeMemory == null && !forceClearing) {
            thread_freeMemory = _view_destroy_pool.splice(0, 600).asyncForeach((free_item, index) => {
                if (free_item) {
                    let keys = Object.keys(free_item.view), max = keys.length;
                    for (let i = 0; i < max; i++) {
                        free_item.view[keys[i]] = null;
                        delete free_item.view[keys[i]];
                    }
                    _view_pool.lists.src_array[free_item.idx] = null;
                    delete free_item.view;
                    delete free_item.idx;
                }
            }, function () {
                thread_freeMemory = null;
            });
        }
    });
    serv_reduce.delay = 15000;
}

function service_clearTrash() {
    var serv_trash = Service.register(function () {
        console.log("trash", _view_pool.lists.filter(view => { view && view.info.state != app_constant.VIEW_STATE.running }).size());
    });
}