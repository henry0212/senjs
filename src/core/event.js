import { app, Thread, Waiter, isMobile, senjsCts } from './app-context.js'
import { app_constant, app_duration } from '../res/constant.js';
import { senjs } from '../index.js';
import { View } from './view.js';
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
    animateDiv: null,
    animateDiv2: null,
    animateDiv3: null,
    countClick: 0,
    stackResize: new Array(),
    stackCreatedControl: new Array(),
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

export const touch_constant = {
    TOUCH_DOWN: 11,
    TOUCH_UP: 12,
    TOUCH_MOVE: 13,
    TOUCH_CANCEL: 14,
    TOUCH_OUTSIDE: 15,
    TOUCH_ZOOM: 16,
    TOUCH_PINCH: 17,
}


class iaEvent {
    constructor(view) {
        this.view = view;
    }

    setOnCreated(callback) {
        var control = this.view;
        if (!control.info.isCreated) {
            control.info.state = senjs.constant.VIEW_STATE.renderring;
            event_context.stackCreatedControl.push(control);
            if (event_context.threadCreatedControl <= 0) {
                var count = 0;
                var tempReCreate = new Array();

                for (var k = 0; k < 1; k++) {
                    event_context.threadCreatedControl++;
                    new Thread(function (thread) {
                        if (event_context.stackCreatedControl.length == 0 && tempReCreate.length == 0) {
                            thread.remove();
                            event_context.threadCreatedControl--;
                            return;
                        }
                        else {
                            while (tempReCreate.length > 0) {
                                event_context.stackCreatedControl.unshift(tempReCreate.shift());
                            }
                            for (var i = 0; i < 10; i++) {
                                if (event_context.stackCreatedControl.length > 0) {
                                    count++;
                                    var view = event_context.stackCreatedControl.shift();
                                    if (view.info.parent != -1 && !view.info.isDestroy) {
                                        var parent = senjs.app.senjs_viewPool.get(view.info.parent);
                                        if (parent != null) {
                                            if (!parent.info.isDestroy && !parent.info.isPaused) {
                                                view.info.isCreated = true;
                                                callback(view);
                                                if (view.getAnimationDuration() > 0) {
                                                    view.postDelay(function (view) {
                                                        view.info.state = senjs.constant.VIEW_STATE.running;
                                                        senjsCts.allRootChilds().filter(v => {
                                                            return v != null && v.info.state == senjs.constant.VIEW_STATE.renderring;
                                                        }).foreach(function (vChild, pos) {
                                                            console.log(vChild);
                                                            vChild.info.state = app_constant.VIEW_STATE.running;
                                                        });
                                                    }, view.getAnimationDuration());
                                                }
                                                else {
                                                    view.info.state = senjs.constant.VIEW_STATE.running;
                                                }
                                            }
                                            else {
                                                senjsCts.remove(view.info.id);
                                            }
                                        }
                                        else {
                                            senjsCts.remove(view.info.id);
                                        }
                                    }
                                    else if (!view.info.isDestroy) {
                                        tempReCreate.push(view);
                                    }
                                    else if (view.info.isDestroy) {
                                        senjsCts.remove(view.info.id);
                                    }
                                }
                            }
                        }
                    }, 10);
                }
            }
        }
        else {
            callback(control);
        }
    }

