import { senjsCts, isMobile } from "./app-context.js";
import { app_constant } from "../res/constant.js";
import { View } from "./view.js";
import { Waiter } from "./waiter.js";
import { senjs } from "../index.js";

var event_context = {
    NONE: 0,
    ONMOVE: 1,
    ONSWIPELEFT: 2,
    ONSWIPERIGHT: 3,
    ONSWIPEREMOVE: 4,
    ONLONGCLICK: 5,
    ONSWIPE: 6,
    isChildDrag: false,
    isBodyMouseUp: false,
    isDragDropItem: false,
    isChildClick: false,
    isCurrentOpenTask: false,
    timeOutChildClick: null,
    timeOutAnimClick: null,
    isEnablePageKeyUp: true,
    isEdittextFocusing: false,
    isAddKeyUpForBody: false,
    countShowRightBlock: 0,
    threadCreatedControl: 0,
    prevent_touch: false,
    touch: {
        TOUCH_DOWN: 11,
        TOUCH_UP: 12,
        TOUCH_MOVE: 13,
        TOUCH_CANCEL: 14,
        TOUCH_OUTSIDE: 15,
        TOUCH_ZOOM: 16,
        TOUCH_PINCH: 17,
        compareBound: function (view, iaTouchEvent) {
            return (iaTouchEvent.firstX >= view.getRelativeLeft())
                && (iaTouchEvent.firstX <= view.getRelativeLeft() + view._dom.offsetWidth)
                && (iaTouchEvent.firstY >= view.getRelativeTop())
                && (iaTouchEvent.firstY <= view.getRelativeTop() + view._dom.offsetHeight)
        }
    }
}


/**
   * @callback app_listener
   * @param {View} view
   * @param {BaseListener} event     
*/
class BaseListener {

    /**
    * 
    * @param {app_listener} listener 
    */
    constructor(listener) {
        this._args = {

        }
        this._e = null;
        this._listener = listener;
    }



    get event_args() {
        return this._args;
    }

    set event_args(any) {
        this._args = any;
    }

    /**
     * return orginal event - e
     */
    get original_event() {
        return this._e;
    }

    set original_event(e) {
        this._args._e = e;
        this._e = e;
    }

    _callListener(view) {
        this._listener(view, this._args);
        return true;
    }

    bindToView(view) {
        if (view == null) {
            throw new Error("Need a View here");
        }
        return this;
    }
}


/**
   * @callback click_listener
   * @param {View} view
   * @param {any} args     
*/
export class ClickListener extends BaseListener {

    /**
    * 
    * @param {click_listener} listener 
    */
    constructor(listener) {
        super(listener);
    }

    get args() {
        return this._args;
    }

    /**
     * @returns {ScrollArgument};
     */
    get event_args() {
        return this._args;
    }

    /**
     * Bind event to view
     * @param {View} view
     * @returns {ClickListener} 
     */
    bindToView(view) {
        super.bindToView(view);
        // view.setCursor(app_constant.Cursor.POINTER);
        var allowClick = true;
        var tick = 0;
        if (this._listener == null) {
            view._dom.onclick = null;
            view.setCursor("auto");
            return;
        }
        view.setCursor("pointer");

        var onClick = (e) => {
            /* Detect child clicked */
            if (senjsCts.allRootChilds(view.info.id)
                .filter(child => {
                    return child.info.isClicked;
                }).size() > 0 || view.info.isLongClick) {
                return;
            }
            this._e = e;
            view.info.isClicked = true;
            if (!view._dom.disabled) {
                view.setClassName("anim_click")
                if (allowClick && this._listener != null && view.info.allowClick) {
                    this._callListener(view);
                }
                new Waiter(function () {
                    view.removeClassName("anim_click");
                    view.info.isClicked = false;
                    view.info.allowClick = true;
                }, 100);
            }
        }
        if (isMobile.any()) {
            var allowClick = false;
            var firstTouchY = 0, lastTouchY = 0, lastTouchX = 0, firstTouchX = 0;
            view._dom.addEventListener("touchstart", (e) => {
                if (!view.info.isClicked) {
                    allowClick = true;
                    firstTouchY = e.changedTouches[0].clientY;
                    firstTouchX = e.changedTouches[0].clientX;
                    tick = performance.now();
                }
            }
            );
            view._dom.addEventListener("touchmove", (e) => {
                if (Math.abs(e.changedTouches[0].clientX - firstTouchX) > 30 || Math.abs(e.changedTouches[0].clientY - firstTouchY) > 30) {
                    allowClick = false;
                }
            });
            view._dom.addEventListener("touchend", (e) => {
                if (!view.info.isClicked && performance.now() - tick < 600) {
                    lastTouchY = e.changedTouches[0].clientY;
                    lastTouchX = e.changedTouches[0].clientX;
                    if (firstTouchX > lastTouchX) {
                        var a = lastTouchX;
                        firstTouchX = lastTouchX;
                        lastTouchX = a;
                    }
                    if (firstTouchY > lastTouchY) {
                        var a = lastTouchY;
                        firstTouchY = lastTouchY;
                        lastTouchY = a;
                    }
                    onClick(e);
                }
            });
        }
        else {
            view._dom.onclick = onClick;
        }
        view.performClick = onclick;
        return this;
    }
}



