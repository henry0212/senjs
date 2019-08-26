"use strict";

import { app, Thread, Waiter, isMobile, senjsCts, brownserType } from './app-context.js'
import { app_constant, app_animation } from '../res/constant.js'
import { List } from '../util/list-util.js';
import { StringUtil } from '../util/string-util.js';
import { senjs } from '../index.js';
import { ClickListener, ScrollListener, TouchListener, FocusChangeListener, DoubleClickListener } from './event-v2.js';

var countAnimation = 0;

/**
 * @typedef {Object} View
 * 
 */
export class View {
    constructor(htmlElement) {
        this.TAG = this.constructor.name;

        this._dom = htmlElement || document.createElement("div");
        this._super = {};
        this._addViews = null;
        Object.defineProperty(this, "__meta", { value: {}, writable: false });
        Object.defineProperty(this, "_senjs", { value: senjs, writable: false });
        //var self = this;
        // var obj_keys = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
        // for (var i = 0; i < obj_keys.length; i++) {
        //     if (this[obj_keys[i]]) {
        //         this[obj_keys[i]] = (this[obj_keys[i]]).bind(self);
        //     } else {
        //         console.log(obj_keys[i])
        //     }
        // }
        this._init_();
        this.setDisplayType(app_constant.Display.BLOCK)
            .setBoxSizing("border-box");
        if (this.info.id == -1) {
            senjsCts.add(this);
        }
    }

    _init_() {
        this._prepare();
        this.appEvent = app.event.init(this);
        this.events.override.onCreated(this.onCreated.bind(this));
        this.events.override.onDestroy(this.onDestroy.bind(this));
        this.events.override.onPaused(this.onPause.bind(this));
        this.events.override.onResume(this.onResume.bind(this));
        this.events.override.onMeasured(this.onMeasured.bind(this));
        this._cache = {
            __state: {

            }
        }
        this.setScrollType(app_constant.ScrollType.NONE)
            .setPosition(app_constant.Position.RELATIVE);

        Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter((item) => {
            return item.indexOf("override_") > -1;
        }).forEach(ovr_func => {
            var real_func = ovr_func.replace("override_", "");
            if (this.events.override[real_func] != undefined) {
                this.events.override[real_func](this[ovr_func].bind(this));
            }
        });
        if (this._addviews) {
            Object.keys(this._addviews).forEach(key => {
                this.addView(this._addviews[key]);
            });
        }
    }
    /**
     * Call when the view have been created
     * @param {View} view
     * @description the callback need pass view param
     */

    onCreated(view) {

    }

    /**
        *  Call when the view not show on screen
         * @param {View} view
         * @description the callback need pass view param
    */
    onPause(view) {

    }

    /**
       * Call when the view show on screen again
       * @param {View} view
       * @description the callback need pass view param
    */
    onResume(view) {

    }


    /**
       * Call when the view have been remove on screen
       * @param  {View} view
       * @description the callback need pass view param
    */
    onDestroy(view) {

    }

    /**
      * Call when the view render finish
      * @param  {View} view
      * @description the callback need pass view param
   */
    onMeasured(view, width, height) {

    }