    setOnClick(callback) {
        var control = this.view;
        var allowClick = true;
        var tick = 0;
        if (callback == null) {
            control._dom.onclick = null;
            control.cursor("auto");
            return;
        }
        if (typeof callback === "object") {
            callback = callback.onClicked || callback.override.onClicked;
        }

        var onClick = function (e) {
            var childs = senjsCts.allRootChilds(control.info.id);
            if (childs.filter(function (node) {
                return node.info.isClicked;
            }
            ).size() > 0 || control.info.isLongClick) {
                return;
            }
            if (!(control.info.isParentDoubleClick || control.info.isParentTripleClick)) {
                event_context.isChildClick = true;
                if (event_context.timeOutChildClick != null) {
                    event_context.timeOutChildClick.remove();
                }
                event_context.timeOutChildClick = new Waiter(function () {
                    event_context.isChildClick = false;
                }
                    , 300);
            }
            if (!control.info.isDock) {
                if (event_context.isCurrentOpenTask) {
                    return;
                }
            }
            control.info.isClicked = true;
            if (!control._dom.disabled) {
                if (allowClick && callback != null && control.info.allowClick) {
                    callback(control);
                    if (!isMobile.iOS()) {
                        //     senjs.Util.addClickAnim(control, e);
                    }
                }
                new Waiter(function () {
                    control.info.isClicked = false;
                    control.info.allowClick = true;
                }, 200);
            }
        }
        if (isMobile.any()) {
            var allowClick = false;
            var firstTouchY = 0, lastTouchY = 0, lastTouchX = 0, firstTouchX = 0;
            control._dom.addEventListener("touchstart", function (e) {
                console.log("onClick", "touchstart");
                if (!control.info.isClicked) {
                    allowClick = true;
                    firstTouchY = e.changedTouches[0].clientY;
                    firstTouchX = e.changedTouches[0].clientX;
                    tick = performance.now();
                }
            }
            );
            control._dom.addEventListener("touchmove", function (e) {
                if (Math.abs(e.changedTouches[0].clientX - firstTouchX) > 15 || Math.abs(e.changedTouches[0].clientY - firstTouchY) > 15) {
                    allowClick = false;
                }
            });
            control._dom.addEventListener("touchend", function (e) {
                if (!control.info.isClicked && performance.now() - tick < 600) {
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
                    onClick(e.changedTouches[0]);
                }
            }
            );
        }
        else {
            control._dom.onclick = onClick;
        }

        this.view.performClick = () => {
            callback(this.view);
        }
    }

    /** 
     * @param control: View class
     * @param callback parameter: callback(view)
     * @description the callback need pass view param
     */
    setOnDoubleClick(callback) {
        this.setOnMouseDown(this.view);
    }



    setOnKeyUp(callback) {
        var control = this.view;
        control._dom.onkeyup = function (event) {
            callback(control, event.keyCode, event);
        }
    }


    setOnKeyDown(callback) {
        var control = this.view;
        control._dom.onkeydown = function (event) {
            callback(control, event.keyCode);
        }
    }


    setOnPaste(callback) {
        var control = this.view;
        control._dom.onpaste = function () {
            callback(control);
        }
    }


    setOnFocus(callback) {
        var control = this.view;
        control._dom.onfocus = function () {
            callback(control);
        }
    }

    /**
     * @callback onTouchEvent
     * @param {View} view
     * @param {*} args - { action: numner, _e: event , firstX:number, firstY:number, touchX:number, touchY:number, zoom_length: number, touchWidth : number,touch_height: number }
     */
    /**
     * @param {onTouchEvent} listener
     */

