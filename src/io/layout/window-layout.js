import { senjs } from "../../index.js";
import { BaseLayout } from "./base-layout.js";
import { MouseChangeListener } from "../../core/event-v2.js";
import { List } from "../../util/list-util.js";
import { View } from "../../core/view.js";

var _pool_windows = new List();
var _window_focusing = null;

var _canResize = {
    _lim_range: 4,
    _window_focusing: null,
    _mouse_arg: null,
    bind: function (window, mouse_arg) {
        this._mouse_arg = mouse_arg;
        this._window_focusing = window;
    },
    get top_left() {
        return this.top && this.left;
    },
    get top_right() {
        return this.top && this.right;
    },
    get bottom_left() {
        return this.bottom && this.left;
    },
    get bottom_right() {
        return this.bottom && this.right;
    },
    get top() {
        return (this._mouse_arg != null && this._window_focusing) && Math.abs(this._window_focusing._tracking.anchor_y - this._mouse_arg.pageY) <= this._lim_range;
    },
    get bottom() {
        return (this._mouse_arg != null && this._window_focusing) && Math.abs(this._window_focusing._tracking.anchor_y + this._window_focusing.getHeight() - this._mouse_arg.pageY) <= this._lim_range;
    },
    get left() {
        return (this._mouse_arg != null && this._window_focusing) && Math.abs(this._window_focusing._tracking.anchor_x - this._mouse_arg.pageX) <= this._lim_range;
    },
    get right() {
        return (this._mouse_arg != null && this._window_focusing) && Math.abs(this._window_focusing._tracking.anchor_x + this._window_focusing.getWidth() - this._mouse_arg.pageX) <= this._lim_range;
    },
    get all() {
        return this.top_left || this.top_right || this.top || this.left || this.right || this.bottom;
    }
}