    _prepare() {
        var self = this;
        var self_thread = {
            pause: null,
            resume: null
        }
        this.define = {
            CONTROL_TYPE: ""
        }
        this.deep = {
            resumseChilds: new List(),
            pauseChilds: new List()
        }

        var _info = {
            arrangeLayoutType: -1,
            absoluteZindex: -1,
            isModifiedId: false,
            allowMove: true,
            lumenManualColor: null,
            allowClick: true,
            noChangeBackground: false,
            textColor: null,
            clearTrashCount: 0,
            clearTrashCount2: 0,
            measuredCount: 0,
            isCreated: false,
            isDestroy: false,
            isPaused: false,
            isFocusing: false,
            state: app_constant.VIEW_STATE.undefined,
            position: -1,
            hasCallCreatedStack: false,
            threadActions: {
                removeChild: null
            },
            arrayActions: {
                removeChildId: new Array()
            },
            className: "",
            ratio_width: -1,
            ratio_height: -1,
            ratio_minHeight: -1,
            ratio_minWidth: -1,
            ratio_textSize: -1,
            ratio_textSizeWithParent: -1,
            display: "block",
            hide: false,
            childControls: new Array(),
            parents: new Array(),
            parent: -1,
            estimate_parent: -1,
            estimate_parents: new Array(),
            top: -1,
            pushTop: -1,
            left: -1,
            pushLeft: -1,
            right: -1,
            pushRight: -1,
            bottom: -1,
            pushBottom: -1,
            translateX: 0,
            translateY: null,
            tag: null,
            isEnableTouch: false,
            onSwipeLeftListener: null,
            onSwipeRightListener: null,
            dragVerCallBack: null,
            dragHorCallBack: null,
            childControlId: 0,
            id: -1,
            uid: "",
            isScrollX: false,
            isScrollY: false,
            scrollType: app_constant.ScrollType.NONE,
            SCALE: 1,
            onSwipeToRemoveListener: null,
            onLongClickListener: null,
            onMoveListener: null,
            isClicked: false,
            onDoubleClickListener: null,
            onTripleClickListener: null,
            allowDragRemoveItem: false,
            isParentDoubleClick: false,
            isParentTripleClick: false,
            isDock: false,
            onMouseRightClickListener: null,
            onMouseDown: null,
            onMouseUp: null,
            onRightMenuShowing: null,
            onRightMenuClosing: null,
            onPinnedListener: null,
            allowAnimClicked: true,
            animateDivs: new Array,
            zIndex: -1,
            isAutoTextColor: false,
            isLongClick: false,
            bgColor: "",
            icon: null,
            waitId: false,
            windowId: -1,
            prevent_trash_cleaner: false,
            display_type: "block",
            prevent_measure_callback: false,
            visibility: app_constant.Visibility.VISIBLE,
            classNames: new List(),
            stackPostDelay: new List(),
            touch_state: -1,
            border: {
                all: { size: 0, color: "" },
                left: { size: 0, color: "" },
                right: { size: 0, color: "" },
                top: { size: 0, color: "" },
                bottom: { size: 0, color: "" }
            },
            override: {
                onDestroy: null,
                onChangeSize: null,
                onClicked: null
            },
            orderViews: []
        }
        this.layout = {
            centerVertical: function () {
                if (self.info.parent < 0 || !self.info.isCreated) {
                    self.setOpacity(0);
                    self.events.override.onCreated(function (view) {
                        view.layout.centerVertical();
                        self.setOpacity(1);
                    });
                    return self;
                }
                self.events.override.onResume(function (view) {
                    if (self.getTop() == 0) {
                        self.layout.centerVertical();
                    } else {
                        self.events.override.variables.resumeCallback.remove(this);
                    }
                });

                var parent = self.getParentView();
                if (parent != null) {
                    var h = parent._dom.clientHeight - parent.getPaddingTop() - parent.getPaddingBottom();
                    var ch = self._dom.offsetHeight;
                    //var val = ((h - ch) / 2);
                    //self.setTop(val > 0 ? val : 0);
                    self.setPercentTop(h > ch ? (ch * 100 / h) / 2 : 0);
                }
                return self;
            },
            centerHorizontal: function () {
                if (self.info.parent < 0 || !self.info.isCreated) {
                    self.setOpacity(0);
                    self.events.override.onCreated(function (view) {
                        view.layout.centerHorizontal();
                        self.setOpacity(1);
                    });
                    return self;
                }
                self.events.override.onResume(function (view) {
                    if (self.getTop() == 0) {
                        self.layout.centerHorizontal();
                    } else {
                        self.events.override.variables.resumeCallback.remove(this);
                    }
                });

                var parent = self.getParentView();
                if (parent != null) {
                    var h = parent._dom.clientWidth - parent.getPaddingLeft() - parent.getPaddingRight();
                    var ch = self._dom.offsetWidth;
                    self.setPercentLeft(h > ch ? (ch * 100 / h) / 2 : 0);
                }
                return self;
            }
        }
        this.events = {
            override: {
                thread: {
                    resume: null,
                    pause: null
                },
                variables: {
                    declare_funcs: new List(),
                    createCallback: new Array(),
                    resizeCallback: new Array(),
                    beforeDestroyCallBack: new List(),
                    destroyCallBack: new List(),
                    addViewCallBack: new List(),
                    pauseCallback: new List(),
                    resumeCallback: new List(),
                    onFocusChanged: new List(),
                    onKeyChangedCallback: new List(),
                    onMouseDownCallback: new List(),
                    onMouseUpCallback: new List(),
                    onRenderedCallback: new List(),
                    onClickedCallback: null,
                    onRemovedChild: new List(),
                    onScrolledCallbacks: new List(),
                    onMeasuredCallbacks: new List(),
                    onTouchCallbacks: new List(),
                },
                onCreated: function (listener) {
                    if (self.hasCreated) {
                        listener(self);
                        return;
                    }
                    self.events.override.variables.createCallback.push(listener);
                    return self;
                },
                onBeforeDestroy: function (listener) {
                    self.events.override.variables.beforeDestroyCallBack.add(listener);
                    return self;
                },
                onDestroy: function (listener) {
                    self.info.override.onDestroy = listener;
                    self.events.override.variables.destroyCallBack.add(listener);
                    return self;
                },
                onChangeSize: function (listener) {
                    return self;
                },
                onAddView: function (listener) {
                    self.events.override.variables.addViewCallBack.add(listener);
                    return self;
                },
                onClicked: function (callback) {
                    self.events.override.variables.onClickedCallback = callback;
                    return self;
                },
                onMouseDown: function (listener) {
                    self.events.override.variables.onMouseDownCallback.add(listener);
                    return self;
                },
                onMouseUp: function (listener) {
                    self.events.override.variables.onMouseUpCallback.add(listener);
                    return self;
                },
                onPaused: function (listener) {
                    self.events.override.variables.pauseCallback.add(listener);
                    return self;
                },
                onResume: function (listener) {
                    self.events.override.variables.resumeCallback.add(listener);
                    return self;
                },
                onFocusChanged: function (listener) {
                    self.events.override.variables.onFocusChanged.add(listener);
                    return self;
                },
                onKeyChanged: function (listener) {
                    self.events.override.variables.onKeyChangedCallback.add(listener);
                    return self;
                },
                onRendered: function (listener) {
                    self.events.override.variables.onRenderedCallback.add(listener);
                    return self;
                },
                onRemovedChild: function (listener) {
                    self.events.override.variables.onRemovedChild.add(listener);
                    return self;
                },
                /**
                 * 
                 * @param {import('./event-v2.js').scroll_listener} listener 
                 */
                onScrolled: function (listener) {
                    self.events.override.variables.onScrolledCallbacks.add(listener);
                    if (self._dom.onscroll == undefined) {
                        new ScrollListener((view, args) => {

                        }).bindToView(self);
                    }
                },
                onTouched: function (listener) {
                    self.events.override.variables.onTouchCallbacks.add(listener);
                    self.setOnTouch(new TouchListener(() => { }));
                },
                onMeasured: function (listener) {
                    this.variables.onMeasuredCallbacks.add(listener);
                },
            },
            layout: {
                onLeftOf: null,
                onRightOf: null,
                onBelowOf: null,
                onAboveOf: null,

            },
            perform: {
                click: function () {
                    self._dom.click();

                }
            },
            system: {
                measure_variables: {
                    width: -1,
                    height: -1,
                    relativeLeft: -1,
                    relativeTop: -1,
                },
                init: {
                    focusChanged: function () {
                        self._dom.addEventListener("focus", function () {
                            self.info.isFocusing = true;
                            self.events.override.variables.onFocusChanged.foreach(function (call, idx) {
                                call(self, true);
                            });
                        }, false);
                        self._dom.addEventListener("blur", function () {
                            self.info.isFocusing = false;
                            self.events.override.variables.onFocusChanged.foreach(function (call, idx) {
                                call(self, false);
                            });
                        }, false);
                        self._dom.addEventListener("click", function () {
                        });
                    },
                    mouseChanged: function () {
                        self._dom.addEventListener("mousedown", function (event) {
                            self.events.override.variables.onMouseDownCallback.foreach(function (call, idx) {
                                call(self, event);
                            });
                        });
                        self._dom.addEventListener("mouseup", function (event) {
                            self.events.override.variables.onMouseUpCallback.foreach(function (call, idx) {
                                call(self, event);
                            });
                        });
                    }
                },
                created: function () {
                    var parent = self.getParentView();
                    if (parent != null) {
                        self.info.parents = parent.info.parents.slice(0);
                        self.info.parents.push(parent.info.id);
                        self.info.prevent_trash_cleaner = parent.info.prevent_trash_cleaner;
                        self.info.state = parent.info.state;
                    }
                    self.events.system.init.focusChanged();
                    self._dom.id = "view" + self.info.id;
                    if (!isMobile.any()) {
                        self.events.system.init.mouseChanged();
                    }
                    if (!self.info.hasCallCreatedStack) {
                        self.info.hasCallCreatedStack = true;
                        var cb_created;
                        while ((cb_created = self.events.override.variables.createCallback.shift())) {
                            cb_created.call(self, self);
                        }
                    }

                    this.measured();
                    if (self.events.override.variables.resumeCallback.size() > 0) {
                        let delay = senjsCts.allParents(self.info.id).reduce((a, item) => {
                            return a < item.getAnimationDuration() ? item.getAnimationDuration() : a;
                        }, 0);
                        if (delay > 0) {
                            self.postDelay(() => {
                                self.events.override.variables.resumeCallback.foreach(function (call) {
                                    call.call(self, self);
                                });
                            }, delay + 50);
                        } else {
                            self.events.override.variables.resumeCallback.foreach(function (call) {
                                call.call(self, self);
                            });
                        }
                    }
                },
                destroy: function () {
                    self.addView = function (view) { };
                    if (self.events.override.variables.beforeDestroyCallBack.size() > 0) {
                        self.events.override.variables.beforeDestroyCallBack.foreach(function (item, count) {
                            if (item instanceof Function || item === "function") {
                                item.call(self, self);
                            }
                        });
                        self.events.override.variables.beforeDestroyCallBack.clear();
                    }
                    self.events.override.variables.beforeDestroyCallBack.clear();
                    if (self._cache._destroyAnim) {
                        self.setAnimation(self._cache._destroyAnim);
                        new Waiter(() => {
                            if (self._cache) {
                                self._cache._destroyAnim = null;
                            }
                            self.events.system.destroy();
                        }, self.getAnimationDuration())
                        return self;
                    }
                    self.info.isDestroy = true;
                    var p = self.getParentView();
                    if (p != null) {
                        if (p.info.childControls.indexOf(self.info.id) > -1) {
                            p.info.childControls.splice(p.info.childControls.indexOf(self.info.id), 1);
                        }
                        if (p._dom.contains(self._dom)) {
                            p._dom.removeChild(self._dom);
                        } else if (self._dom && typeof (self._dom.remove) === 'function') {
                            self._dom.remove();
                        }

                        p.events.override.variables.onRemovedChild.foreach(function (call, position) {
                            call(p, self);
                        });
                        //app.senjs_viewPool.allRootChilds(p.info.id).foreach(function (child, position) {
                        //    console.log("Destroy Child: " + child.info.id);
                        //});
                    }
                    self.events.override.variables.destroyCallBack.foreach(function (item, count) {
                        if (item instanceof Function || typeof item === "function") {
                            item.call(self, self);
                        }
                    });
                    var rootChilds = app.senjs_viewPool.allRootChilds(self.info.id);
                    if (rootChilds.size() > 0) {
                        rootChilds.foreach(function (removeChild, i) {
                            removeChild.info.isDestroy = true;

                            if (removeChild.info.uid != null) {
                                app.idPool.remove(removeChild.info.id);
                            }
                            app.senjs_viewPool.remove(removeChild.info.id);
                        });

                        /* detect all childs that exist callback after destroy, get all call event */
                        rootChilds.filter(function (temp) { return temp != null && temp.events.override.variables.destroyCallBack.size() > 0 }).foreach(function (child, postion) {
                            child.events.override.variables.destroyCallBack.foreach(function (item, count) {
                                if (item instanceof Function || item === "Function" || item === "function") {
                                    try {
                                        item(child);
                                    } catch (ex) {
                                        console.log(ex.message);
                                    }
                                }
                            });
                        });

                    }
                    if (self.info.uid != null) {
                        app.idPool.remove(self.info.id);
                    }
                    self.info.stackPostDelay.foreach(function (delayFunc) {
                        delayFunc.remove();
                    });
                    app.senjs_viewPool.remove(self.info.id);

                    return self;
                },
                pause: function () {
                    self.info.state = app_constant.VIEW_STATE.pause;
                    self.info.isPaused = true;
                    var count = 0;
                    if (self_thread.pause != null) {
                        self_thread.pause.remove();
                    }
                    if (self_thread.resume != null) {
                        self_thread.resume.remove();
                    }

                    var allRootChilds = app.senjs_viewPool.allRootChilds(self.info.id).filter(function (item) {
                        item.info.state = app_constant.VIEW_STATE.pause;
                        return item.events.override.variables.pauseCallback.size() > 0;
                    });
                    self_thread.pause = allRootChilds.asyncForeach(function (viewChild, position) {
                        viewChild.info.state = app_constant.VIEW_STATE.running;
                        viewChild.info.state = app_constant.VIEW_STATE.pause;
                        viewChild.info.isPaused = true;
                        viewChild.events.override.variables.pauseCallback.foreach(function (call, position) {
                            call.call(viewChild, viewChild);
                        });
                    }, function () {
                        self_thread.pause = null;
                    }, false, 1);
                    self.events.override.variables.pauseCallback.foreach(function (call, position) {
                        call.call(self, self);
                    });
                    return self;
                },
                resume: function () {
                    if (self_thread.pause != null) {
                        self_thread.pause.remove();
                    }
                    if (self_thread.resume != null) {
                        self_thread.resume.remove();
                    }
                    self.info.state = app_constant.VIEW_STATE.running;
                    self.info.isPaused = false;
                    var count = 0;
                    var i = 0;
                    var allRootChilds = app.senjs_viewPool.allRootChilds(self.info.id).filter(function (item) {
                        item.info.state = app_constant.VIEW_STATE.running;
                        return item.events.override.variables.resumeCallback.size() > 0;
                    });

                    console.log("resume", allRootChilds.size());
                    allRootChilds.foreach(function (viewChild, position) {
                        viewChild.info.state = app_constant.VIEW_STATE.running;
                        viewChild.info.isPaused = false;
                        viewChild.events.override.variables.resumeCallback.foreach(function (call, position) {
                            call.call(viewChild, viewChild);
                        });
                    }, function () {
                        self_thread.resume = null;
                    }, false, 1);
                    self.events.override.variables.resumeCallback.foreach(function (call, position) {
                        call.call(self, self);
                    });
                    return self;
                },
                reLayout: function () {

                    if (self.info.isCreated && self.info.state == app_constant.VIEW_STATE.running) {
                        self.postDelay(function () {
                            self.events.system.measured();
                        }, 10 + self.getAnimationDuration());
                    }

                },
                measured: function () {
                    if (self.info.prevent_measure_callback) {
                        self.info.prevent_measure_callback = false;
                        return;
                    }
                    if (!self.info.isCreated || self.info.parent == -1) {
                        return;
                    } else if (self._dom.offsetHeight == 0 && self._dom.offsetWidth == 0 && self._dom.style.display != "none" && self.info.measuredCount < 5) {
                        self.info.measuredCount++;
                        self.postDelay(function (self) {
                            self.events.system.measured();
                        }, self.getAnimationDuration() + 10);
                        return;
                    } else if (self.info.measuredCount >= 5) {

                    }
                    if (this.measure_variables.width == self._dom.offsetWidth
                        && this.measure_variables.height == self._dom.offsetHeight
                        && this.measure_variables.relativeLeft == self.getRelativeLeft()
                        && this.measure_variables.relativeTop == self.getRelativeTop()) {
                        return;
                    }
                    this.measure_variables.width = self._dom.offsetWidth;
                    this.measure_variables.height = self._dom.offsetHeight;
                    this.measure_variables.relativeLeft = self.getRelativeLeft();
                    this.measure_variables.relativeTop = self.getRelativeTop();
                    self.events.override.variables.onMeasuredCallbacks.foreach(function (listener, pos) {
                        listener(self, self._dom.offsetWidth, self._dom.offsetHeight);
                    });

                    if (self.getAnimationDuration() > 0) {
                        self.postDelay(function () {
                            if (self.events.system.measure_variables.width == self._dom.offsetWidth
                                && self.events.system.measure_variables.height == self._dom.offsetHeight
                                && self.events.system.measure_variables.relativeLeft == self.getRelativeLeft()
                                && self.events.system.measure_variables.relativeTop == self.getRelativeTop()) {
                                return;
                            }
                            self.events.system.measure_variables.width = self._dom.offsetWidth;
                            self.events.system.measure_variables.height = self._dom.offsetHeight;
                            self.events.system.measure_variables.relativeLeft = self.getRelativeLeft();
                            self.events.system.measure_variables.relativeTop = self.getRelativeTop();
                            self.events.override.variables.onMeasuredCallbacks.foreach(function (listener, pos) {
                                listener(self, self._dom.offsetWidth, self._dom.offsetHeight);
                            });
                        }, self.getAnimationDuration() + 20);
                    }
                },
                resized: function () {
                }
            },
            declare: function (fuction_name, listener, desc) {
                var new_dcr;
                self.events.override.variables.declare_funcs.add(new_dcr = {
                    f_name: fuction_name,
                    perform: listener,
                    f_desc: desc || ""
                });
                //    senjs_func_desc[fuction_name] = desc;
                self[fuction_name] = new_dcr.perform;
            },
            find_declared: function (func_name) {
                //self.perform = self.events.override.variables.declare_funcs.single("f_name",func_name).perform;
                self.perform = self[func_name];
                return self;
            }
        }

        Object.defineProperty(this, "info", { value: _info, writable: false });
    }

    get _meta() {
        return this.__meta;
    }

    set _meta(args) {
        Object.keys(args).forEach(key => {
            this.__meta[key] = args[key];
        });
    }


    /**
     * @returns {HTMLElement}
     */
    getDOM() {
        return this._dom;
    }

    get hasCreated() {
        return this.info.state == senjs.constant.VIEW_STATE.running;
    }

    setId(id) {
        this.info.uid = id;
        if (this.info.id != -1) {
            app.idPool.add(id, this.info.id);
        }
        else {
            this.info.isModifiedId = true;
        }
        return this;
    }