    setOnTouch(listener) {
        var view = this.view;
        var firstX = -1,
            firstY = -1;
        var currentX = 0, currentY = 0;
        var has_moved = false;
        var limit = 200;
        var only_one_touch = true;
        var first_zoom_length = -1;
        var ev = {
            action: event_context.touch.TOUCH_DOWN,
            _e: null,
            event: null, firstX: -1, firstY: -1, touchX: -1, touchY: -1, zoom_length: 0, touch_width: 0, touch_height: 0,
            tick_first: 0,
            tick_last: 0,
            finger_count: 0
        }
        function call_override() {
            var length = view.events.override.variables.onTouchCallbacks.size();
            for (var i = 0; i < length; i++) {
                var isBreak = view.events.override.variables.onTouchCallbacks.get(i)(view, ev) || false;
                if (isBreak) {
                    break;
                }
            }
        }

        function refreshTouchInfo() {
            ev = {
                action: event_context.touch.TOUCH_DOWN,
                _e: null, firstX: -1, firstY: -1, touchX: -1, touchY: -1, zoom_length: 0, touch_width: 0, touch_height: 0,
                finger_count: 0,
                tick_first: 0,
                tick_last: 0
            }
        }
        view._dom.ontouchstart = function (e) {
            // view._dom.addEventListener("touchstart", function (e) {
            first_zoom_length = -1;
            refreshTouchInfo();
            if (e.targetTouches.length == 1) {
                ev.firstX = e.changedTouches[0].pageX;
                ev.firstY = e.changedTouches[0].pageY;
                ev.tick_first = performance.now();
            }
            else if (e.targetTouches.length == 2 && e.changedTouches.length == 2) {
                ev.firstX = (e.changedTouches[0].pageX + e.changedTouches[1].pageX) / 2;
                ev.firstY = (e.changedTouches[0].pageY + e.changedTouches[1].pageY) / 2;
            }
            only_one_touch = e.targetTouches.length == 1;

            has_moved = false;
            event_context.prevent_touch = false;
            ev._e = e;
            ev.finger_count = e.targetTouches.length;
            ev.action = event_context.touch.TOUCH_DOWN;
            if (listener(view, ev)) {
                view.info.touch_state = event_context.touch.TOUCH_DOWN;
                // e.preventDefault();
            }
            else {
                view.info.touch_state = -1;
            }
            call_override();
        }
        view._dom.ontouchmove = function (e) {
            // view._dom.addEventListener("touchmove", function (e) {
            if (ev.finger_count == 2) {
                pinchZoom(e);
                return;
            }

            if (view.info.touch_state == -2 || senjsCts.allRootChilds(view.info.id).filter(i => { return i.info.touch_state != -1 }).size() > 0) {
                view.info.touch_state = -2;
                return;
            }
            if (ev.firstX == -1) {
                ev.firstX = e.changedTouches[0].pageX;
                ev.firstY = e.changedTouches[0].pageY;
                ev._e
                    = e;
                has_moved = false;
                event_context.prevent_touch = false;
                if (listener(view, ev)) {
                    // e.preventDefault();
                }
                return;
            }
            if (event_context.prevent_touch) {
                return;
            }
            ev.touchX = e.changedTouches[0].pageX;
            ev.touchY = e.changedTouches[0].pageY;
            ev.touch_width = ev.touchX - ev.firstX;
            ev.touch_height = ev.touchY - ev.firstY;
            ev._e = e;
            ev.action = event_context.touch.TOUCH_MOVE;
            ev.finger_count = e.targetTouches.length;
            ev.tick_last = performance.now();
            if (ev.touchX < view.getRelativeLeft() || ev.touchX > view.getRelativeLeft() + view._dom.offsetWidth || ev.touchY < view.getRelativeTop() || ev.touchY > view.getRelativeTop() + view._dom.offsetHeight) {
                ev.action = event_context.touch.TOUCH_OUTSIDE;
            }
            has_moved = true;
            if (listener(view, ev)) {
                view.info.touch_state = event_context.touch.TOUCH_MOVE;
            }
            else {
                view.info.touch_state = -1;
            }
            call_override();
        }
        // );
        view._dom.ontouchend = function (e) {
            // view._dom.addEventListener("touchend", function (e) {
            view.info.touch_state = -1;
            if (senjsCts.allRootChilds(view.info.id).filter(i => i.info.touch_state != -1).size() > 0) {
                return;
            }
            ev.touchX = currentX = e.changedTouches[0].pageX;
            ev.touchY = currentY = e.changedTouches[0].pageY;
            ev.touch_width = ev.touchX - ev.firstX;
            ev.touch_height = ev.touchY - ev.firstY;
            ev._e = e;
            event_context.prevent_touch = false;
            ev.action = event_context.touch.TOUCH_UP;
            ev.tick_last = performance.now();
            first_zoom_length = -1;
            if (listener(view, ev)) {
                // e.preventDefault();
                view.info.touch_state = event_context.touch.TOUCH_UP;
            }
            else {
                view.info.touch_state = -1;
            }
            call_override();
            refreshTouchInfo();
        }
        // );
        view._dom.ontouchcancel = function (e) {
            // view._dom.addEventListener("touchcancel", function (e) {
            if (ev.action == event_context.touch.TOUCH_UP) {
                return;
            }
            view.info.touch_state = -1;
            ev.touchX = currentX = e.changedTouches[0].pageX;
            ev.touchY = currentY = e.changedTouches[0].pageY;
            ev.action = event_context.touch.TOUCH_CANCEL;
            listener(view, ev);
            firstX = -1;
            firstY = -1;
            first_zoom_length = -1;
            call_override();
            refreshTouchInfo();
        }
        // );
        var touch_first_x = 0;
        var touch_second_x = 0;
        var touch_first_y = 0;
        var touch_second_y = 0;
        var pinch_width = 0, pinch_height = 0;
        var cache_zoom_length = 0;
        function pinchZoom(e) {
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
            if (cache_zoom_length == ev.zoom_length) {
                return;
            }
            cache_zoom_length = Math.round(Math.abs(cache_zoom_length - first_zoom_length));
            console.log(cache_zoom_length, ev.zoom_length);
            ev.action = cache_zoom_length >= ev.zoom_length ? event_context.touch.TOUCH_ZOOM : event_context.touch.TOUCH_PINCH;
            if (ev.action == event_context.touch.TOUCH_PINCH) {
                console.log("pinch");
            }
            else {
                console.log("zoom");
            }
            ev.zoom_length = cache_zoom_length;
            // console.log("current length: " + ev.zoom_length + " first: " +first_zoom_length + " result: " + ( ev.zoom_length - first_zoom_length));
            if (listener(view, ev)) {
            }

        }
    }