var _mouse_move_service = {
    serivce_mouse_move: null,
    serivce_mouse_down: null,
    serivce_mouse_up: null,
    turnOn: function () {
        if (this.serivce_mouse_move == null) {
            this.serivce_mouse_move = senjs.app.service.register.onMouseMove((service, args) => {
                if (_window_focusing == null || _window_focusing._tracking == undefined) {
                    return;
                }
                // args.stopPropagation();
                // args.preventDefault();
                try {
                    switch (_window_focusing._tracking.action) {
                        case _WINDOW_ACTION.NONE:
                            _canResize.bind(_window_focusing, args);
                            if (_canResize.top_left || _canResize.bottom_right) {
                                document.body.style.cursor = 'nwse-resize';
                                _window_focusing._views.pn_toolbar.setCursor('nwse-resize');
                                _window_focusing._views.pn_outline.setVisibility(senjs.constant.Visibility.VISIBLE);
                            } else if (_canResize.top_right || _canResize.bottom_left) {
                                document.body.style.cursor = 'nesw-resize';
                                _window_focusing._views.pn_toolbar.setCursor('nesw-resize');
                                _window_focusing._views.pn_outline.setVisibility(senjs.constant.Visibility.VISIBLE);
                            } else if (_canResize.top || _canResize.bottom) {
                                document.body.style.cursor = 'row-resize';
                                _window_focusing._views.pn_toolbar.setCursor('row-resize');
                                _window_focusing._views.pn_outline.setVisibility(senjs.constant.Visibility.VISIBLE);
                            } else if (_canResize.left || _canResize.right) {
                                _window_focusing._views.pn_outline.setVisibility(senjs.constant.Visibility.VISIBLE);
                                document.body.style.cursor = 'col-resize';
                            } else {
                                document.body.style.cursor = 'initial';
                                _window_focusing._views.pn_toolbar.setCursor('pointer');
                                _window_focusing._views.pn_outline.setVisibility(senjs.constant.Visibility.GONE);
                            }
                            break;
                        case _WINDOW_ACTION.RESIZE_TOP_LEFT:
                            var range_x = args.pageX - _window_focusing._tracking.capture_mouse_x,
                                range_y = args.pageY - _window_focusing._tracking.capture_mouse_y;
                            _window_focusing
                                .setAnchor(_window_focusing._tracking.capture_anchor_x + range_x, _window_focusing._tracking.capture_anchor_y + range_y)
                                .setWidth(_window_focusing._tracking.width - range_x)
                                .setHeight(_window_focusing._tracking.height - range_y);
                            break;
                        case _WINDOW_ACTION.RESIZE_TOP_RIGHT:
                            var range_x = args.pageX - _window_focusing._tracking.capture_mouse_x,
                                range_y = args.pageY - _window_focusing._tracking.capture_mouse_y;
                            _window_focusing
                                .setWidth(_window_focusing._tracking.width + range_x)
                                .setHeight(_window_focusing._tracking.height - range_y)
                                .setAnchor(_window_focusing._tracking.capture_anchor_x, _window_focusing._tracking.capture_anchor_y + range_y);
                            break;
                        case _WINDOW_ACTION.RESIZE_BOTTOM_LEFT:
                            var range_x = args.pageX - _window_focusing._tracking.capture_mouse_x,
                                range_y = args.pageY - _window_focusing._tracking.capture_mouse_y;
                            _window_focusing
                                .setAnchor(_window_focusing._tracking.capture_anchor_x + range_x, _window_focusing._tracking.capture_anchor_y)
                                .setWidth(_window_focusing._tracking.width - range_x)
                                .setHeight(_window_focusing._tracking.height + range_y);
                            break;
                        case _WINDOW_ACTION.RESIZE_BOTTOM_RIGHT:
                            var range_x = args.pageX - _window_focusing._tracking.capture_mouse_x,
                                range_y = args.pageY - _window_focusing._tracking.capture_mouse_y;
                            _window_focusing
                                .setWidth(_window_focusing._tracking.width + range_x)
                                .setHeight(_window_focusing._tracking.height + range_y)
                                .setAnchor(_window_focusing._tracking.capture_anchor_x, _window_focusing._tracking.capture_anchor_y);
                            break;
                        case _WINDOW_ACTION.RESIZE_LEFT:
                            var range_x = args.pageX - _window_focusing._tracking.capture_mouse_x;
                            _window_focusing
                                .setAnchor(_window_focusing._tracking.capture_anchor_x + range_x, _window_focusing._tracking.capture_anchor_y)
                                .setWidth(_window_focusing._tracking.width - range_x);
                            break;
                        case _WINDOW_ACTION.RESIZE_RIGHT:
                            var range_x = args.pageX - _window_focusing._tracking.capture_mouse_x;
                            _window_focusing.setWidth(_window_focusing._tracking.width + range_x);
                            break;
                        case _WINDOW_ACTION.RESIZE_TOP:
                            var range_y = args.pageY - _window_focusing._tracking.capture_mouse_y;
                            _window_focusing
                                .setAnchor(_window_focusing._tracking.capture_anchor_x, _window_focusing._tracking.capture_anchor_y + range_y)
                                .setHeight(_window_focusing._tracking.height - range_y);
                            break;
                        case _WINDOW_ACTION.RESIZE_BOTTOM:
                            var range_y = args.pageY - _window_focusing._tracking.capture_mouse_y;
                            _window_focusing.setHeight(_window_focusing._tracking.height + range_y);
                            break;
                        case _WINDOW_ACTION.MOVE:
                            var range_x = args.pageX - _window_focusing._tracking.capture_mouse_x;
                            var range_y = args.pageY - _window_focusing._tracking.capture_mouse_y;
                            _window_focusing.setAnchor(_window_focusing._tracking.capture_anchor_x + range_x, _window_focusing._tracking.capture_anchor_y + range_y);
                            break;
                    }
                } catch (ex) {
                    service.remove();
                }

            });
            this.serivce_mouse_down = senjs.app.service.register.onMouseDown((service, args) => {
                if (_window_focusing == null || _window_focusing._tracking == undefined || _window_focusing._tracking.action == _WINDOW_ACTION.NONE) {
                    return;
                }
                _canResize.bind(_window_focusing, args);
                if (_canResize.top_left) {
                    _window_focusing._tracking.action = _WINDOW_ACTION.RESIZE_TOP_LEFT;
                } else if (_canResize.top_right) {
                    _window_focusing._tracking.action = _WINDOW_ACTION.RESIZE_TOP_RIGHT;
                } else if (_canResize.bottom_left) {
                    _window_focusing._tracking.action = _WINDOW_ACTION.RESIZE_BOTTOM_LEFT;
                } else if (_canResize.bottom_right) {
                    _window_focusing._tracking.action = _WINDOW_ACTION.RESIZE_BOTTOM_RIGHT;
                } else if (_canResize.top) {
                    _window_focusing._tracking.action = _WINDOW_ACTION.RESIZE_TOP;
                } else if (_canResize.bottom) {
                    _window_focusing._tracking.action = _WINDOW_ACTION.RESIZE_BOTTOM;
                } else if (_canResize.left) {
                    _window_focusing._tracking.action = _WINDOW_ACTION.RESIZE_LEFT;
                } else if (_canResize.right) {
                    _window_focusing._tracking.action = _WINDOW_ACTION.RESIZE_RIGHT;
                }
                if (_window_focusing._tracking.action != _WINDOW_ACTION.NONE) {
                    _window_focusing._tracking.capture_mouse_x = args.pageX;
                    _window_focusing._tracking.capture_mouse_y = args.pageY;
                    _window_focusing._tracking.capture_anchor_x = _window_focusing._tracking.anchor_x;
                    _window_focusing._tracking.capture_anchor_y = _window_focusing._tracking.anchor_y;
                }
            })
            this.serivce_mouse_up = senjs.app.service.register.onMouseUp((service, args) => {
                // args.stopPropagation();
                // args.preventDefault();
                if (_window_focusing == null) {
                    return;
                }
                switch (_window_focusing._tracking.action) {
                    case _WINDOW_ACTION.RESIZE_TOP:
                    case _WINDOW_ACTION.RESIZE_BOTTOM:
                    case _WINDOW_ACTION.RESIZE_LEFT:
                    case _WINDOW_ACTION.RESIZE_RIGHT:
                    case _WINDOW_ACTION.RESIZE_TOP_LEFT:
                    case _WINDOW_ACTION.RESIZE_TOP_RIGHT:
                    case _WINDOW_ACTION.RESIZE_BOTTOM_LEFT:
                    case _WINDOW_ACTION.RESIZE_BOTTOM_RIGHT:
                        _window_focusing._tracking.action = _WINDOW_ACTION.NONE;
                        _window_focusing._tracking.width = _window_focusing.getWidth();
                        _window_focusing._tracking.height = _window_focusing.getHeight();
                        break;
                }

            });
        }
    },
    turnOff: function () {
        if (this.serivce_mouse_move && _pool_windows.size() == 0) {
            this.serivce_mouse_move.remove();
            this.serivce_mouse_down.remove();
            this.serivce_mouse_up.remove();
            this.serivce_mouse_move = null;
            this.serivce_mouse_down = null;
            this.serivce_mouse_up = null;
        }
    }
}