    getId() {
        return this.info.uid.length > 0 ? this.info.uid : this.info.id;
    }

    setContentEditable(flag) {
        this._dom.setAttribute("contenteditable", flag);
        return this;
    }

    bringToFront() {
        if (this.info.parent > -1) {
            this.setZIndex(this.getParentView().info.childControlId + 1);
        }
        return this;
    }

    requestLayout() {
        this.events.system.reLayout();
        return this;
    }

    customeStyle(drawStyle) {
        return this;
    }

    setBoxSizing(value) {
        this._dom.style.boxSizing = value;
        return this;
    }


    setMinHeight(value) {
        this._dom.style.minHeight = (typeof value === "number") ? (value + app_constant.SIZE_UNIT) : value;
        // this._dom.style.minHeight = value + "px";
        return this;
    }

    setMinWidth(value) {
        this._dom.style.minWidth = (typeof value === "number") ? (value + app_constant.SIZE_UNIT) : value;
        return this;
    }


    setMaxHeight(value) {
        this._dom.style.maxHeight = (typeof value === "number") ? (value + app_constant.SIZE_UNIT) : value;
        return this;
    }

    setMaxWidth(value) {
        this._dom.style.maxWidth = (typeof value === "number") ? (value + app_constant.SIZE_UNIT) : value;
        return this;
    }

    setGravity(gravity) {
        this._dom.style.display = "inline-flex";
        switch (gravity) {
            case app_constant.Gravity.TOP_LEFT:
                this._dom.style.justifyContent = "flex-start";
                this._dom.style.alignItems = "flex-start";
                break;
            case app_constant.Gravity.TOP_CENTER:
                this._dom.style.justifyContent = "flex-start";
                this._dom.style.alignItems = "center";
                break;
            case app_constant.Gravity.TOP_RIGHT:
                this._dom.style.justifyContent = "flex-start";
                this._dom.style.alignItems = "flex-end";
                break;
            case app_constant.Gravity.CENTER_LEFT:
                this._dom.style.justifyContent = "flex-start";
                this._dom.style.alignItems = "center";
                break;
            case app_constant.Gravity.CENTER:
                this._dom.style.justifyContent = "center";
                this._dom.style.alignItems = "center";
                break;
            case app_constant.Gravity.CENTER_RIGHT:
                this._dom.style.alignItems = "center";
                this._dom.style.justifyContent = "flex-end";
                break;
            case app_constant.Gravity.BOTTOM_LEFT:
                this._dom.style.alignItems = "flex-end";
                this._dom.style.justifyContent = "flex-end";
                break;
            case app_constant.Gravity.BOTTOM_CENTER:
                this._dom.style.alignItems = "flex-end";
                this._dom.style.justifyContent = "center";
                break;
            case app_constant.Gravity.BOTTOM_RIGHT:
                this._dom.style.alignItems = "flex-end";
                this._dom.style.justifyContent = "flex-end";
                break;
        }
        return this;
    }

    setDisplayType(type) {
        if (type != "none") {
            this.info.display_type = type;
        }
        this._dom.style.display = type;
        return this;
    }


    setFloat(position) {
        this._dom.style.float = position;
        return this;
    }

    /**
     * 
     * @param {View} view 
     */
    setStyleLikeOf(view) {
        this._dom.setAttribute("style", view._dom.getAttribute("style"));
        return this;
    }

    getTextColor() {
        return this.info.manualTextColor != "" ? this.info.manualTextColor : this.info.textColor;
    }

    countChildNotYetCreated() {
        return this.getAllViews().filter(item => {
            console.log(" item.info.isCreated =", item.info.isCreated);
            return item.info.state == senjs.constant.VIEW_STATE.renderring || item.info.isCreated == false;
        }).size();
    }

    setBorderText(color) {
        if (!isMobile.any()) {
            this._dom.style.textShadow = StringUtil.replaceAll("##", color, "-1px 0 ##, 0 1px ##, 1px 0 ##, 0 -1px ##");
        }
        return this;
    }

    removeBorderText() {
        this._dom.style.textShadow = "";
        return this;
    }

    setBackgroundColor(color) {
        try {
            if ((this.info.bgColor == "" && this.info.bgColor.trim() != color) || info.manualBackground == "") {
                this.info.bgColor = color;
            }
            if (info.manualBackground != "" && info.manualBackground != color && color != "transparent" && !this.info.noChangeBackground && (this.info.bgColor.indexOf("rgba") == -1)) {
                this._dom.style.background = this.info.lumenManualColor == null ? info.manualBackground : senjs.Util.colorWithLuminance(info.manualBackground, this.info.lumenManualColor);
                this.TextColor(info.manualTextColor);
                return this;
            }
            else if ((this.info.bgColor.indexOf("rgba") != -1 || color.indexOf("rgba") != -1) && info.manualBackground == "") {
                this.background(this.info.bgColor);
                return this;
            }
            if (!info.isEnableBlackWhifteTheme) {
                this.background(color);
            }
            else {
                this._dom.style.background = "rgba(200,200,200,0.4)";
            }
            if (this.info.isAutoTextColor && info.manualTextColor != "") {
                if (color != null) {
                    this.TextColor(senjs.Util.colorWithLuminance(color, info.DEFAULT_AUTO_TEXT_COLOR));
                }
            }
        }
        catch (ex) {
        }
        return this;
    }

    setTransformOrigin(left, top) {
        this._dom.style.transformOrigin = left + " " + top;
        return this;
    }


    setBackground(background) {
        background = background || "";
        if (background == null || background.length == 0 || background == undefined) {
            return this;
        }
        if (background.indexOf("gradient") != -1) {
            this._dom.style.background = background;
            this._dom.style.background = "-webkit-" + background;
            this._dom.style.background = "-o-" + background;
            this._dom.style.background = "-moz-" + background;
        }
        else {
            this._dom.style.background = background;
        }
        return this;
    }


    setBackgroundImage(imageSrc) {
        this._dom.style.backgroundImage = "url('" + imageSrc + "')";
        this.setBackgroundRepeat(false);
        return this;
    }


    removeBackgroundImage() {
        this._dom.style.backgroundImage = "none";
        return this;
    }


    setBackgroundRepeat(repeat) {
        this._dom.style.backgroundRepeat = repeat ? "repeat" : "no-repeat";
        return this;
    }


    setBackgroundSize(width, height) {
        if (width === 'cover' || width === 'contain') {
            this._dom.style.backgroundSize = width;
            return;
        }
        this._dom.style.backgroundSize = (width || "auto") + " " + (height || "auto");
        return this;
    }

    setBackgroundPosition(left, top) {
        this._dom.style.backgroundPosition = left + " " + top;
        return this;
    }

    getViewAt(index) {
        if (this.childCount() > 0) {
            return app.senjs_viewPool.get(this.info.childControls[index]);
        }
        else {
            return null;
        }
    }

    /**
     * @returns {[View]}
     */
    getAllViews() {
        return app.senjs_viewPool.allChilds(this.info.id);
    }

    /**
     * @returns {View}
     */
    getParentView() {
        return app.senjs_viewPool.get(this.info.parent);
    }

    allParents() {
        return app.senjs_viewPool.allParents(this.info.id);
    }

    setMarginTop(size) {
        this._dom.style.marginTop = size + app_constant.SIZE_UNIT;
        return this;
    }


    setMarginBottom(size) {
        this._dom.style.marginBottom = size + app_constant.SIZE_UNIT;
        return this;
    }

    setMarginLeft(size) {
        this._dom.style.marginLeft = size + app_constant.SIZE_UNIT;
        return this;
    }


    setMarginRight(size) {
        this._dom.style.marginRight = size + app_constant.SIZE_UNIT;
        return this;
    }

    setMargin(size) {
        if (!isNaN(size)) {
            this._dom.style.margin = isNaN((size)) ? size : (size + app_constant.SIZE_UNIT);
        }
        else {
            this._dom.style.margin = size;
        }
        return this;
    }

    setPosition(type) {
        switch (type) {
            case app_constant.Position.ABSOLUTE: this.info.position = type;
                type = "absolute";
                break;
            case app_constant.Position.RELATIVE: this.info.position = type;
                type = "relative";
                break;
            case app_constant.Position.FIXED: this.info.position = type;
                type = "fixed";
                break;
            case app_constant.Position.STATIC: this.info.position = type;
                type = "static";
                break;
            default: this.info.position = -1;
                break;
        }
        this._dom.style.position = type;
        return this;
    }


    hide() {
        this._dom.style.display = "none";
        this.info.hide = true;
        //this.events.system.pause();
        return this;
    }


    isHide() {
        return this.info.hide;
    }


    isPaused() {
        return this.info.state == app_constant.VIEW_STATE.pause;
    }

    hideWithAnimation(anim) {
        if (!app.config.enableAnimate) {
            this.hide();
            return;
        }
        this.info.hide = true;
        this.info.isPaused = true;
        this.setAnimation(anim);
        new Waiter(function () {
            if (this.info.hide) {
                this.hide();
                this.setVisible(false);
            }
            else {
                this.show();
                this.setVisible(true);
            }
        }
            , this.getAnimationDuration() - 10);
    }


    show() {
        this._dom.style.display = this.info.display;
        this.info.hide = false;
        this.events.system.resume();
        return this;
    }


    showWithAnimation(anim) {
        if (!app.config.enableAnimate) {
            this.show();
            return;
        }
        if (this._dom.style.display == "none") {
            this.setAnimation(anim);
            this.show();
            this.setVisible(true);
        }
    }


    setZIndex(index) {
        this.info.zIndex = index;
        this._dom.style.zIndex = this.info.absoluteZindex > -1 ? this.info.absoluteZindex : index;
        return this;
    }

    setAbsoluteZIndex(zIndex) {
        this.info.absoluteZindex = zIndex;
        this._dom.style.zIndex = zIndex;
        return this;
    }

    getZIndex() {
        return this.info.absoluteZindex > -1 ? this.info.absoluteZindex : this.info.zIndex;
    }

    setCursor(type) {
        this._dom.style.cursor = type;
        return this;
    }

    ScrollY() {
        if (brownserType.isSafari() || isMobile.iOS()) {
            this._dom.style.overflowY = "scroll";
        }
        else if (brownserType.isChrome() || isMobile.Android()) {
            this._dom.style.overflowY = "overlay";
        }
        else {
            this._dom.style.overflowY = "auto";
        }
        if (isMobile.any()) {
            this.setClassName("scroll_bar_thin");
        }
        this._dom.style.overflowX = "hidden";
        this.info.isScrollX = false;
        this.info.isScrollY = true;
        return this;
    }

    setScrollType(type) {
        this.info.scrollType = type;
        switch (type) {
            case app_constant.ScrollType.VERTICAL:
                this._dom.style.overflowX = "hidden";
                this._dom.style.overflowY = "auto";
                this.info.isScrollX = false;
                this.info.isScrollY = true;
                break;
            case app_constant.ScrollType.HORIZONTAL:
                this._dom.style.overflowX = "auto";
                this._dom.style.overflowY = "hidden";
                this.info.isScrollY = false;
                this.info.isScrollX = true;
                break;
            case app_constant.ScrollType.NONE:
                this._dom.style.overflow = "hidden";
                this.info.isScrollY = false;
                this.info.isScrollX = false;
                break;
            case app_constant.ScrollType.BOTH:
                this._dom.style.overflowX = "auto";
                this._dom.style.overflowY = "auto";
                this.info.isScrollY = true;
                this.info.isScrollX = true;
                break;
        }
        return this;
    }