/**
* @typedef {Object} ScrollArgument
* @property {number} speed 1 is fast 0 is normal
* @property {number} scrollY
* @property {number} scrollX
* @property {boolean} isScrollDown
* @property {boolean} isScrollLeft
* @property {number} tickPerScroll the millisecond value each callback
*/

/**
   * @callback scroll_listener
   * @param {View} view
   * @param {ScrollArgument} args     
*/
export class ScrollListener extends BaseListener {

    /**
    * 
    * @param {scroll_listener} listener 
    */
    constructor(listener) {
        super(listener);
        this._args = {
            speed: -1, scrollY: 0, scrollX: 0, tickPerScroll: 0, rangeEachTime: 0,
            isScrollDown: false,
            isScrollLeft: false,
            get scroll_x() {
                return this.scrollX;
            },
            get scroll_y() {
                return this.scrollY;
            }
        };
    }

    /**
     * @returns {ScrollArgument};
     */
    get event_args() {
        
        return this._args;
    }

    /**
     * Bind event to view
     * @param {View} view
     * @returns {ScrollListener} 
     */
    bindToView(view) {
        super.bindToView(view);
        if (this._listener == null) {
            view._dom.onscroll = null;
            return;
        }
        var LIMIT_FAST_TICK = 20, LIMIT_FAST_RANGE = senjs.app.info.display.SCREEN_HEIGHT * 0.15;
        var time_tick = 0;
        view._dom.onscroll = (e) => {
            this._args.tickPerScroll = performance.now() - time_tick;
            this._args.isScrollDown = this._args.scrollY < view._dom.scrollTop;
            this._args.isScrollLeft = this._args.scrollX < view._dom.scrollLeft;
            this._args.rangeEachTime = this._args.isScrollDown ? (this.scrollTop - this._args.scrollY) : (this._args.scrollY - view._dom.scrollTop);
            this._args.scrollY = view._dom.scrollTop;
            this._args.scrollX = view._dom.scrollLeft;
            this.original_event = e;
            time_tick = performance.now();
            this._args.speed = ((this._args.tickPerScroll < LIMIT_FAST_TICK && this._args.rangeEachTime > LIMIT_FAST_RANGE) ? 1 : 0);
            this._callListener(view);
            view.events.override.variables.onScrolledCallbacks.foreach((listener, idx) => {
                listener(view, this._args, e);
            });
            if (this._args.scrollY <= 0 || this._args.scrollY >= view._dom.scrollHeight - view._dom.offsetHeight) {
                e.preventDefault();
            }
        }
        return this;
    }
}



export const touch_constant = {
    TOUCH_DOWN: 11,
    TOUCH_UP: 12,
    TOUCH_MOVE: 13,
    TOUCH_CANCEL: 14,
    TOUCH_OUTSIDE: 15,
    TOUCH_ZOOM: 16,
    TOUCH_PINCH: 17,
    NONE: 18
}