    setOnTouchDesktop(listener) {
        var view = this.view;
        var firstX = -1;
        firstY = -1;
        var currentX = 0, currentY = 0;
        var has_moved = false;
        var limit = 200;
        var only_one_touch = true;
        var first_zoom_length = -1;
        var ev = {
            action: event_context.touch.TOUCH_DOWN, event: null, firstX: -1, firstY: -1, touchX: -1, touchY: -1, zoom_length: 0, touch_width: 0, touch_height: 0,
        }
        //view._dom.ontouchstart = function(e){
        view._dom.addEventListener("mousedown", function (e) {
            ev.firstX = e.pageX;
            ev.firstY = e.pageY;
            if (info.mobileMode && info.BODY != view && ev.firstX < info.SCREEN_WIDTH * 0.05) {
                return;
            }
            has_moved = false;
            event_context.prevent_touch = false;
            ev._e = e;
            ev.action = event_context.touch.TOUCH_DOWN;
            if (listener(view, ev)) {
                view.info.touch_state = event_context.touch.TOUCH_DOWN;
                // e.preventDefault();
            }
            else {
                view.info.touch_state = -1;
            }
        }
        );
        //view._dom.ontouchmove = function(e){
        view._dom.addEventListener("mousemove", function (e) {
            if (info.mobileMode && info.BODY != view && ev.firstX < info.SCREEN_WIDTH * 0.05) {
                return;
            }
            if (view.info.touch_state == -2 || senjsCts.allRootChilds(view.info.id).filter(i => i.info.touch_state != -1).size() > 0) {
                view.info.touch_state = -2;
                return;
            }
            if (ev.firstX == -1) {
                ev.firstX = e.pageX;
                ev.firstY = e.pageY;
                ev._e = e;
                has_moved = false;
                event_context.prevent_touch = false;
                if (listener(view, ev)) {
                    // e.preventDefault();
                }
                return;
            }
            if (event_context.prevent_touch) {
                return;
            }
            ev.touchX = e.pageX;
            ev.touchY = e.pageY;
            ev.touch_width = ev.touchX - ev.firstX;
            ev.touch_height = ev.touchY - ev.firstY;
            ev._e = e;
            ev.action = event_context.touch.TOUCH_MOVE;
            if (ev.touchX < view.getRelativeLeft() || ev.touchX > view.getRelativeLeft() + view._dom.offsetWidth || ev.touchY < view.getRelativeTop() || ev.touchY > view.getRelativeTop() + view._dom.offsetHeight) {
                ev.action = event_context.touch.TOUCH_OUTSIDE;
            }
            if (!has_moved && Math.abs(e.touch_width) < limit || Math.abs(ev.touch_height) < limit) {
                // return;
            }
            has_moved = true;
            if (listener(view, ev)) {
                view.info.touch_state = event_context.touch.TOUCH_MOVE;
            }
            else {
                view.info.touch_state = -1;
            }
        });
        view._dom.addEventListener("mouseup", function (e) {
            if (info.mobileMode && info.BODY != view && ev.firstX < info.SCREEN_WIDTH * 0.05) {
                return;
            }
            console.log("mouse up");
            view.info.touch_state = -1;
            if (senjsCts.allRootChilds(view.info.id).filter(i => i.info.touch_state != -1).size() > 0) {
                return;
            }
            ev.touchX = currentX = e.pageX;
            ev.touchY = currentY = e.pageY;
            ev.touch_width = ev.touchX - ev.firstX;
            ev.touch_height = ev.touchY - ev.firstY;
            ev._e = e;
            event_context.prevent_touch = false;
            ev.action = event_context.touch.TOUCH_UP;
            if (listener(view, ev)) {
                // e.preventDefault();
                view.info.touch_state = event_context.touch.TOUCH_UP;
            }
            else {
                view.info.touch_state = -1;
            }
        }
        );
        //view._dom.ontouchcancel = function(e){
        view._dom.addEventListener("touchcancel", function (e) {
            view.info.touch_state = -1;
            ev.touchX = currentX = e.changedTouches[0].pageX;
            ev.touchY = currentY = e.changedTouches[0].pageY;
            ev.action = event_context.touch.TOUCH_CANCEL;
            listener(view, ev);
            refreshTouchInfo();
        }
        );
    }