    /**
     * 
     * @param {View} view 
     */
    addView(view) {
        if (view == null || this.info.isDestroy) {
            return;
        }
        var self = this;
        if (this.info.childControls == null) {
            this.info.childControls = new Array();
        }
        this.info.childControlId++;

        view.info.estimate_parent = this.info.id;
        view.info.prevent_trash_cleaner = this.info.prevent_trash_cleaner;
        this.info.childControls.push(view.info.id);
        if (view.info.isModifiedId) {
            app.idPool.add(view.info.uid, view.info.id);
            view.info.isModifiedId = false;
        }
        this._dom.setAttribute("id", this.info.id);
        this._dom.appendChild(view._dom);
        if (view.info.zIndex == -1) {
            view.setZIndex(this.info.childControlId);
        }
        /* make sure id existed in parent control if not it will wait util have id*/

        if (this.info.isCreated && this.info.id != -1) {
            view.info.isDestroy = this.info.isDestroy;
            view.info.parent = this.info.id;
            _bindOnViewCreated(view, function (v) {
                v.events.system.created();
            });
            if (self.isPaused()) {
                view.events.system.pause();
            }
            this.events.override.variables.addViewCallBack.foreach(function (call, index) {
                call(self, view);
            });
        }
        else {
            this.events.override.onCreated(function (viewParent) {
                view.info.parent = viewParent.info.id;
                view.info.isDestroy = viewParent.info.isDestroy;
                if (self.isPaused()) {
                    view.events.system.pause();
                }
                _bindOnViewCreated(view, function (v) {
                    v.events.system.created();
                });
                viewParent.events.override.variables.addViewCallBack.foreach(function (call, index) {
                    call(viewParent, view);
                });
            });
        }
        return this;
    }

    addViewAt(view, index) {
        if (this.info.isDestroy) {
            return;
        }
        if (this.info.childControls == null) {
            this.info.childControls = new Array();
        }
        if (this.info.childControls.length > 0) {
            this.info.childControlId++;
            view.info.prevent_trash_cleaner = this.info.prevent_trash_cleaner;
            var control = app.senjs_viewPool.get(this.info.childControls[index]);
            this._dom.insertBefore(view.control, control.control);
            this.info.childControls.splice(index, 0, view.info.id);
            if (view.info.id == -1) {
                app.senjs_viewPool.add(view);
            }
            if (view.info.isModifiedId) {
                app.idPool.add(view.info.uid, view.info.id);
                view.info.isModifiedId = false;
            }
            if (this.info.isCreated && this.info.id != -1) {
                view.info.isDestroy = this.info.isDestroy;
                view.info.parent = this.info.id;
                _bindOnViewCreated(view, function (v) {
                    v.events.system.created();
                });
                if (this.isPaused()) {
                    view.events.system.pause();
                }
                this.events.override.variables.addViewCallBack.foreach(function (call, index) {
                    call(this, view);
                }
                );
            }
            else {
                this.events.override.onCreated(function (viewParent) {
                    view.info.parent = viewParent.getId();
                    view.info.isDestroy = viewParent.info.isDestroy;
                    if (self.isPaused()) {
                        view.events.system.pause();
                    }
                    _bindOnViewCreated(view, function (v) {
                        v.events.system.created();
                    });
                    viewParent.events.override.variables.addViewCallBack.foreach(function (call, index) {
                        call(viewParent, view);
                    }
                    );
                });
            }
        }
        else {
            this.addView(view);
        }
        return this;
    }

    /**
     * 
     * @param {View} view 
     */
    addToParent(view) {
        view.addView(this);
        return this;
    }

    setClassName(className) {
        if (this.info.classNames.indexOf(className) == -1) {
            this.info.classNames.add(className);
            this.info.className = (this.info.className + " " + className).trim();
            this._dom.className = (this._dom.className + " " + className).trim();
        }
        return this;
    }


    removeClassName(className) {
        if (className != undefined) {
            this.info.classNames.remove(className);
            this.info.className = "";
            this._dom.className = this._dom.className.replace(className, "").trim();
        }
        else {
            this._dom.className = "";
            this.info.classNames.clear();
        }
        return this;
    }


    setAnimation(anim) {
        this._cache.current_anim = anim;
        if (app.config.enableAnimate) {
            this._dom.className = (this.info.className.length > 0 ? (this.info.className + " " + anim) : anim);
        }
        else {
            this._dom.className = (this.info.className != "" ? (this.info.className + " ") : "");
        }
        if (this.wtanim != null) {
            countAnimation--;
            //      this._dom.className = this.info.className;
            this.wtanim.remove();
            this.wtanim = null;
        }

        this.postDelay(() => {
            this.wtanim = this.postDelay(() => {
                this._dom.className = this.info.className;
                this.wtanim = null;
                this._cache.current_anim = "";
            }, this.getAnimationDuration() + 100);
        }, 10);
        return this;
    }


    getAnimation() {
        if (this._cache.anim) {
            return this._cache.anim;
        }
        this._cache.anim = new Object();

        this._cache.anim.setDuration = (duration) => {
            this._dom.style.animationDuration = (duration / 1000) + "s";
        }
        this._cache.anim.setDelay = (delay) => {
            this._dom.style.animationDelay = (delay / 1000) + "s";
        }
        this._cache.anim.stop = () => {
            this._dom.style.animation = "";
        }
        return this._cache.anim;
    }


    setAcceptClickAnimation(allow) {
        this.info.allowAnimClicked = allow;
        return this;
    }


    setScale(ratio) {
        this._dom.style.transform = "scale(" + ratio + ")";
        return this;
    }


    setScaleX(ratio) {
        this._dom.style.transform = "scaleX(" + ratio + ")";
        return this;
    }


    setScaleY(ratio) {
        this._dom.style.transform = "scaleY(" + ratio + ")";
        return this;
    }


    getAnimationDuration() {
        var d = parseFloat(this.getComputedStyle("animationDuration"));
        if (!isNaN(d) && d == 0) {
            d = parseFloat(this.getComputedStyle("transitionDuration"));
        }
        return isNaN(d) ? 500 : d * 1000;
    }


    getLeft() {
        // var left = 0;
        // if (this.info.left == -1) {
        //     if (IOUtil.isAbsouteOrFixed(this)) {
        //         left = parseInt(this._dom.style.left);
        //     }
        //     else {
        //         left = parseInt(this._dom.style.marginLeft);
        //     }
        // }
        // else {
        //     return this.info.left;
        // }
        // return isNaN(left) ? 0 : left;
        return parseInt(IOUtil.isAbsouteOrFixed(this) ? getComputedStyle(this._dom).left : getComputedStyle(this._dom).marginLeft);

    }


    getRight() {
        // if (IOUtil.isAbsouteOrFixed(this)) {
        //     return parseInt(this._dom.style.right);
        // }
        // else {
        //     return parseInt(this._dom.style.marginRight);
        // }
        return parseInt(IOUtil.isAbsouteOrFixed(this) ? getComputedStyle(this._dom).right : getComputedStyle(this._dom).marginRight);
    }


    getTop() {
        // var top = 0;
        // if (IOUtil.isAbsouteOrFixed(this)) {
        //     top = getComputedStyle(this).top;
        // }
        // else {
        //     top = getComputedStyle(this).marginTop;
        // }
        // return isNaN(top) ? 0 : top;
        return parseInt(IOUtil.isAbsouteOrFixed(this) ? getComputedStyle(this._dom).top : getComputedStyle(this._dom).marginTop);
    }


    getBottom() {
        return parseInt(IOUtil.isAbsouteOrFixed(this) ? getComputedStyle(this._dom).bottom : getComputedStyle(this._dom).marginBottom);
    }


    setLeft(value) {
        var old = this.getLeft();
        if (isNaN(value)) {
            if (IOUtil.isAbsouteOrFixed(this)) {
                this._dom.style.left = value;
            }
            else {
                this._dom.style.marginLeft = value;
            }
        }
        else {
            this.info.pushLeft = this.info.pushLeft == -1 ? value : this.info.pushLeft;
            if (IOUtil.isAbsouteOrFixed(this)) {
                this._dom.style.left = parseInt(value) + app_constant.SIZE_UNIT;
            }
            else {
                this._dom.style.marginLeft = parseInt(value) + app_constant.SIZE_UNIT;
            }
        }
        if (this.info.left != value) {
            this.events.system.reLayout();
        }
        this.info.left = value;
        return this;
    }


    setRight(value) {
        if (isNaN(value)) {
            if (IOUtil.isAbsouteOrFixed(this)) {
                this._dom.style.right = value;
            }
            else {
                this._dom.style.marginRight = value;
            }
        }
        else {
            this.info.pushRight = (this.info.pushRight == -1) ? value : this.info.pushRight;
            if (IOUtil.isAbsouteOrFixed(this)) {
                this._dom.style.right = parseInt(value) + app_constant.SIZE_UNIT;
            }
            else {
                this._dom.style.marginRight = parseInt(value) + app_constant.SIZE_UNIT;
            }
        }
        if (this.info.right != value) {
            this.events.system.reLayout();
        }
        this.info.right = value;
        return this;
    }


    setTop(value) {
        if (isNaN(value)) {
            if (IOUtil.isAbsouteOrFixed(this)) {
                this._dom.style.top = value;
            }
            else {
                this._dom.style.marginTop = value;
            }
        }
        else {
            this.info.pushTop = this.info.pushTop == -1 ? value : this.info.pushTop;
            if (IOUtil.isAbsouteOrFixed(this)) {
                this._dom.style.top = parseInt(value) + app_constant.SIZE_UNIT;
            }
            else {
                this._dom.style.marginTop = parseInt(value) + app_constant.SIZE_UNIT;
            }
            if (this.events.layout.onAboveOf != null) {
                this.events.layout.onAboveOf();
            }
            else if (this.events.layout.onBelowOf != null) {
                this.events.layout.onBelowOf();
            }
        }
        if (this.info.top != value) {
            this.events.system.reLayout();
        }
        this.info.top = value;
        return this;
    }


    setBottom(value) {
        if (isNaN(value)) {
            if (IOUtil.isAbsouteOrFixed(this)) {
                this._dom.style.bottom = value;
            }
            else {
                this._dom.style.marginBottom = value;
            }
        }
        else {
            this.info.pushBottom = this.info.pushBottom == -1 ? value : this.info.pushBottom;
            if (IOUtil.isAbsouteOrFixed(this)) {
                this._dom.style.bottom = parseInt(value) + app_constant.SIZE_UNIT;
            }
            else {
                this._dom.style.marginBottom = parseInt(value) + app_constant.SIZE_UNIT;
            }
            if (this.events.layout.onAboveOf != null) {
                this.events.layout.onAboveOf();
            }
            else if (this.events.layout.onBelowOf != null) {
                this.events.layout.onBelowOf();
            }
        }
        if (this.info.bottom != value) {
            this.events.system.reLayout();
        }
        this.info.bottom = value;
        return this;
    }


    setPercentLeft(size) {
        if (IOUtil.isAbsouteOrFixed(this)) {
            this._dom.style.left = size + "%";
        }
        else {
            this._dom.style.marginLeft = size + "%";
        }
        this.events.system.reLayout();
        return this;
    }