var _WINDOW_ACTION = {
    NONE: 0,
    MOVE: 1,
    RESIZE_LEFT: 3,
    RESIZE_RIGHT: 4,
    RESIZE_TOP: 5,
    RESIZE_BOTTOM: 6,
    RESIZE_TOP_LEFT: 7,
    RESIZE_TOP_RIGHT: 8,
    RESIZE_BOTTOM_LEFT: 9,
    RESIZE_BOTTOM_RIGHT: 10
}

export class WindowLayout extends BaseLayout {
    constructor() {
        super('100%', '100%');
    }

    onInit() {
        super.onInit();
        this.setAnimation('window-open')
            .setScrollType(senjs.constant.ScrollType.NONE);
        this.toTopParent().toLeftParent();
        this._initView();
        this._initEvent();
        this.setClassName('senjs-window-layout').setCss({ 'visibility': 'hidden' });
        this.setBackground("#ffffff");
        this._tracking = {
            action: _WINDOW_ACTION.NONE,
            move_actived: false,
            is_fullscreen: false,
            capture_mouse_x: 0,
            capture_mouse_y: 0,
            capture_anchor_x: 0,
            capture_anchor_y: 0,
            anchor_x: 0,
            anchor_y: 0,
            width: 0,
            height: 0,
            has_active_resize: _WINDOW_ACTION.NONE,
            waiter_resize: null
        }
        _pool_windows.add(this);
        let cb = () => {
            let str = this.showMessWhenUserTurnOffSite();
            console.log(str);
            return str.length > 0 ? str : false;
        };
        window.addEventListener("beforeunload", cb);
        this.events.override.onDestroy(() => {
            window.removeEventListener("beforeunload", cb);
        });
    }