    setOnMouseChange(listener) {
        var view = this.view;
        var firstX = 0;
        firstY = 0;
        var currentX = 0, currentY = 0;
        var has_moved = false, active_move = false;
        var limit = 200;
        var limit_border = 0;
        var mouse_up = function (e) {
            console.log("mouseUp");
            currentX = e.pageX;
            currentY = e.pageY;
            firstX = -1;
            firstY = -1;
            active_move = false;
            event_context.prevent_touch = false;
            var ev = {
                action: event_context.touch.TOUCH_UP, event: e, touchX: currentX, touchY: currentY, touch_width: currentX - firstX, touch_height: currentY - firstY, finger_count: 1
            }
            if (listener(view, ev)) {
                //e.preventDefault();
            }
        }
        var mouse_down = function (e) {
            firstX = e.pageX;
            firstY = e.pageY;
            has_moved = false;
            event_context.prevent_touch = false;
            active_move = true;
            var ev = {
                action: event_context.touch.TOUCH_DOWN, event: e, touchX: firstX, touchY: firstY, touch_width: 0, touch_height: 0, finger_count: 1
            }
            if (listener(view, ev)) {
                //e.preventDefault();
            }
        }
        var mouse_move = function (e) {
            if (event_context.prevent_touch || !active_move) {
                return;
            }
            currentX = e.pageX;
            currentY = e.pageY;
            var ev = {
                action: event_context.touch.TOUCH_MOVE, event: e, touchX: currentX, touchY: currentY, touch_width: currentX - firstX, touch_height: currentY - firstY, finger_count: 1
            }
            console.log("currentX: " + currentX + " vs " + (view.getRelativeLeft() + view._dom.offsetWidth));
            if (currentX < view.getRelativeLeft() || currentX > view.getRelativeLeft() + view._dom.offsetWidth || currentY < view.getRelativeTop() || currentY > view.getRelativeTop() + view._dom.offsetHeight) {
                ev.action = event_context.touch.TOUCH_OUTSIDE;
                console.log("mouseout");
            }
            if (!has_moved && (e.touch_width > -limit && e.touch_width < limit || e.touch_height > -limit && e.touch_height < limit)) {
                return;
            }
            has_moved = true;
            if (listener(view, ev)) {
                //e.preventDefault();
            }
        }
        info.BODY._dom.addEventListener("mousedown", mouse_down);
        info.BODY._dom.addEventListener("mousemove", mouse_move);
        info.BODY._dom.addEventListener("mouseup", mouse_up);
        view.events.override.onDestroy(function (view) {
            info.BODY._dom.removeEventListener("mousedown", mouse_down);
            info.BODY._dom.removeEventListener("mousemove", mouse_move);
            info.BODY._dom.removeEventListener("mouseup", mouse_up);
        }
        );
    }