    setPercentRight(size) {
        if (IOUtil.isAbsouteOrFixed(this)) {
            this._dom.style.right = size + "%";
        }
        else {
            this._dom.style.marginRight = size + "%";
        }
        this.events.system.reLayout();
        return this;
    }


    setPercentTop(size) {
        if (senjs.IOUtil.isAbsouteOrFixed(this)) {
            this._dom.style.top = size + "%";
        }
        else {
            this._dom.style.marginTop = size + "%";
        }
        this.events.system.reLayout();
        return this;
    }


    setPercentBottom(size) {
        if (senjs.IOUtil.isAbsouteOrFixed(this)) {
            this._dom.style.bottom = size + "%";
        }
        else {
            this._dom.style.marginBottom = size + "%";
        }
        this.events.system.reLayout();
        return this;
    }


    clearBoth() {
        this._dom.style.clear = "both";
        return this;
    }


    getHeight() {
        var height = 0;
        if (this.info.ratio_height != -1) {
            return calculator.sizeHeight(parseFloat(this.info.ratio_height));
        }
        else {
            height = this._dom.offsetHeight;
        }
        return height;
    }


    setHeightSameAs(view) {
        if (view && view.info.isCreated) {
            this.setHeight(view._dom.offsetHeight - ((parseInt(this._dom.style.borderBottomWidth) || 0) + (parseInt(this._dom.style.borderTopWidth) || 0)));
        }
        else if (view) {
            view.events.override.onMeasured(function (v) {
                this.setHeightSameAs(v);
            });
        }
        return this;
    }


    setWidthSameAs(view) {
        if (view && view.info.isCreated) {
            this.setWidth(view._dom.clientWidth - ((parseInt(this._dom.style.borderLeftWidth) || 0) + (parseInt(this._dom.style.borderRightWidth) || 0)));
        }
        else if (view) {
            view.events.override.onMeasured(function (v) {
                this.setWidthSameAs(v);
            });
        }
        return this;
    }


    getWidth() {
        return this._dom.offsetWidth;
    }



    setTitle(title) {
        this._dom.setAttribute("title", title);
        return this;
    }

    setPercentMarginLeft(margin) {
        this._dom.style.marginLeft = margin + "%";
        this.events.system.reLayout();
        return this;
    }

    setWidth(value) {
        if (value == app_constant.Size.WRAP_CONTENT) {
            this._dom.style.width = "auto";
        }
        else if (value == app_constant.Size.AUTO) {
            this._dom.style.width = "auto";
        }
        else if (value == app_constant.Size.FILL_PARENT) {
            this._dom.style.width = "100%";
        }
        else if (typeof value === 'string') {
            this._dom.style.width = value;
        }
        else {
            this._dom.style.width = value + app_constant.SIZE_UNIT;
            this.info.ratio_width = value;
        }
        this.events.system.reLayout();
        return this;
    }


    setHeight(value) {
        if (value == app_constant.Size.WRAP_CONTENT) {
            this._dom.style.height = "auto";
        }
        else if (value == app_constant.Size.FILL_PARENT) {
            if (IOUtil.isAbsouteOrFixed(this)) {
                this._dom.style.height = "100%";
            }
            else {
                if (this.getParentView() != null) {
                    this._dom.style.height = this.getParentView().offsetHeight + app_constant.SIZE_UNIT;
                }
                else {
                    this._dom.style.height = senjs.app.info.display.SCREEN_HEIGHT;
                }
            }
            return this;
        }
        else if (!isNaN(value)) {
            this._dom.style.height = value + app_constant.SIZE_UNIT;
        } else {
            this._dom.style.height = value;
        }
        this.events.system.reLayout();
        return this;
    }


    setHTML(html) {
        this._dom.innerHTML = html;
        return this;
    }


    getHTML() {
        return this._dom.innerHTML.trim();
    }

    setPaddingLeft(value) {
        this._dom.style.paddingLeft = (typeof value === "number") ? (value + app_constant.SIZE_UNIT) : value;
        this.events.system.reLayout();
        return this;
    }

    setPaddingRight(value) {
        this._dom.style.paddingRight = (typeof value === "number") ? (value + app_constant.SIZE_UNIT) : value;
        this.events.system.reLayout();
        return this;
    }

    setPaddingTop(value) {
        this._dom.style.paddingTop = (typeof value === "number") ? (value + app_constant.SIZE_UNIT) : value;
        this.events.system.reLayout();
        return this;
    }

    setPaddingBottom(value) {
        this._dom.style.paddingBottom = (typeof value === "number") ? (value + app_constant.SIZE_UNIT) : value;
        this.events.system.reLayout();
        return this;
    }


    setPadding(value) {
        if (typeof value === 'number') {
            this._dom.style.padding = value + app_constant.SIZE_UNIT;
        } else {
            this._dom.style.padding = value;
        }
        this.events.system.reLayout();
        return this;
    }


    getPaddingLeft() {
        return parseInt(this.getComputedStyle("paddingLeft")) || 0;
    }


    getPaddingRight() {
        return parseInt(this.getComputedStyle("paddingRight")) || 0;
    }


    getPaddingTop() {
        return parseInt(this.getComputedStyle("paddingTop")) || 0;
    }


    getPaddingBottom() {
        return parseInt(this.getComputedStyle("paddingBottom")) || 0;
    }


    setBorder(size, color) {
        this.info.border.all.size = size;

        this.info.border.all.color = color;
        this._dom.style.border = color + " " + size + app_constant.SIZE_UNIT + " solid";
        return this;
    }


    setBorderLeft(size, color) {
        this.info.border.left.size = size;

        this.info.border.left.color = color;
        this._dom.style.borderLeft = color + " " + size + app_constant.SIZE_UNIT + " solid";
        return this;
    }


    setBorderTop(size, color) {
        this.info.border.top.size = size;

        this.info.border.top.color = color;
        this._dom.style.borderTop = color + " " + size + app_constant.SIZE_UNIT + " solid";
        return this;
    }


    setBorderRight(size, color) {
        this.info.border.right.size = size;

        this.info.border.right.color = color;
        this._dom.style.borderRight = color + " " + size + app_constant.SIZE_UNIT + " solid";
        return this;
    }


    setBorderBottom(size, color) {
        this.info.border.bottom.size = size;

        this.info.border.bottom.color = color;
        this._dom.style.borderBottom = color + " " + size + app_constant.SIZE_UNIT + " solid";
        return this;
    }


    setBorderColor(color) {

        this._dom.style.borderColor = color;
        return this;
    }


    setShadow(color, sizeHor, sizeVer, range, isInset) {
        this._dom.style.boxShadow = sizeHor + app_constant.SIZE_UNIT + " " + sizeVer + app_constant.SIZE_UNIT + " " + range + app_constant.SIZE_UNIT + " " + color + " " + (isInset ? "inset" : "");
        return this;
    }

    removeShadow() {
        this._dom.style.boxShadow = "none";
        return this;
    }


    setRadius(size) {
        if (!isNaN(size)) {
            this._dom.style.borderRadius = size + app_constant.SIZE_UNIT;
        }
        else {
            this._dom.style.borderRadius = size;
        }
        return this;
    }


    setRadiusAt(topLeft, topRight, bottomLeft, bottomRight) {
        this._dom.style.borderTopLeftRadius = isNaN(topLeft) ? topLeft : (topLeft + app_constant.SIZE_UNIT);
        this._dom.style.borderTopRightRadius = isNaN(topRight) ? topRight : (topRight + app_constant.SIZE_UNIT);
        this._dom.style.borderBottomLeftRadius = isNaN(bottomLeft) ? bottomLeft : (bottomLeft + app_constant.SIZE_UNIT);
        this._dom.style.borderBottomRightRadius = isNaN(bottomRight) ? bottomRight : (bottomRight + app_constant.SIZE_UNIT);
        return this;
    }


    getRadius() {
        return parseInt(this._dom.style.borderRadius) || 0;
    }


    circle() {
        this._dom.style.borderRadius = "50%";
        this.events.override.onMeasured((view, width, height) => {
            var size = width > height ? width : height;
            this.setWidth(size).setHeight(size).setPadding(0);
        }
        );
        return this;
    }


    childCount() {
        if (this != null) {
            if (this.info.childControls == null) {
                return 0;
            }
            return this.info.childControls.length;
        }
        return 0;
    }


    removeChildAt(index) {
        if (this.childCount() > 0) {
            this.getViewAt(index).events.system.destroy();
        }
        return this;
    }



    removeChild(view) {
        if (this._dom.contains(view._dom)) {
            this._dom.removeChild(view._dom);
        }
        view.events.system.destroy();
        this.info.childControls.splice(this.info.childControls.indexOf(view.info.id), 1);
        return this;
    }


    removeAllView() {
        var item, id;
        while ((item = app.senjs_viewPool.get(this.info.childControls.pop())) != null) {
            item.events.system.destroy();
        }
        this.info.childControls = new Array();
        this._dom.innerHTML = "";
        return this;
    }


    postDelay(callback, duration) {
        var delay = new Waiter(() => {
            if (this && this.info != undefined) {
                callback(this);
                this.info.stackPostDelay.remove(delay);
            }
        }, duration);
        this.info.stackPostDelay.add(delay);
        return delay;
    }


    moveTo(parent) {
        if (parent.info.id == this.info.parent && this.info.parent != -1) {
            return;
        }
        var oldParent = this.getParentView();
        if (oldParent != null) {
            app.senjs_viewPool.allRootChilds(oldParent.info.id).foreach(function (viewChild, i) {
                new List(viewChild.info.parents).remove(oldParent.info.id);
            }
            );
            new List(oldParent.info.childControls).remove(this.info.id);
        }
        this.info.hasCallCreatedStack = false;
        parent.addView(this);
        return this;
    }


    getRelativeLeft() {
        return this.getDOM().getBoundingClientRect().left;
    }


    getRelativeTop() {
        return this.getDOM().getBoundingClientRect().top;
    }


    getAbsoluteTop() {
        return senjsCts.allParents(this.info.id).filter(function (item) {
            return item != null && item.isTableCol && item.info.parent >= 0;
        }).Sum(function (a, b) {
            return a + b._dom.offsetTop;
        }) + this._dom.offsetTop;
    }


    getAbsoluteLeft() {
        return app.senjs_viewPool.allParents(this.info.id).filter(function (i) {
            return i != null && i.info.parent >= 0;
        }
        ).Sum(function (a, b) {
            return (a || 0) + b.offSetLeft();
        }
        ) + this._dom.offsetLeft;
    }


    getParentScrollY() {
        return app.senjs_viewPool.allParents(this.info.id).filter(function (i) {
            return i._dom.scrollTop > 0
        }
        ).Sum(function (a, b) {
            return (a || 0) + b._dom.scrollTop;
        }
        );
    }


    getParentScrollX() {
        return app.senjs_viewPool.allParents(this.info.id).filter(function (i) {
            return i._dom.scrollLeft > 0;
        }
        ).Sum(function (a, b) {
            return (a || 0) + b._dom.scrollLeft;
        }
        );
    }


    offSetLeft() {
        return (this._dom.offsetLeft > 0 ? this._dom.offsetLeft : 0) || 0;
    }


    offSetTop() {
        return this._dom.offsetTop || 0;
    }


