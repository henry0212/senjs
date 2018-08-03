import { View } from '../../core/view.js'
import { List } from '../../util/list-util.js'
import { app, dhCts } from '../../core/app-context.js'
import { Thread } from '../../core/thread.js';

export class BaseLayout extends View {

    constructor(width, height) {
        super(document.createElement("div"));
        this.setWidth(width);
        this.setHeight(height);
        this._cache.listQuicklyLayout = new List();
        this._cache.loadingView = null;

        this._super.addView =  (view) => {
            super.addView(view);
            return this;
        }
    }

    showLoading() {
        if (this._cache.loadingView == null) {
            this._cache.loadingView = dh.IO.loadingForComponent(this);
            this._cache.loadingView.show();
        }
    }

    hideLoading() {
        if (this._cache.loadingView != null) {
            this._cache.loadingView.hide();
            this._cache.loadingView = null;
        }
    }

    dismissQuicklyLayout() {
        while (this._cache.listQuicklyLayout.size() > 0) {
            this._cache.listQuicklyLayout.pop().dismiss();
        }
    }

    showQuicklyLayout() {
        var board = new QuiclyLayout();
        super.addView(board);
        return board;
    }
}


class QuiclyLayout extends BaseLayout {
    constructor() {
        super();
        var self = this;

        this.self_config = {
            swipe_to_close: -1,
            range_prevent_move: 0,
            isLockPage: false,
            show_animation: "notifyboard_open",
            hide_animation: "notifyboard_close"
        }
        this._cache.service_esc_hide = null;
        this._cache.service_back_press = null;
        this.flag = {
            has_active_touch: false,
            movable: false
        }
        this.listener = {
            onShowFullSize: null,
            onShowMinSize: null,
            onTouchOutside: null
        }
        this._cache.service_esc_hide = app.service.register.onKeyESC((event) => {
            this.dismiss();
            event.remove();
            this._cache.service_esc_hide = null;
        });
        this._cache.service_back_press = app.service.register.onBackPress(app.utils.StringUtil.randomString(5), function () {
            board.dismiss();
        });
        this.btnBelow = new BaseLayout().toFillParent().setBackground("rgba(0,0,0,0.4)").setZIndex(10000 + self.childCount());
        this.btnBelow.setAcceptClickAnimation(false);

        var notifyBoardState = {
            top: 1,
            bottom: 2,
        }
        this.setTransition("").setVisible(false).setPosition(app.constant.Position.ABSOLUTE).toFillParent();
        this.btnBelow.setTransitionAll(".3");
        this.btnBelow.setVisible(false);
        this.setOnTouch(this.onTouch);
        this.btnBelow.setOnClick(this.onClicked);
        this.setZIndex(10001);

    }

    onCreated() {
        super.onCreated();
        var self = this;
        console.log("Created panel");
        var limit_count = 0;
        var blurView;
        console.log(self.getParentView());
        self.getParentView()._super.addView(self.btnBelow);
        this.setBackground("#fff");
        new Thread(function (thread) {
            if (blurView != null) {
                blurView.opacity(1).setAnimation("opacity_open");
            }
            var childs = dhCts.allRootChilds(self.info.id);
            if (childs.size() == childs.filter(function (c) { return c != null && c.info.isCreated; }).size() || limit_count > 5) {
                limit_count++;
                thread.remove();
                self.setVisible(true);
                self.btnBelow.setVisible(true);
                self.btnBelow.setAnimation("opacity_open");
                self.setAnimation(self.self_config.show_animation);
            }
        }, 50);
    }

    onDestroy() {
        super.onDestroy();
        if (this._cache.service_esc_hide != null) {
            this._cache.service_esc_hide.remove();
            this._cache.service_esc_hide = null;
        }
        app.service.remove(this._cache.service_back_press);
    }

    dismiss() {
        if (!this.info.isDestroy) {
            this.btnBelow.destroyWithCustomAnimation("fadeOut");
            this.destroyWithCustomAnimation(this.self_config.hide_animation);
        }
    }

    setOnTouchOutside(listener) {
        this.listener.onTouchOutside = listener;
    }