    setOnFocusChange(callback) {
        var control = this.view;
        //if (control._dom.onfocus != null) {
        // return;
        //}
        this.setOnFocus(control, function (view) {
            callback(view, true);
        }
        );
        this.setOnFocusOut(control, function (view) {
            callback(view, false);
        });
    }

    setOnFocusOut(callback) {
        var control = this.view;
        control._dom.onblur = function () {
            callback(control);
        }
    }

    setOnLongClick(callback) {
        var control = this.view;
        control.info.onLongClickListener = callback;
        if (callback == null) {
            control.setCursor("auto");
        }
        else {
            control.setCursor(senjs.constant.Cursor.POINTER);
        }
        if (control._dom.onmousedown == null) {
            this.setOnMouseDown(control);
        }
    }


    static setKeyUpForPage(callback) {
        document.body.onkeydown = function (event) {
        }
        document.body.onkeyup = function (event) {
            if (event_context.isEnablePageKeyUp) {
                callback(event.keyCode);
            }
        }
    }


    static addMoreKeyUpForpage(callback) {
        document.body.addEventListener("keyup", function (event) {
            if (event_context.isEnablePageKeyUp) {
                callback(event.keyCode);
            }
        }
        );
    }


    static addMoreKeyUpDelayGetValueForpage(callback) {
        if (!event_context.isAddKeyUpForBody) {
            var timeout = null;
            var value = "";
            var code;
            var notify = senjs.IO.textView("");
            notify.Position(senjs.constant.Position.FIXED);
            notify.setBottom(20);
            notify._dom.style.right = "45%";
            notify.setTextSize(calculator.sizeHeight(4.5));
            notify.TextColor(color.WHITE);
            notify._dom.style.background = "rgba(0,0,0,0.7)";
            notify.PaddingLeft(15);
            notify.PaddingRight(15);
            notify.PaddingTop(6);
            notify.PaddingBottom(6);
            notify.hide();
            notify.zIndex(10000);
            info.BODY.addView(notify);
            var wait = 350;
            var listener = function (event) {
                if (event_context.isEnablePageKeyUp) {
                    if (timeout != null) {
                        timeout.remove();
                    }
                    code = event.keyCode - 48;
                    if (event.keyCode == 88) {
                        wait = 1200;
                    }
                    else if (event.keyCode == 13 || event.keyCode == 38 || event.keyCode == 40) {
                        wait = 10;
                    }
                    else {
                        wait = 20;
                    }
                    if (code >= 0 && code <= 9) {
                        value += Character[code];
                    }
                    else if (code >= 17 && code < 48) {
                        code -= 7;
                        value += Character[code];
                    }
                    else if (code >= 48) {
                        code -= 48;
                        value += Character[code];
                    }
                    notify.setText(value);
                    if (value != "") notify.show();
                    timeout = new Waiter(function () {
                        callback(event.keyCode, value);
                        new Waiter(function () {
                            notify.hide();
                            value = "";
                        }
                            , 600);
                        timeout = null;
                    }
                        , wait);
                }
            }
            document.body.removeEventListener("keyup", listener);
            document.body.addEventListener("keyup", listener);
        }
        event_context.isAddKeyUpForBody = true;
    }


    setOnMouseEnter(callback) {
        var control = this.view;
        control._dom.onmouseenter = function (event) {
            callback(control, event.clientX, event.clientY);
        }
    }


    setOnMouseOut(callback) {
        var control = this.view;
        control._dom.onmouseout = function (event) {
            if (callback != null) callback(control, event.clientX, event.clientY)
        }
    }


    setOnMouseMove(callback) {
        var control = this.view;
        var ctrAbsoluteLeft = null, ctrAbsoluteTop = null;
        var mouseXBegin = 0, mouseYBegin = 0;
        control.events.override.onMouseDown(function (self, event) {
            mouseXBegin = event.clientX;
            mouseYBegin = event.clientY;
        }
        );
        control._dom.onmousemove = function (event) {
            if (callback != null) {
                callback(control, event.clientX, event.clientY, event.clientX - control.getAbsoluteLeft(), event.clientY - control.getAbsoluteTop(), event.screenX, event.screenY);
            }
            if (control.info.onMoveListener != null) {
                if (ctrAbsoluteLeft == null) {
                    ctrAbsoluteLeft = control.getAbsoluteLeft();
                    ctrAbsoluteTop = control.getAbsoluteTop();
                }
                control.info.onMoveListener(control, event.clientX - mouseXBegin, event.clientY - mouseYBegin, event.clientX - ctrAbsoluteLeft, event.clientY - ctrAbsoluteTop, event.screenX, event.screenY);
            }
        }
    }