/**
* @typedef {Object} TouchArgument
* @property {number} action - TouchListener.MotionAction...
* @property {Object} _e event argument 
* @property {number} firstX 
* @property {number} firstY
* @property {number} touchX
* @property {number} touchY
* @property {number} touch_width
* @property {number} touch_height
* @property {number} tick_first the millisecond when first touch - touch down
* @property {number} tick_last the millisecond when stop to touch - touch up
*/



/**
   * @callback touch_listener
   * @param {View} view
   * @param {TouchArgument} args     
   * @returns {boolean} true is keep event, false is countinue others.
*/

export class TouchListener extends BaseListener {

    static get MotionAction() {
        return touch_constant;
    }


    /**
    * 
    * @param {touch_listener} listener 
    * 
    */
    constructor(listener) {
        super(listener)
        this._args = {
            action: touch_constant.NONE,
            _e: null,
            event: null,
            firstX: -1,
            firstY: -1,
            touchX: -1,
            touchY: -1,
            zoom_length: 0,
            touch_width: 0,
            touch_height: 0,
            tick_first: 0,
            tick_last: 0,
            finger_count: 0
        }
    }

    /**
     * @returns TouchArgument
     */
    get event_args() {
        return this._args;
    }

    /**
     * Bind event to view
     * @param {View} view
     * @returns {TouchListener} 
     */
    bindToView(view) {
        var firstX = -1,
            firstY = -1;
        var currentX = 0, currentY = 0;
        var has_moved = false;
        var limit = 200;
        var only_one_touch = true;
        var first_zoom_length = -1;

        var call_override = () => {
            var length = view.events.override.variables.onTouchCallbacks.size();
            for (var i = 0; i < length; i++) {
                var isBreak = view.events.override.variables.onTouchCallbacks.get(i)(view, this._args) || false;
                if (isBreak) {
                    break;
                }
            }
        }

        var refreshTouchInfo = () => {
            this._args = {
                action: touch_constant.NONE,
                _e: null, firstX: -1, firstY: -1, touchX: -1, touchY: -1, zoom_length: 0, touch_width: 0, touch_height: 0,
                finger_count: 0,
                tick_first: 0,
                tick_last: 0
            }
        }
        view._dom.ontouchstart = (e) => {
            first_zoom_length = -1;
            refreshTouchInfo();
            if (e.targetTouches.length == 1) {
                this._args.firstX = e.changedTouches[0].pageX;
                this._args.firstY = e.changedTouches[0].pageY;
                this._args.tick_first = performance.now();
            }
            else if (e.targetTouches.length == 2 && e.changedTouches.length == 2) {
                this._args.firstX = (e.changedTouches[0].pageX + e.changedTouches[1].pageX) / 2;
                this._args.firstY = (e.changedTouches[0].pageY + e.changedTouches[1].pageY) / 2;
            }
            only_one_touch = e.targetTouches.length == 1;

            has_moved = false;
            event_context.prevent_touch = false;
            this._args._e = e;
            this._args.finger_count = e.targetTouches.length;
            this._args.action = touch_constant.TOUCH_DOWN;
            this._callListener(view);
            view.info.touch_state = touch_constant.TOUCH_DOWN;
            call_override();
        }

        view._dom.ontouchmove = (e) => {
            if (this._args.finger_count == 2) {
                pinchZoom(e);
                return;
            }

            if (view.info.touch_state == -2 || senjsCts.allRootChilds(view.info.id).filter(i => { return i.info.touch_state != -1 }).size() > 0) {
                view.info.touch_state = -2;
                return;
            }
            if (this._args.firstX == -1) {
                this._args.firstX = e.changedTouches[0].pageX;
                this._args.firstY = e.changedTouches[0].pageY;
                this._args._e = e;
                has_moved = false;
                event_context.prevent_touch = false;
                if (this._callListener(view)) {
                    // e.preventDefault();
                }
                return;
            }
            if (event_context.prevent_touch) {
                return;
            }
            this._args.touchX = e.changedTouches[0].pageX;
            this._args.touchY = e.changedTouches[0].pageY;
            this._args.touch_width = this._args.touchX - this._args.firstX;
            this._args.touch_height = this._args.touchY - this._args.firstY;
            this._args._e = e;
            this._args.action = touch_constant.TOUCH_MOVE;
            this._args.finger_count = e.targetTouches.length;
            this._args.tick_last = performance.now();
            if (this._args.touchX < view.getRelativeLeft() || this._args.touchX > view.getRelativeLeft() + view._dom.offsetWidth || this._args.touchY < view.getRelativeTop() || this._args.touchY > view.getRelativeTop() + view._dom.offsetHeight) {
                this._args.action = touch_constant.TOUCH_OUTSIDE;
            }
            has_moved = true;
            if (this._callListener(view)) {
                view.info.touch_state = touch_constant.TOUCH_MOVE;
            }
            else {
                view.info.touch_state = -1;
            }
            call_override();
        }
        view._dom.ontouchend = (e) => {
            view.info.touch_state = -1;
            if (senjsCts.allRootChilds(view.info.id).filter(i => { return i.info.touch_state != -1 }).size() > 0) {
                return;
            }
            this._args.touchX = currentX = e.changedTouches[0].pageX;
            this._args.touchY = currentY = e.changedTouches[0].pageY;
            this._args.touch_width = this._args.touchX - this._args.firstX;
            this._args.touch_height = this._args.touchY - this._args.firstY;
            this._args._e = e;
            event_context.prevent_touch = false;
            this._args.action = touch_constant.TOUCH_UP;
            this._args.tick_last = performance.now();
            first_zoom_length = -1;
            if (this._callListener(view)) {
                // e.preventDefault();
                view.info.touch_state = touch_constant.TOUCH_UP;
            }
            else {
                view.info.touch_state = -1;
            }
            call_override();
            refreshTouchInfo();
        }
        view._dom.ontouchcancel = (e) => {
            if (this._args.action == touch_constant.TOUCH_UP) {
                return;
            }
            view.info.touch_state = -1;
            event_context.prevent_touch = false;
            this._args.touchX = currentX = e.changedTouches[0].pageX;
            this._args.touchY = currentY = e.changedTouches[0].pageY;
            this._args.action = touch_constant.TOUCH_CANCEL;
            this._callListener(view);
            firstX = -1;
            firstY = -1;
            first_zoom_length = -1;
            call_override();
            refreshTouchInfo();
        }
        var touch_first_x = 0;
        var touch_second_x = 0;
        var touch_first_y = 0;
        var touch_second_y = 0;
        var pinch_width = 0, pinch_height = 0;
        var cache_zoom_length = 0;
        var pinchZoom = (e) => {
            if (e.changedTouches.length == 2) {
                touch_first_x = Math.floor(e.changedTouches[0].pageX);
                touch_second_x = Math.floor(e.changedTouches[1].pageX);
                touch_first_y = Math.floor(e.changedTouches[0].pageY);
                touch_second_y = Math.floor(e.changedTouches[1].pageY);
            }
            pinch_width = Math.abs(touch_first_x - touch_second_x);
            pinch_height = Math.abs(touch_first_y - touch_second_y);
            cache_zoom_length = Math.sqrt(Math.pow(pinch_width, 2) + Math.pow(pinch_height, 2), 2);
            if (first_zoom_length == -1) {
                first_zoom_length = cache_zoom_length;
            }
            if (cache_zoom_length == this._args.zoom_length) {
                return;
            }
            cache_zoom_length = Math.round(Math.abs(cache_zoom_length - first_zoom_length));
            this._args.action = cache_zoom_length >= this._args.zoom_length ? touch_constant.TOUCH_ZOOM : touch_constant.TOUCH_PINCH;
            this._args.zoom_length = cache_zoom_length;
            if (this._callListener(view)) {
            }

        }
        return this;
    }
    _callListener(view) {
        return this._listener(view, this._args);
    }
}