    onTouch(view, iaTouchEvent) {
        if (this.self_config.swipe_to_close == -1) {
            return;
        }
        switch (iaTouchEvent.action) {
            case dh.event.touch.TOUCH_DOWN:
                this.self_config.range_prevent_move = (view.control.offsetWidth + view.control.offsetHeight) / 2 * 0.08;
                view.setTransitionAll("0");
                movable = (this.self_config.swipe_to_close == 0 && iaTouchEvent.touchX < view.getRelativeLeft() + view.control.offsetWidth * 0.1)
                    || (this.self_config.swipe_to_close == 1 && iaTouchEvent.touchX > view.getRelativeLeft() + view.control.offsetWidth * 0.9)
                    || (this.self_config.swipe_to_close == 2 && iaTouchEvent.touchY < view.getRelativeTop() + view.control.offsetHeight * 0.1)
                    || (this.self_config.swipe_to_close == 2 && iaTouchEvent.touchY > view.getRelativeTop() + view.control.offsetHeight * 0.9);
                this.flag.has_active_touch = false;
                return false;
            case dh.event.touch.TOUCH_MOVE:
                if (!movable) {
                    return false;
                }
                if (this.self_config.swipe_to_close == 0 && (iaTouchEvent.touch_width > this.self_config.range_prevent_move || this.flag.has_active_touch)) {
                    iaTouchEvent.event.preventDefault();
                    this.flag.has_active_touch = true;
                    view.setTranslateX(iaTouchEvent.touch_width * 1.2 - this.self_config.range_prevent_move);
                } else if (this.self_config.swipe_to_close == 1 && (iaTouchEvent.touch_width < -this.self_config.range_prevent_move || this.flag.has_active_touch)) {
                    iaTouchEvent.event.preventDefault();
                    this.flag.has_active_touch = true;
                    view.setTranslateX(iaTouchEvent.touch_width * 1.2 + this.self_config.range_prevent_move);
                } else if (this.self_config.swipe_to_close == 2 && (iaTouchEvent.toch_height > -this.self_config.range_prevent_move || this.flag.has_active_touch)) {
                    iaTouchEvent.event.preventDefault();
                    this.flag.has_active_touch = true;
                    view.setTranslateY(iaTouchEvent.touch_height * 1.2 + this.self_config.range_prevent_move);
                } else if (this.self_config.swipe_to_close == 3 && (iaTouchEvent.touch_height > this.self_config.range_prevent_move || this.flag.has_active_touch)) {
                    iaTouchEvent.event.preventDefault();
                    this.flag.has_active_touch = true;
                    view.setTranslateY(iaTouchEvent.touch_height * 1.2 - this.self_config.range_prevent_move);
                }
                return this.flag.has_active_touch;
            case dh.event.touch.TOUCH_UP:
            case dh.event.touch.TOUCH_CANCEL:
                if (!this.flag.has_active_touch) {
                    return false;
                }
                if (this.self_config.swipe_to_close == 0 && iaTouchEvent.touch_width > view.control.offsetWidth * 0.4) {
                    view.setTransitionAll(".2").setTranslatePercentX(100).postDelay(function () {
                        view.setHideAnimation("");
                        view.dismiss();
                    }, 210);
                } else if (this.self_config.swipe_to_close == 1 && iaTouchEvent.touch_width < -view.control.offsetWidth * 0.4) {
                    view.setTransitionAll(".2").setTranslatePercentX(-100).postDelay(function () {
                        view.setHideAnimation("");
                        view.dismiss();
                    }, 210);
                }
                else if (this.self_config.swipe_to_close == 2 && iaTouchEvent.toch_height < -view.control.offsetHeight * 0.4) {
                    view.setTransitionAll(".2").setTranslatePercentY(-100).postDelay(function () {
                        view.setHideAnimation("");
                        view.dismiss();
                    }, 210);
                } else if (this.self_config.swipe_to_close == 3 && iaTouchEvent.touch_height > view.control.offsetHeight * 0.4) {
                    view.setTransitionAll(".2").setTranslatePercentY(100).postDelay(function () {
                        view.setHideAnimation("");
                        view.dismiss();
                    }, 210);
                } else {
                    view.setTransitionAll(".2").setTranslate(0, 0);
                }
                this.flag.has_active_touch = false;
                return true;
        }
    }

    onClicked(view) {
        console.log(this);
        switch (view.getId()) {
            case this.btnBelow.getId():
                if (this.listener.onTouchOutside != null) {
                    this.listener.onTouchOutside(this);
                } else {
                    this.dismiss();
                }
                return;
        }
    }

    setOutsideBackground(background) {
        this.btnBelow.setBackground(background);
        return this;
    }

    setLockPage(isLock) {
        this.self_config.isLockPage = isLock;
        return this;
    }
    setShowAnimation(anim) {
        this.self_config.show_animation = anim;
        return this;
    }
    setHideAnimation(anim) {
        this.self_config.hide_animation = anim;
        return this;
    }

    preventTouchOutside() {
        this.setOnTouchOutside(() => { });
        return this;
    }

    preventESCKey() {
        escHide.remove();
        return this;
    }

    getOutsidePanel() {
        return this.btnBelow;
    }

    setCloseGravity(int_gravity) {
        this.self_config.swipe_to_close = int_gravity;
        return this;
    }

    preventESCKey() {
        if (this._cache.service_esc_hide) {
            this._cache.service_esc_hide.remove();
            this._cache.service_esc_hide = null;
        }
        return this;
    }
}