import { View } from '../../core/view.js'
import { List } from '../../util/list-util.js'
import { app, senjsCts } from '../../core/app-context.js'
import { Thread } from '../../core/thread.js';
import { senjs } from '../../index.js';

export class BaseLayout extends View {

    constructor(width, height) {
        super(document.createElement("div"));
        this.setWidth(width);
        this.setHeight(height);
        this._cache.listQuicklyLayout = new List();
        this._cache.loadingView = null;

        this._super.addView = (view) => {
            super.addView(view);
            return this;
        }
    }


    showLoading() {
        if (this._cache.loadingView == null) {
            this._cache.loadingView = new senjs.widget.LoadingView().toFillParent();
            this._cache.loadingView.setCircleColor(senjs.res.material_colors.Blue.g500).setBackground("rgba(255,255,255,0.1)");
            this.addView(this._cache.loadingView);
            this._cache.loadingView.events.override.onDestroy(() => {
                this._cache.loadingView = null;
            })
        }
        return this;
    }

    hideLoading() {
        setTimeout(() => {
            if (this._cache.loadingView != null) {
                this._cache.loadingView.destroy();
            }
        }, 50);

        return this;
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
            show_animation: "storyBoard_instance_in",
            hide_animation: "storyBoard_instance_out"
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
        this._cache.service_back_press = app.service.register.onBackPress("", "", () => {
            self.dismiss();
        });
        this.btnBelow = new BaseLayout().toFillParent().setBackground("rgba(0,0,0,0.4)").setZIndex(10000 + self.childCount());
        this.btnBelow.setAcceptClickAnimation(false);

        var notifyBoardState = {
            top: 1,
            bottom: 2,
        }
        this.setTransition("").setVisible(false).setPosition(senjs.constant.Position.ABSOLUTE).toFillParent();
        this.btnBelow.setTransitionAll(".3");
        this.btnBelow.setVisible(false);
        this.setOnTouch(this.onTouch);
        this.btnBelow.setOnClick(this.onClicked.bind(this));
        this.setZIndex(10001);
        this.setBackground("#fff");
    }

    onCreated() {
        super.onCreated();
        var self = this;
        var limit_count = 0;
        var blurView;
        self.getParentView()._super.addView(self.btnBelow);
        new Thread(function (thread) {
            if (blurView != null) {
                blurView.opacity(1).setAnimation("fadeIn");
            }
            var childs = senjsCts.allRootChilds(self.info.id);
            if (childs.size() == childs.filter(function (c) { return c != null && c.info.isCreated; }).size() || limit_count > 5) {
                limit_count++;
                thread.remove();
                self.setVisible(true);
                self.btnBelow.setVisible(true);
                self.btnBelow.setAnimation("fadeIn");
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
        if (this._cache.service_back_press) {
            app.service.remove(this._cache.service_back_press);
            this._cache.service_back_press = null;
        }
    }

    dismiss() {
        if (this.info && !this.info.isDestroy) {
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
            case senjs.event.touch.TOUCH_DOWN:
                this.self_config.range_prevent_move = (view.control.offsetWidth + view.control.offsetHeight) / 2 * 0.08;
                view.setTransitionAll("0");
                movable = (this.self_config.swipe_to_close == 0 && iaTouchEvent.touchX < view.getRelativeLeft() + view.control.offsetWidth * 0.1)
                    || (this.self_config.swipe_to_close == 1 && iaTouchEvent.touchX > view.getRelativeLeft() + view.control.offsetWidth * 0.9)
                    || (this.self_config.swipe_to_close == 2 && iaTouchEvent.touchY < view.getRelativeTop() + view.control.offsetHeight * 0.1)
                    || (this.self_config.swipe_to_close == 2 && iaTouchEvent.touchY > view.getRelativeTop() + view.control.offsetHeight * 0.9);
                this.flag.has_active_touch = false;
                return false;
            case senjs.event.touch.TOUCH_MOVE:
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
            case senjs.event.touch.TOUCH_UP:
            case senjs.event.touch.TOUCH_CANCEL:
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