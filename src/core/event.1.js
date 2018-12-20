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



    setOnDragRemoveItem(callback) {
        var control = this.view;
        control.info.onSwipeToRemoveListener = callback;
        event_context.setOnMouseDown(control);
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