    setVisible(isVisible) {
        if (isVisible) {
            this._dom.style.visibility = "visible";
            this.setOpacity(1);
        }
        else {
            this._dom.style.visibility = "hidden";
            this.setOpacity(0);
        }
        return this;
    }


    setVisibility(visibility) {
        if (this.info.visibility == visibility) {
            return this;
        }
        switch (visibility) {
            case app_constant.Visibility.VISIBLE:
                if (this._dom.style.display == "none") {
                    this._dom.style.display = this.info.display_type;
                    this.events.system.reLayout();
                }
                else {
                    this.setOpacity(1);
                    this._dom.style.visibility = "visible";
                }
                break;
            case app_constant.Visibility.INVISIBLE:
                this.setOpacity(0);
                this._dom.style.visibility = "hidden";
                break;
            case app_constant.Visibility.GONE:
                this._dom.style.display = "none";
                break;
        }
        this.info.visibility = visibility;
        return this;
    }


    getVisibility() {
        return this.info.visibility;
    }


    toLeftOf(view) {
        orderControl.add(this, view, orderControl.LEFTOF);
        return this;
    }


    toRightOf(view) {
        orderControl.add(this, view, orderControl.RIGHTOF);
        return this;
    }


    toBelowOf(view) {

        orderControl.add(this, view, orderControl.BELOWOF);
        return this;
    }


    toAboveOf(view) {
        orderControl.add(this, view, orderControl.ADBOVEOF);
        return this;
    }


    toLeftParent() {
        orderControl.add(this, null, orderControl.LEFTPARENT);
        return this;
    }


    toRightParent() {
        orderControl.add(this, null, orderControl.RIGHTPARENT);
        return this;
    }


    toTopParent() {
        orderControl.add(this, null, orderControl.TOPPARENT);
        return this;
    }


    toBottomParent() {
        orderControl.add(this, null, orderControl.BOTTOMPARENT);
        return this;
    }


    toFillParent() {
        this.setPosition(app_constant.Position.ABSOLUTE);
        this.toTopParent();
        this.toBottomParent();
        this.toLeftParent();
        this.toRightParent();
        return this;
    }


    fontWeight(weight) {
        this._dom.style.fontWeight = weight;
        return this;
    }


    bold() {
        this._dom.style.fontWeight = "bold";
        return this;
    }


    isFocusing() {
        return this.info.isFocusing;
    }


    setOpacity(value) {
        this._dom.style.opacity = value;
        return this;
    }


    setTag(value) {
        this.info.tag = value;
        return this;
    }


    setHtml(html) {
        this._dom.innerHTML = html || "";
        return this;
    }


    getTag() {
        return this.info.tag;
    }


    setVertical(vertical) {
        this._dom.style.verticalAlign = vertical;
        return this;
    }


    getBackgroundColor() {
        return this._dom.style.backgroundColor;
    }


    getBackground() {
        return this._dom.style.background;
    }


    getPositionInParent() {
        return this.getParentView().info.childControls.indexOf(this.info.id);
    }


    setOnSwipeLeft(listener) {
        this.info.onSwipeLeftListener = listener;
        if (!isMobile.any()) {
            senjs.event.setOnMouseDown(this);
            return this;
        }
        this.initTouch();
        return this;
    }

    setOnSwipeRight(listener) {
        this.info.onSwipeRightListener = listener;
        if (!isMobile.any()) {
            senjs.event.setOnMouseDown(this);
            return this;
        }
        this.initTouch();
        return this;
    }

    setOnHorDrag(listener) {
        this.info.dragHorCallBack = listener;
        this.initTouch();
        return this;
    }


    setOnVerDrag(listener) {
        this.info.dragVerCallBack = listener;
        this.initTouch();
        return this;
    }


    setTranslateX(pixel) {
        this.info.translateX = pixel;
        this._dom.style.transform = "translateX(" + pixel + app_constant.SIZE_UNIT + ")";
        return this;
    }


    setTranslate(x, y) {
        this._dom.style.transform = "translateX(" + x + app_constant.SIZE_UNIT + ") translateY(" + y + app_constant.SIZE_UNIT + ")";
        return this;
    }


    setTranslatePercent(x, y) {
        this._dom.style.transform = "translateX(" + x + "%) translateY(" + y + "%)";
        return this;
    }


    setTranslateY(pixel) {
        this.info.translateY = pixel;
        this._dom.style.transform = "translateY(" + pixel + app_constant.SIZE_UNIT + ")";
        return this;
    }


    getTranslateY() {
        return this.info.translateY || new WebKitCSSMatrix(getComputedStyle(this._dom).webkitTransform).m41;
    }


    setRotateX(deg) {
        this._dom.style.transform = "rotateX(" + deg + "deg)";
        return this;
    }


    setTransform(transform) {
        this._dom.style.transform = transform;
        return this;
    }


    setRotateY(deg) {
        this._dom.style.transform = "rotateY(" + deg + "deg)";
        return this;
    }


    setRotate(deg) {
        this._dom.style.transform = "rotate(" + deg + "deg)";
        return this;
    }


    setTranslatePercentX(percent) {
        this.info.translateX = (this.getParentView() != null ? this.getParentView()._dom.offsetWidth : 0) * percent / 100;
        this._dom.style.transform = "translateX(" + percent + "%)";
        return this;
    }


    setTranslatePercentY(percent) {
        this.info.translateY = (this.getParentView() != null ? this.getParentView()._dom.offsetHeight : 0) * percent / 100;
        this._dom.style.transform = "translateY(" + percent + "%)";
        return this;
    }


    setTransition(type, duration, timing) {
        this._dom.style.transition = type + " " + duration + "s " + (timing || "linear");
        return this;
    }

    setTransitionAll(duration, timing) {
        this._dom.style.transition = "all " + duration + "s " + (timing || "linear");
        return this;
    }


    initTouch() {
        var enableSwipeLeft = false;
        if (this.info.onSwipeLeftListener != null || this.info.allowDragRemoveItem) {
            enableSwipeLeft = true;
        }
        var enableSwipeRight = (this.info.onSwipeRightListener == null) ? false : true;
        var enableDragHor = (this.info.dragHorCallBack == null) ? false : true;
        var enableDragVer = (this.info.dragVerCallBack == null) ? false : true;
        if (!this.info.isEnableTouch) {
            var oldX = -1;
            var oldY = -1;
            var currentX = 0;
            var currentY = 0;
            var limitWidth = calculator.sizeWidth(3);
            this.info.isEnableTouch = true;
            this._dom.addEventListener("touchmove", function (e) {
                currentX = e.changedTouches[0].pageX;
                currentY = e.changedTouches[0].pageY;
                if (enableSwipeLeft || enableSwipeRight) {
                    if (oldX == -1) {
                        oldX = e.changedTouches[0].pageX;
                        oldY = e.changedTouches[0].pageY;
                        new Waiter(function () {
                            currentY = currentY - oldY;
                            currentX = currentX - oldX;
                            oldX = -1;
                            if (currentX > 80 && currentY < 35 && this.info.onSwipeLeftListener != null) {
                                this.info.onSwipeLeftListener(this);
                            }
                            else if (currentX < -80 && currentY > -35 && this.info.onSwipeRightListener != null) {
                                this.info.onSwipeRightListener(this);
                                if (this.info.allowDragRemoveItem) {
                                    this.events.system.destroy();
                                }
                            }
                        }, 70);
                    }
                    else {
                        if (this.info.allowDragRemoveItem) {
                            currentX = currentX - oldX;
                            if (currentX < -30) {
                                this.info.allowDragRemoveItem = false;
                                this.setAnimation(senjsKey.anims.CLOSE_PAGE_DEFUALT_LEFT);
                                new Waiter(function () {
                                    this.info.allowDragRemoveItem = true;
                                    this.events.system.destroy();
                                }
                                    , 300);
                            }
                            else if (currentX < -20) {
    /* this.setLeft(currentX);
    */ }
                        }
                    }
                }
                else {
                    if (oldX == -1) {
                        oldX = currentX;
                    }
                    if (oldY == -1) oldY = currentY;
                }
                if (enableDragHor) {
                    view.setTranslateX(currentX - oldX);
                    this.info.dragHorCallBack(this, oldX, currentX, currentX - oldX);
                }
                if (enableDragVer) {
                    this.setTranslateY(currentY - oldY);
                    this.info.dragVerCallBack(this, oldY, currentY, currentY - oldY);
                }
            }
                , true);
        }
        return this;
    }


    getScrollY() {
        return this._dom.scrollTop;
    }


    getScrollX() {
        return this._dom.scrollLeft;
    }


    setScrollY(pixel) {
        this._dom.scrollTop = pixel;
        return this;
    }


    scrollToBottom() {
        this._dom.scrollTop = this._dom.scrollHeight;
    }


    setScrollX(pixel) {
        this._dom.scrollLeft = pixel;
        return this;
    }


    setSmoothScrollX(toX, duration) {
        duration = duration || 500;
        duration = 200;
        if (this.info.scrollThread != null) {
            this.info.scrollThread.remove();
        }
        var timeToRepeat = 10;
        var scrollPostion = this.getScrollX();
        var isReverse = this.getScrollX() < toX ? false : true;
        var rangeToMove;
        if (!isReverse) {
            rangeToMove = timeToRepeat * (toX - scrollPostion) / duration;
            scrollPostion = toX * 0.9;
        }
        else {
            rangeToMove = timeToRepeat * (scrollPostion - toX) / duration;
            scrollPostion = toX * 1.1;
        }
        this.info.scrollThread = new Thread(function (thread) {
            if (scrollPostion < toX && !isReverse) {
                scrollPostion += rangeToMove;
                this.setScrollX(scrollPostion);
            }
            else if (scrollPostion > toX && isReverse) {
                scrollPostion -= rangeToMove;
                this.setScrollX(scrollPostion);
            }
            else {
                this.setScrollX(toX);
                thread.remove();
            }
        }
            , timeToRepeat);
    }


    setSmoothScrollY(toY, duration) {
        duration = duration || 200;
        if (this.info.scrollThread != null) {
            this.info.scrollThread.remove();
        }
        var delayTime = 10;
        var scrollPostion = this.getScrollY();
        var isScrollToBot = this.getScrollY() < toY;
        var rangeToMove;
        if (isScrollToBot) {
            rangeToMove = delayTime * (toY - scrollPostion) / duration;
        }
        else {
            rangeToMove = delayTime * (scrollPostion - toY) / duration;
        }
        this._dom.scroll({
            top: toY, left: 0, speed: 100, duration: 10, behavior: 'smooth'
        });
        return this;
    }


    setEnable(enable) {
        this._dom.disabled = !enable;
        app.senjs_viewPool.allRootChilds(this.info.id).foreach(function (view_child) {
            view_child.setEnable(enable);
        });
        return this;
    }


    getEnable() {
        return !this._dom.disabled;
    }


    destroy() {
        if (this.events)
            this.events.system.destroy();
        return this;
    }


    setStyle(style) {
        style = new List(style);
        var strStyle = "";
        style.foreach(function (item) {
            strStyle += item.senjsKey + ":" + ((item.senjsValue instanceof Function) ? item.senjsValue() : item.senjsValue) + ";";
        });
        this._dom.setAttribute("style", (this._dom.getAttribute("style") || "") + strStyle);
        return this;
    }