    showMessWhenUserTurnOffSite() {
        return "";
    }

    _onCreated(view) {
        _window_focusing = this;
        this._tracking.height = this.getHeight();
        this._tracking.width = this.getWidth();

        var left = this.getLeft() > 0 ? this.getLeft() : (this.getParentView().getWidth() - this._tracking.width) / 2,
            top = this.getTop() > 0 ? this.getTop() : (this.getParentView().getHeight() - this._tracking.height) / 2;
        this.setAnchor(left, top);
        this.setCss({ 'visibility': 'visible' });
        this.bringWindowToFront();
    }

    _initView() {
        this._views = {
            pn_toolbar: new senjs.layout.LinearLayout().setGravity(senjs.constant.Gravity.CENTER_RIGHT).setShadow("rgba(0,0,0,0.1)", 0, 0, 2)
                .setPadding('0.1em').setCursor("pointer")
                .setBackground(senjs.res.material_colors.Grey.g200),
            pn_body: new senjs.layout.FrameLayout().setBackground("#ffffff"),
            lb_title: new senjs.widget.TextView("Window " + (_pool_windows.size() + 1)).toFillParent()
                .setTextAlign('center').setTextSize("0.8em")
                .setTextGravity(senjs.constant.Gravity.CENTER).setLeft("0.5em"),
            btn_close: new senjs.widget.IconView('cancel').setIconSize('1.2em').setIconColor(senjs.res.material_colors.Red.g500).setRight('0.1em'),
            btn_full_screen: new senjs.widget.IconView('add_circle').setIconSize('1.2em').setIconColor(senjs.res.material_colors.Green.gA700).setRight('0.1em'),
            pn_outline: new senjs.layout.FrameLayout().toFillParent()
                .setLeft(0 - _canResize._lim_range).setRight(0 - _canResize._lim_range)
                .setTop(0 - _canResize._lim_range).setBottom(0 - _canResize._lim_range)
                .setBackground("transparent").setVisibility(senjs.constant.Visibility.GONE)
        }

        this._views.pn_toolbar
            .addView(this._views.lb_title)
            .addView(this._views.btn_full_screen)
            .addView(this._views.btn_close);
        this.getDOM().style.overflow = 'hidden';
        this._views.pn_toolbar.toTopParent().toLeftParent().toRightParent();
        this._views.pn_body.toBottomParent().toLeftParent().toRightParent().toBelowOf(this._views.pn_toolbar).setScrollType(senjs.constant.ScrollType.BOTH);

        super.addView(this._views.pn_outline);
        super.addView(this._views.pn_body);
        super.addView(this._views.pn_toolbar);

        this
            .setMinWidth(240).setMinHeight(240)
            .setShadow("rgba(0,0,0,0.2)", 0, 0, 3);
    }

    _initEvent() {
        new MouseChangeListener(this._onMouseChanged.bind(this)).bindToView(this._views.pn_toolbar);
        new MouseChangeListener(this._onMouseChanged.bind(this)).bindToView(this._views.pn_body);
        new MouseChangeListener(this._onMouseChanged.bind(this)).bindToView(this);
        this.events.override.onCreated(this._onCreated.bind(this));
        this.events.override.onDestroy(this._onDestroy.bind(this));
        _mouse_move_service.turnOn();

        // Toolbar button event
        this._views.btn_close.setOnClick(this._onClicked.bind(this));
        this._views.btn_full_screen.setOnClick(this._onClicked.bind(this));
        this._views.pn_toolbar.setOnDoubleClick(this._onClicked.bind(this));
    }