/**
   * @callback focus_change_listener
   * @param {View} view
   * @param {boolean} hasFocused - true if its focusing else false
*/
export class FocusChangeListener extends BaseListener {

    /**
   * 
   * @param {focus_change_listener} listener 
   * 
   */
    constructor(listener) {

    }

    /**
        * Bind event to view
        * @param {View} view
        * @returns {FocusChangeListener} 
        */
    bindToView(view) {

        var call_override = (hasFocused) => {
            self.events.override.variables.onFocusChanged.foreach(listener => {
                listener(view, hasFocused);
            })
        }

        view._dom.onfocus = (e) => {
            this.original_event = e;
            this._callListener(view, true);
            call_override(true);
        }
        view._dom.onblur = (e) => {
            this.original_event = e;
            this._callListener(view, false);
            call_override(false);
        }
        return this;
    }


    _callListener(view, hasFocus) {
        this._listener(view, hasFocus);
        return this;
    }
}


const _keyMotionAction = {
    KEY_DOWN: 100,
    KEY_UP: 101,
    NONE: -100
}


/**
* @typedef {Object} KeyArgument
* @property {number} action - The action type 'static KeyChangeListener.MotionAction.KEYDOWN;KEY_UP'
* @property {Object} _e origin event argument 
* @property {number} keycode 
*/