    /**
     * Set css for view 
     * use css original property
     * ex:
     * {
     *      'font-size': '10px',
     *      'width': '100%'
     * }
     */
    setCss(arg) {
        Object.keys(arg).forEach(item => {
            var key = item.split("-");
            if (key.length > 1) {
                for (var i = 1; i < key.length; i++) {
                    key[i] = key[i].charAt(0).toUpperCase() + key[i].substr(1);
                }
                key = key.reduce((a, b) => {
                    return a + b;
                }, "");
            }
            this._dom.style[key] = arg[item];
        });
        return this;
    }

    destroyWithAnimate() {
        if (!app.config.enableAnimate) {
            this.events.system.destroy();
            return this;
        }
        if (this.info.parent != null) {
            this._cache._destroyAnim = app_animation.DESTROY;
            this.events.system.destroy();
        }
        return this;
    }

    destroyWithCustomAnimation(animation) {
        if (!app.config.enableAnimate) {
            this.events.system.destroy();
            return this;
        }
        if (this.info && this.info.parent != null) {
            this._cache._destroyAnim = animation;
            this.events.system.destroy();
        }
        return this;
    }

    setOnDragItem(dragData, dropControl, dragcallback, dropCallback) {
        this._dom.setAttribute("draggable", true);
        var data = dragData;
        var dragItem = this;
        this._dom.ondragstart = function (arg) {
            senjs.event.isDragDropItem = true;
            arg.dataTransfer.setData("dragData", dragData);
            dragcallback(arg, this);
        }
        dropControl._dom.ondrop = function (arg) {
            // arg.preventDefault();
            dropCallback(arg, this, dropControl);
            new Waiter(function () {
                senjs.event.isDragDropItem = false;
            }, 1000);
        }
        dropControl._dom.ondragover = function (arg) {
            senjs.event.isDragDropItem = true;
            arg.preventDefault();
        }
        return this;
    }


    setOnSwipeToRemoveItem(callback) {
        this.info.allowDragRemoveItem = true;
        if (isMobile.any()) {
            this.initTouch();
        }
        senjs.event.setOnDragRemoveItem(this, function (view) {
            if (callback(view)) {
                view.destroy();
            }
            else {
                view.setLeft(0);
                view.setAnimation(senjsKey.anims.OPEN_PAGE_DEFAULT_LEFT);
            }
        }
        );
        return this;
    }


    borderDotType() {
        this._dom.style.borderStyle = "dotted";
        return this;
    }


    borderDashType() {
        this._dom.style.borderStyle = "dotted";
        return this;
    }


    filterBlur(value) {
        this._dom.style.filter = "blur(" + value + "px) grayscale(30%)";
        this._dom.style.webkitFilter = "blur(" + value + "px) grayscale(30%)";
        return this;
    }

    setAttribute(key, value) {
        this._dom.setAttribute(key, value);
        return this;
    }

    showPinnerPanel() {
        var btnHidden = senjs.IO.buttonNonTextView("").setPosition(app_constant.Position.FIXED).zIndex(1001).toFillParent();
        var pinContainer = senjs.IO.sticky(this).zIndex(1002).background(color.TRANSPARENT);
        pinContainer.setPosition(app_constant.Position.FIXED).Padding(5).PaddingBottom(0).removeShadow();
        pinContainer.disableAutoLayout();
        var pinContent = senjs.IO.block(40, 40).radius(3).shadow(ggColors.Black, 0, 0, 8, false).boxSizing("border-box").border(3, ggColors.Grey.g200).background(ggColors.Grey.g50);
        btnHidden.setOnClick(function (view) {
            view.destroy();
            pinContainer.destroyWithAnimate();
        }
        );
        var lbArrow = senjs.IO.textView("");
        lbArrow.height(1.8);
        lbArrow.setWidth(lbArrow.getHeight() * 2);
        pinContainer.addView(pinContent).addView(lbArrow);
        // lbArrow.toBottomParent();
        lbArrow.background("url('css/icons/icon_dropdown.png')");
        lbArrow.BackgroundPosition("left", "bottom");
        lbArrow.BackgroundSize("100%", "auto");
        lbArrow.BackgroundRepeat(false);
        pinContainer.setVisible(false);
        pinContainer.show();
        pinContainer.events.override.onCreated(function (containter) {
            pinContainer.setAnimation("pin_open");
            pinContainer.setVisible(true);
            var config = {
                left: 0, top: 0, bottom: 0, right: 0,
            }
            config.top = this.getRelativeTop() - containter.getHeight();
            config.left = this.getAbsoluteLeft() - containter.getWidth() / 2 + this.getWidth() / 2;
            config.right = info.SCREEN_WIDTH - (config.left + containter.getWidth());
            config.bottom = info.SCREEN_HEIGHT - (config.top + containter.getHeight());
            if (config.top < 0) {
                pinContainer.setTop(5);
            }
            else if (config.bottom < 0) {
                pinContainer.setBottom(5);
            }
            else {
                pinContainer.setTop(config.top);
            }
            if (config.left < 0) {
                pinContainer.setLeft(5);
            }
            else if (config.right < 0) {
                pinContainer.setRight(5);
            }
            else {
                pinContainer.setLeft(config.left);
            }
            if (this.info.onPinnedListener != null) {
                this.info.onPinnedListener(view, pinContent);
            }
            lbArrow.setLeft(this.getAbsoluteLeft() - pinContainer.getDOM().offsetLeft + (this.getWidth() - lbArrow.getDOM().offsetWidth) / 2);
        }
        );
        pinContent.setOnShowListener = function (listener) {
            pinContainer.setOnShowListener(function (view) {
                listener(pinContent);
            }
            );
        }
        pinContent.dismiss = pinContainer.dismiss;
        return pinContent;
    }


    setOnLongClick(listener) {
        app.event.init(this).setOnLongClick(listener);
        return this;
    }


    setOnMouseRightClick(listener) {
        this.info.onMouseRightClickListener = listener;
        app.event.init(this).setOnMouseDown(listener);
        return this;
    }


    setOnMove(listener) {
        this.info.onMoveListener = listener;
        app.event.init(this).setOnMouseDown(listener);
        return this;
    }


    setOnMouseEnter(listener) {
        app.event.init(this).setOnMouseEnter(listener);
        return this;
    }


    setOnMouseOut(listener) {
        app.event.init(this).setOnMouseOut(listener);
        return this;
    }


    setOnMouseMove(listener) {
        app.event.init(this).setOnMouseMove(listener);
        return this;
    }


    setOnMouseDown(listener) {
        this.info.onMouseDown = listener;
        app.event.init(this).setOnMouseDown(listener);
        return this;
    }


    setOnMouseUp(listener) {
        this.info.onMouseUp = listener;
        app.event.init(this).setOnMouseDown(listener);
        return this;
    }


    /**
     * 
     * @param {ClickListener} listener 
     */
    setOnClick(listener) {
        if (listener instanceof ClickListener) {
            listener.bindToView(this);
        } else {
            // Listener - function for old version
            new ClickListener(listener).bindToView(this);
        }
        return this;
    }
    /**
        * 
        * @param {DoubleClickListener} listener 
        */
    setOnDoubleClick(listener) {
        if (listener instanceof DoubleClickListener) {
            listener.bindToView(this);
        } else {
            // Listener - function for old version
            new DoubleClickListener(listener).bindToView(this);
        }
        return this;
    }

    setOnFocusChange(listener) {
        if (listener instanceof TouchListener) {
            listener.bindToView(this);
        } else {
            // Listener - function for old version
            new FocusChangeListener(listener).bindToView(this);
        }
        return this;
    }


    setOnTouch(listener) {
        if (listener instanceof TouchListener) {
            listener.bindToView(this);
        } else {
            // Listener - function for old version
            new TouchListener(listener).bindToView(this);
        }
        return this;
    }


    setOnPinnedListener(listener) {
        this.info.onPinnedListener = listener;
    }

    /** 
     * @param style_key:string - CSS key
     * Get getComputedStyle  
     *  */
    getComputedStyle(style_key) {
        return getComputedStyle(this._dom)[style_key];
    }

    /** Save the current state of view before remove it to screen */
    saveState() {
        if (this._meta.__hasSavedState) {
            return this;
        }
        new Waiter(() => {
            this._meta.__hasSavedState = true;
            senjsCts.allRootChilds(this.info.id).foreach(function (view_child) {
                if (view_child._cache == null) {
                    view_child._cache = {
                        __state: {}
                    }
                } else if (view_child.__state && view_child._cache.__state == null) {
                    view_child._cache.__state = {};
                }
                view_child._cache.__state.scrollY = view_child._dom.scrollTop;
                view_child._cache.__state.scrollX = view_child.getScrollX();
            }, () => {
                if (this.info.isPaused || this.info.state == senjs.constant.VIEW_STATE.pause) {
                    this._dom.innerHTML = "";
                }
            });
            if (this.info.isPaused || this.info.state == senjs.constant.VIEW_STATE.pause) {
                this._dom.innerHTML = "";
            }
        }, this.getAnimationDuration() + 50);
        return this;
    }

    /** Restore the state has been saved 'saveState()' of view before display it to screen */
    restoreState() {
        if (!this._meta.__hasSavedState) {
            return this;
        }
        this._meta.__hasSavedState = false;
        senjsCts.allChilds(this.info.id).foreach((child, position) => {
            this._dom.appendChild(child._dom);
        });
        senjsCts.allRootChilds(this.info.id).filter(child => {
            return child._cache != undefined
                && child._cache.__state != undefined
                && (((child._cache.__state.scrollX || 0) > 0 || (child._cache.__state.scrollY || 0) > 0) || false);
        }).foreach(child => {
            child.setScrollX(child._cache.__state.scrollX);
            child.setScrollY(child._cache.__state.scrollY);
        });
        return this;
    }
}