    setFullScreen(flag) {
        this.setTransitionAll('.25', 'ease-out');
        this._tracking.is_fullscreen = flag;
        if (this._tracking.is_fullscreen) {
            this._tracking.width = this.getWidth();
            this._tracking.height = this.getHeight();
            this.setLeft(0).setTop(0).setWidth('100%').setHeight('100%');
            this._views.btn_full_screen.setIcon("remove_circle_outline")
        } else {
            this.setAnchor(this._tracking.anchor_x, this._tracking.anchor_y).setWidth(this._tracking.width).setHeight(this._tracking.height);
            //    this.setTranslateX(`translate3d(${})`)
            this._views.btn_full_screen.setIcon("add_circle")
        }
        this.postDelay(() => {
            this.setTransitionAll('0');
        }, 50)
        return this;
    }

    _onClicked(view) {
        switch (view) {
            case this._views.btn_close:
                this._views.pn_body.setVisibility(senjs.constant.Visibility.GONE);
                this.destroyWithAnimate();
                break;
            case this._views.btn_full_screen:
            case this._views.pn_toolbar:
                this._tracking.is_fullscreen = !this._tracking.is_fullscreen;
                this.setFullScreen(this._tracking.is_fullscreen);
                break;
        }
    }


    _onMouseChanged(view, args) {
        if (this._tracking.is_fullscreen) {
            return;
        }
        switch (args.action) {
            case MouseChangeListener.MotionAction.MOUSE_DOWN:
                _window_focusing = this;
                this.bringWindowToFront();
                this._tracking.capture_mouse_x = args._e.pageX;
                this._tracking.capture_mouse_y = args._e.pageY;
                this._tracking.capture_anchor_x = this._tracking.anchor_x;
                this._tracking.capture_anchor_y = this._tracking.anchor_y;
                _canResize.bind(this, args._e);
                if (view == this && this._tracking.action == _WINDOW_ACTION.NONE && _canResize.all) {
                    this._tracking.width = this.getWidth();
                    this._tracking.height = this.getHeight();
                    if (_canResize.top_left) {
                        this._tracking.action = _WINDOW_ACTION.RESIZE_TOP_LEFT;
                    } else if (_canResize.top_right) {
                        this._tracking.action = _WINDOW_ACTION.RESIZE_TOP_RIGHT;
                    } else if (_canResize.bottom_left) {
                        this._tracking.action = _WINDOW_ACTION.RESIZE_BOTTOM_LEFT;
                    } else if (_canResize.bottom_right) {
                        this._tracking.action = _WINDOW_ACTION.RESIZE_BOTTOM_RIGHT;
                    } else if (_canResize.left) {
                        this._tracking.action = _WINDOW_ACTION.RESIZE_LEFT;
                    } else if (_canResize.right) {
                        this._tracking.action = _WINDOW_ACTION.RESIZE_RIGHT;
                    } else if (_canResize.top) {
                        this._tracking.action = _WINDOW_ACTION.RESIZE_TOP;
                    } else if (_canResize.bottom) {
                        this._tracking.action = _WINDOW_ACTION.RESIZE_BOTTOM;
                    }
                } else if (view == this._views.pn_toolbar) {
                    this._tracking.action = _WINDOW_ACTION.MOVE;
                    this._views.pn_toolbar.setCursor("move");
                    this.setShadow("rgba(0,0,0,0.4)", 0, 0, 8);
                }
                break;
            case MouseChangeListener.MotionAction.MOUSE_UP:
                this._tracking.action = _WINDOW_ACTION.NONE;
                this._tracking.width = this.getWidth();
                this._tracking.height = this.getHeight();
                if (view == this._views.pn_toolbar) {
                    this._views.pn_toolbar.setCursor("pointer");
                    this.setShadow("rgba(0,0,0,0.2)", 0, 0, 4);
                }
                break;
        }
    }