    setOnDragRemoveItem(callback) {
        var control = this.view;
        control.info.onSwipeToRemoveListener = callback;
        event_context.setOnMouseDown(control);
    }

    setOnMouseDown() {

    }


    setOnRightMenuListener(menuItems, listener) {
        var control = this.view;
        control.setOnMouseRightClick(function (view, x, y) {
        }
        );
    }


    setOnScroll(listener) {
        var control = this.view;
        var scrollX = 0, scrollY = 0;
        if (listener == null) {
            control._dom.onscroll = null;
            return;
        }
        var LIMIT_FAST_TICK = 20, LIMIT_FAST_RANGE = senjs.app.info.display.SCREEN_HEIGHT * 0.15;
        var first_x = 0, first_y = 0;
        var capture_scrollY = 0;
        var time_tick = 0;
        var iaScrollEvent = {
            speed: -1, scrollY: 0, scrollX: 0, tickPerScroll: 0, isScrollDown: false, rangeEachTime: 0,
            get scroll_x() {
                return this.scrollX;
            },
            get scroll_y() {
                return this.scrollY;
            }
        }
        control._dom.onscroll = function (e) {
            iaScrollEvent.tickPerScroll = performance.now() - time_tick;
            iaScrollEvent.isScrollDown = iaScrollEvent.scrollY < this.scrollTop;
            iaScrollEvent.rangeEachTime = iaScrollEvent.isScrollDown ? (this.scrollTop - iaScrollEvent.scrollY) : (iaScrollEvent.scrollY - this.scrollTop);
            iaScrollEvent.scrollY = this.scrollTop;
            iaScrollEvent.scrollX = this.scrollLeft;
            time_tick = performance.now();
            iaScrollEvent.speed = ((iaScrollEvent.tickPerScroll < LIMIT_FAST_TICK && iaScrollEvent.rangeEachTime > LIMIT_FAST_RANGE) ? 1 : 0);
            if (listener) {
                listener(control, iaScrollEvent, e);
            }
            iaScrollEvent.rangeEachTime;
            control.events.override.variables.onScrolledCallbacks.foreach(function (listener, idx) {
                listener(control, iaScrollEvent, e);
            });
        }
        if (this.scrollTop <= 0 || this.scrollTop >= control._dom.scrollHeight - control._dom.offsetHeight) {
            e.preventDefault();
        }
    }


    setOnMouseWheel(listener) {
        var control = this.view;
        var threadCall = null;
        var last = null;
        var list_values = [];
        control._dom.onmousewheel = function (e) {
            last = {
                event: e, isScrollUp: (Math.min(1, (e.wheelDelta || -e.detail)) == 1) ? true : false
            }
                ;
            // list_values.push({event: e, isScrollUp: (Math.min(1, (e.wheelDelta || -e.detail)) == 1) ? true : false });
            if (threadCall == null) {
                threadCall = new Thread(function () {
                    if (last == null) {
                        threadCall.remove();
                        threadCall = null;
                        return;
                    }
                    listener(control, last.event, last.isScrollUp);
                    last = null;
                }, 50);
            }
        }
        control._dom.addEventListener("DOMMouseScroll", function (e) {
            listener(control, e, (Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)) == 1) ? true : false));
        });
    }
}

var _cache = {
    view_event: new Array()
}

export var app_event = {
    init: function (view) {
        var temp;
        if (view.info.id != -1 &&
            _cache.view_event.filter(i => { i.view.id == view.id }).length == 1) {
            temp = temp[0];
        } else {
            temp = new iaEvent(view);
            _cache.view_event.push(temp);
        }
        return temp;
    }
}