var orderControl = {
    thrOder: null,
    stackControls: new Array(),
    stackControlsTemp: new Array(),
    LEFTOF: 1,
    RIGHTOF: 2,
    BELOWOF: 3,
    ADBOVEOF: 4,
    LEFTPARENT: 5,
    RIGHTPARENT: 6,
    TOPPARENT: 7,
    BOTTOMPARENT: 8,
    add: function (view1, view2, type) {
        var item = {
            count: 0,
            fView: view1,
            tView: view2,
            pnLoad: null,
            Type: type
        }
        //if (view2) {

        //}
        view1.info.arrangeLayoutType = type;
        item.fView.setPosition(app_constant.Position.ABSOLUTE);
        switch (item.Type) {
            case orderControl.LEFTPARENT:
                item.fView.getDOM().style.left = "0px";
                break;
            case orderControl.RIGHTPARENT:
                item.fView.getDOM().style.right = "0px";
                break;
            case orderControl.BOTTOMPARENT:
                item.fView.getDOM().style.bottom = "0px";
                break;
            case orderControl.TOPPARENT:
                item.fView.getDOM().style.top = "0px";
                break;
            default:
                if (view1 == null || view2 == null) {
                    break;
                }
                item.fView.info.state = app_constant.VIEW_STATE.orderring;
                item.fView.setOpacity(0);
                orderControl.stackControls.push(item);
                orderControl.orderV2();
                item.fView.setTransitionAll(".0");
                break;
        }
    },
    addRelayout: function (item) {
        item.tView.events.override.onMeasured(function (view, view_width, view_height) {
            view.postDelay(function () {
                if (!view.info.isDestroy && view.info.isCreated && senjsCts.get(view.info.id) != null) {
                    orderControl.performOrder(item);
                }
            }, view.getAnimationDuration() + 30);
        });
        item.fView.getParentView().events.override.onMeasured(function (view, view_width, view_height) {
            view.postDelay(function () {
                if (!view.info.isDestroy && view.info.isCreated && senjsCts.get(view.info.id) != null) {
                    orderControl.performOrder(item);
                }
            }, view.getAnimationDuration() + 30);
        });
    },
    order: function () {
        if (orderControl.thrOder == null) {
            orderControl.thrOder = senjs.Thread.create(function () {
                if (orderControl.stackControls.length == 0 && orderControl.stackControlsTemp.length > 0) {
                    orderControl.stackControls = orderControl.stackControlsTemp;
                    orderControl.stackControlsTemp = new Array();
                } else if (orderControl.stackControls.length == 0 && senjs.event.stackCreatedControl == 0 && orderControl.stackControlsTemp.length == 0) {
                    orderControl.thrOder.remove();
                    orderControl.thrOder = null;
                    return;
                } else if (orderControl.stackControls.length == 0 && senjs.event.stackCreatedControl.length > 0) {
                    return;
                }
                if (orderControl.stackControls.length > 0) {
                    item = orderControl.stackControls[0];
                    item.count++;
                    if (item.fView.info.isCreated && item.fView.info.isDestroy == false && item.fView.getParentView() != null) {
                        if (item.fView.getParentView().info.isCreated) {
                            var tempItem = item;
                            if (item.fView.info.parent != -1 && item.tView.info.parent != -1 && item.fView.info.parent == item.tView.info.parent) {
                                var parent = item.fView.getParentView();
                                if (item.tView._dom.offsetWidth != 0 && item.tView._dom.offsetHeight != 0 && parent._dom.offsetWidth > 0 && parent._dom.offsetHeight > 0) {
                                    item = orderControl.stackControls.shift();
                                    item.fView.setPosition(app_constant.Position.ABSOLUTE);
                                    if (parent.info.position != app_constant.Position.ABSOLUTE
                                        && parent.info.position != app_constant.Position.RELATIVE) {
                                        parent.setPosition(app_constant.Position.RELATIVE);
                                    }
                                    switch (item.Type) {
                                        case orderControl.LEFTOF:
                                            //item.fView.width(app_constant.Size.WRAP_CONTENT);
                                            item.fView.info.pushRight = item.fView.info.pushRight == -1 ? 0 : item.fView.info.pushRight;
                                            item.fView.setRight(parent.getDOM().offsetWidth - item.tView.offSetLeft() + item.fView.info.pushRight);
                                            break;
                                        case orderControl.RIGHTOF:
                                            //item.fView.width(app_constant.Size.WRAP_CONTENT);
                                            item.fView.info.pushLeft = item.fView.info.pushLeft == -1 ? 0 : item.fView.info.pushLeft;
                                            item.fView.setLeft(item.tView.offSetLeft() + item.tView.getDOM().offsetWidth + item.fView.info.pushLeft);
                                            break;
                                        case orderControl.ADBOVEOF:
                                            item.fView.info.pushBottom = item.fView.info.pushBottom == -1 ? 0 : item.fView.info.pushBottom;
                                            item.fView.setBottom(parent.getDOM().offsetHeight - item.tView.offSetTop() + item.fView.info.pushBottom);
                                            break;
                                        case orderControl.BELOWOF:
                                            item.fView.info.pushTop = item.fView.info.pushTop == -1 ? 0 : item.fView.info.pushTop;
                                            item.fView.setTop(item.tView.offSetTop() + item.tView.getDOM().offsetHeight + item.fView.info.pushTop);
                                            break;
                                        default:
                                            break;
                                    }
                                    item.fView.setOpacity(1);
                                } else if (item.count > 4) {
                                    orderControl.stackControls.push(orderControl.stackControls.shift());
                                }
                            }
                        } else {
                            orderControl.stackControls.push(orderControl.stackControls.shift());
                        }
                    } else if (item.fView.info.isDestroy == true) {
                        orderControl.stackControls.shift();
                    } else if (item.fView.info.parentId == -1) {
                    } else if (item.fView.info.hide) {
                        orderControl.stackControls.push(orderControl.stackControls.shift());
                    } else if (item.count > 5 && item.count <= 40) {
                        orderControl.stackControls.push(orderControl.stackControls.shift());
                    } else if (item.count > 40) {
                        orderControl.stackControls.shift();
                    }
                }
            }, 5);
        }
    },
    orderV2: function () {
        if (orderControl.stackControls.length > 0) {
            var item = new List(orderControl.stackControls).shift();
            if (item.fView != null && !item.fView.info.isCreated) {
                var stackItem = new List(orderControl.stackControls).shift();
                item.fView.events.override.onMeasured(function (fromView, view_width, view_height) {
                    orderControl.addRelayout(item);
                    orderControl.performOrder(item);
                });
                return;
            } else if (item.fView == null || item.tView == null) {
                return;
            }
            this.addRelayout(item);
            orderControl.performOrder(item);
        }
    },
    performOrder: function (item) {
        var parent = item.fView.getParentView();
        item.fView.setPosition(app_constant.Position.ABSOLUTE);
        if (parent.info.position != app_constant.Position.ABSOLUTE
            && parent.info.position != app_constant.Position.FIXED
            && parent.info.position != app_constant.Position.RELATIVE) {
            parent.setPosition(app_constant.Position.RELATIVE);
        }
        switch (item.Type) {
            case orderControl.LEFTOF:
                //item.fView.width(app_constant.Size.WRAP_CONTENT);
                item.fView.info.pushRight = item.fView.info.pushRight == -1 ? 0 : item.fView.info.pushRight;
                item.fView._dom.style.right = (parent.getDOM().offsetWidth - item.tView.offSetLeft() + item.fView.info.pushRight) + "px";
                break;
            case orderControl.RIGHTOF:
                //item.fView.width(app_constant.Size.WRAP_CONTENT);
                item.fView.info.pushLeft = item.fView.info.pushLeft == -1 ? 0 : item.fView.info.pushLeft;
                item.fView._dom.style.left = (item.tView.offSetLeft() + item.tView.getDOM().offsetWidth + item.fView.info.pushLeft) + "px";
                break;
            case orderControl.ADBOVEOF:
                item.fView.info.pushBottom = item.fView.info.pushBottom == -1 ? 0 : item.fView.info.pushBottom;
                item.fView._dom.style.bottom = (parent.getDOM().offsetHeight - item.tView.offSetTop() + item.fView.info.pushBottom) + "px";
                break;
            case orderControl.BELOWOF:
                item.fView.info.pushTop = item.fView.info.pushTop == -1 ? 0 : item.fView.info.pushTop;
                item.fView._dom.style.top = (item.tView.offSetTop() + item.tView.getDOM().offsetHeight + item.fView.info.pushTop) + "px";
                break;
            default:
                break;
        }
        item.fView.info.state = app_constant.VIEW_STATE.running;
        item.fView.setOpacity(1);
    }
}

var IOUtil = {
    isAbsouteOrFixed: function (view) {
        if (view.info.position == app_constant.Position.ABSOLUTE || view.info.position == app_constant.Position.FIXED) {
            return true;
        }
        return false;
    },
    Anim3DUtil: {
        threeDView: null,
        init: function () {
            this.threeDView = new new List();
        },
        add: function (view) {
            info.threeDView.add(view);
        },
        remove: function (view) {
            info.threeDView.remove(view);
        },
        clear: function () {
            info.threeDView.clear();
        }
    },
    selectText: function (view) {
        var range = document.createRange();
        range.selectNodeContents(view.control);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    },
    centerInParent: function (view) {
        view._dom.style.justifyContent = "center";
        view._dom.style.flexDirection = "column";
        view._dom.style.display = "flex";
    },
    screenShot: function (view) {
        var canvas = $ot(document.createElement("canvas"));
        canvas.toFillParent();
        view.addView(canvas);
    },
    blurView: function (view) {
        var blur_view = senjs.IO.block();
        blur_view.toFillParent();
        for (var i = 0; i < 10; i++) {
            var div = senjs.IO.block("100%", "10%").float("left");
            div.background(i % 2 == 0 ? "rgba(100,100,100,0.6)" : "rgba(180,180,180,0.6)");
            blur_view.addView(div);
        }
        view._dom.style.filter = "blur(50px)";
        view.addView(blur_view);
        return blur_view;
    }
}

var stackCreatedControl = new Array();
var threadCreatedControl = 0;

var _bindOnViewCreated = (control, callback) => {
    if (!control.info.isCreated) {
        control.info.state = senjs.constant.VIEW_STATE.renderring;
        stackCreatedControl.push(control);
        if (threadCreatedControl <= 0) {
            var tempReCreate = new Array();

            for (var k = 0; k < 1; k++) {
                threadCreatedControl++;
                new Thread(function (thread) {
                    if (stackCreatedControl.length == 0 && tempReCreate.length == 0) {
                        thread.remove();
                        threadCreatedControl--;
                        return;
                    }
                    else {
                        while (tempReCreate.length > 0) {
                            stackCreatedControl.unshift(tempReCreate.shift());
                        }
                        for (var i = 0; i < 10; i++) {
                            if (stackCreatedControl.length > 0) {
                                var view = stackCreatedControl.shift();
                                if (view.info.parent != -1 && !view.info.isDestroy) {
                                    var parent = senjs.app.senjs_viewPool.get(view.info.parent);
                                    if (parent == null) {
                                        senjsCts.remove(view.info.id);
                                        continue;
                                    } else if (parent.info.isDestroy || parent.info.isPaused) {
                                        senjsCts.remove(view.info.id);
                                        continue;
                                    }
                                    view.info.isCreated = true;
                                    callback(view);
                                    if (view.getAnimationDuration() > 0) {
                                        view.postDelay(function (view) {
                                            view.info.state = senjs.constant.VIEW_STATE.running;
                                            senjsCts.allRootChilds().filter(v => {
                                                return v != null && v.info.state == senjs.constant.VIEW_STATE.renderring;
                                            }).foreach(function (vChild, pos) {
                                                vChild.info.state = app_constant.VIEW_STATE.running;
                                            });
                                        }, view.getAnimationDuration());
                                    } else {
                                        view.info.state = senjs.constant.VIEW_STATE.running;
                                    }
                                } else if (!view.info.isDestroy) {
                                    tempReCreate.push(view);
                                } else if (view.info.isDestroy) {
                                    senjsCts.remove(view.info.id);
                                }
                            }
                        }
                    }
                }, 0);
            }
        }
    }
    else {
        callback(control);
    }
}

function getViewportOffset(element) {
    var node = element
        , left = node.offsetLeft
        , top = node.offsetTop
        ;

    node = node.parentNode;

    do {
        var styles = getComputedStyle(node);

        if (styles) {
            var position = styles.getPropertyValue('position');

            left -= node.scrollLeft;
            top -= node.scrollTop;

            if (/relative|absolute|fixed/.test(position)) {
                left += parseInt(styles.getPropertyValue('border-left-width'), 10);
                top += parseInt(styles.getPropertyValue('border-top-width'), 10);

                left += node.offsetLeft;
                top += node.offsetTop;
            }

            node = position === 'fixed' ? null : node.parentNode;
        } else {
            node = node.parentNode;
        }

    } while (node);

    return { left: left, top: top };
}