    _onDestroy() {
        _pool_windows.remove(this);
        if (_pool_windows.size() > 0) {
            _pool_windows.last().bringWindowToFront();
        }
        _mouse_move_service.turnOff();
    }

    setWindowName(text) {
        this._views.lb_title.setText(text);
        return this;
    }

    setAnchor(x, y) {
        this._tracking.anchor_x = x;
        this._tracking.anchor_y = y;
        this.setLeft(x).setTop(y);
        // this.setTransform(`translate3d(${x}px,${y}px,0px)`)
        return this;
    }

    bringWindowToFront() {
        try {
            var z_index_largest = 1;
            var z_index_largest_window = null;
            var same_parent = _pool_windows.filter((item) => {
                return item.getParentView() == this.getParentView();
            })
            same_parent.foreach((item) => {
                if (item.getZIndex() > z_index_largest) {
                    z_index_largest = item.getZIndex();
                    z_index_largest_window = item;
                }
                if (item != this) {
                    item.blur();
                }
            });
            if (z_index_largest_window) {
                z_index_largest_window.setZIndex(this.getZIndex());
                this.setZIndex(z_index_largest);
                this._views.pn_toolbar.setBackground(senjs.res.material_colors.Grey.g200);
                if (this._views.pn_blur) {
                    this._views.pn_blur.destroy();
                    this._views.pn_blur = null;
                }
            }
        } catch (err) {

        }

    }

    blur() {
        if (this._views.pn_blur == undefined) {
            this._views.pn_blur = new senjs.layout.FrameLayout().toFillParent().toBelowOf(this._views.pn_toolbar).setBackground("rgba(255,255,255,0.02)");
            this._views.pn_blur.setClassName('senjs-focus-out');
            this._views.pn_toolbar.setBackground(senjs.res.material_colors.Grey.g400);
            super.addView(this._views.pn_blur);
        }
    }

    addView(view) {
        this._views.pn_body.addView(view);
        return this;
    }

    addViewAt(view, index) {
        this._views.pn_body.addViewAt(view, index);
        return this;
    }

    getViewAt(index) {
        return this._views.pn_body.getViewAt(index);
    }

    removeAllView() {
        this._views.pn_body.removeAllView();
        return this;
    }

    removeChildAt(index) {
        this._views.pn_body.removeChildAt(index);
        return this;
    }

    removeChild(view) {
        this._views.pn_body.removeChild(view);
        return this;
    }

    getAllViews() {
        return this._views.pn_body.getAllViews();
    }

    childCount() {
        return this._views.pn_body.childCount();
    }

    /**
     * @returns {View}
     */
    getBody(){
        return this._views.pn_body;
    }

    setWidth(val) {
        super.setWidth(val);
        if (this._views) {
            this._views.pn_body.setVisibility(senjs.constant.Visibility.INVISIBLE);
            if (this._tracking.waiter_resize) {
                this._tracking.waiter_resize.remove();
            }
            this._tracking.waiter_resize = this.postDelay(() => {
                this._views.pn_body.setVisibility(senjs.constant.Visibility.VISIBLE);
                this._tracking.waiter_resize = null;
            }, 200);
        }

        return this;
    }

    setHeight(val) {
        super.setHeight(val);
        if (this._views) {
            this._views.pn_body.setVisibility(senjs.constant.Visibility.INVISIBLE);
            if (this._tracking.waiter_resize) {
                this._tracking.waiter_resize.remove();
            }
            this._tracking.waiter_resize = this.postDelay(() => {
                this._views.pn_body.setVisibility(senjs.constant.Visibility.VISIBLE);
                this._tracking.waiter_resize = null;
            }, 200);
        }
        return this;
    }

    setGravity(gravity) {
        this._views.pn_body.setGravity.apply(this._views.pn_body, arguments);
        return this;
    }

    setBackground(value) {
        super.setBackground(value);
        this._views.pn_body.setBackground(value);
        return this;
    }

    saveStateAndClose() {
        this.getParentView().getDOM().removeChild(this.getDOM());
    }

    restore() {
        this.getParentView().getDOM().appendChild(this.getDOM());
    }
}