/**
   * @callback key_change_listener
   * @param {View} view
   * @param {KeyArgument} args
*/
export class KeyChangeListener extends BaseListener {

    static get MotionAction() {
        return _keyMotionAction;
    }

    /**
     * @param {key_change_listener} listener 
     */
    constructor(listener) {
        super(listener);
        this._args = {
            action: _keyMotionAction.NONE,
            _e: null,
            keycode: 0
        }

    }

    /**
        * Bind event to view
        * @param {View} view
        * @returns {OnKeyChangeListener} 
        */
    bindToView(view) {

        var call_override = () => {
            view.events.override.variables.onKeyChangedCallback.foreach(listener => {
                listener(view, this._args);
            })
        }

        view._dom.onkeyup = (e) => {
            this._args.action = _keyMotionAction.KEY_UP;
            this._args.keycode = e.keyCode;
            this.original_event = e;
            this._callListener(view);
            call_override();
        }

        view._dom.onkeydown = (e) => {
            this._args.action = _keyMotionAction.KEY_DOWN;
            this._args.keycode = e.keyCode;
            this.original_event = e;
            this._callListener(view);
            call_override();
        }

        return this;
    }
}

const _mouse_motion_action = {
    MOUSE_DOWN: 50,
    MOUSE_MOVE: 51,
    MOUSE_ENTER: 52,
    MOUSE_OUT: 53,
    MOUSE_UP: 54,
    NONE: -50
}

/**
* @typedef {Object} MouseArgument
* @property {number} action - MouseChangeListener.MotionAction...
* @property {Object} _e origin event argument 
*/

/**
   * @callback mouse_change_listener
   * @param {View} view
   * @param {MouseArgument} args 
*/
export class MouseChangeListener extends BaseListener {

    static get MotionAction() {
        return _mouse_motion_action;
    }

    /**
    * @param {mouse_change_listener} listener 
    */
    constructor(listener) {
        super(listener);
        this._args = {
            action: _mouse_motion_action.NONE,
            _e: null
        }
    }

    bindToView(view) {
        view._dom.onmouseenter = (e) => {
            this.original_event = e;
            this._args.action = _mouse_motion_action.MOUSE_ENTER;
            this._callListener(view);
        }

        view._dom.onmouseout = (e) => {
            this.original_event = e;
            this._args.action = _mouse_motion_action.MOUSE_OUT;
            this._callListener(view);
        }

        view._dom.onmousemove = (e) => {
            this.original_event = e;
            this._args.action = _mouse_motion_action.MOUSE_MOVE;
            this._callListener(view);
        }

        view._dom.onmousedown = (e) => {
            this.original_event = e;
            this._args.action = _mouse_motion_action.MOUSE_DOWN;
            this._callListener(view);
        }

        view._dom.onmouseup = (e) => {
            this.original_event = e;
            this._args.action = _mouse_motion_action.MOUSE_UP;
            this._callListener(view);
        }
        return this;
    }
}