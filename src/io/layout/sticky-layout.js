
import { app_constant, app_animation } from "../../res/constant.js";
import { app_theme } from "../../res/theme.js";
import { app, senjsCts } from "../../core/app-context.js";
import { BaseLayout } from "./base-layout.js";
import { app_size } from "../../res/dimen.js";
import { senjs } from "../../index.js";
import { View } from "../../core/view.js";

const compareBound = function (view, touch_x, touch_y) {
    return (touch_x >= view.getRelativeLeft())
        && (touch_x <= view.getRelativeLeft() + view._dom.offsetWidth)
        && (touch_y >= view.getRelativeTop())
        && (touch_y <= view.getRelativeTop() + view._dom.offsetHeight)
}

var __current_sticky_showing = null;
const __sticky_direction = {
    LEFT: 0,
    RIGHT: 1,
    TOP: 2,
    BOTTOM: 3,
    INSIDE: 4,
}

export class StickyLayout extends BaseLayout {

    static get DIRECTION() {
        return __sticky_direction;
    }

    /**
     * 
     * @param {View} focusView 
     */
    constructor(focusView, direction) {
        super();
        this._view = {
            focusView: focusView
        };
        direction = direction != undefined ? direction : __sticky_direction.INSIDE;

        this._meta = {
            left: 0,
            top: 0,
            isMouseOut: false,
            mouseDownService: null,
            preventDismiss: false,
            direction: direction
        }

        this.setPosition(app_constant.Position.FIXED)
            .setWidth(focusView.getWidth())
            .setMinHeight(10)
            .setBackground(app_theme.stickyLayout.background)
            .setRadius(app_theme.stickyLayout.radius)
            .setShadow(app_theme.stickyLayout.shadow)
            .setScrollType(app_constant.ScrollType.VERTICAL)
            .setDisplayType(senjs.constant.Display.INLINE_BLOCK)
            .setAnimation(app_animation.STICKY_LAYOUT_SHOW)
            .setDirection(this._meta.direction);

        // var button_dismiss = new BaseLayout().toFillParent()
        // // .setAbsoluteZIndex(40000);
        // // this.setAbsoluteZIndex(40001);

        // app._addViewToSuperRoot(button_dismiss);
        app._addViewToSuperRoot(this);

        let mouse_down = (e) => {
            console.log("destroy");
            this.destroy();
        }

        this.getDOM().addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        this.getDOM().addEventListener('touchstart', (e) => {
            e.stopPropagation();
        })



        // button_dismiss.setOnMouseEnter((view) => {
        //     this._meta.isMouseOut = true;
        //     button_dismiss.setVisibility(app_constant.Visibility.GONE);
        // })


        // super.setOnMouseEnter(() => {
        //     this._meta.isMouseOut = false;
        //     button_dismiss.setVisibility(app_constant.Visibility.VISIBLE);
        // })

        // this._meta.mouseDownService = app.service.register.onMouseDown((service, e) => {
        //     if (senjs.app.isMobile.any() && e.targetTouches && compareBound(this, e.targetTouches[0].clientX, e.targetTouches[0].clientY)) {
        //         return;
        //     }
        //     if (this._meta && this._meta.isMouseOut && !this._meta.preventDismiss) {
        //         this.destroy();
        //     }
        // });

        this.events.override.onDestroy(() => {
            // try {
            //     button_dismiss.destroy();
            // } catch (e) { }
            setTimeout(() => {
                document.body.removeEventListener('mousedown', mouse_down);
                document.body.removeEventListener('touchstart', mouse_down);
            }, 200);
        });

        this.events.override.onCreated(() => {
            setTimeout(() => {
                document.body.addEventListener('mousedown', mouse_down);
                document.body.addEventListener('touchstart', mouse_down);
            }, 200);
        });
        this.events.override.onCreated(this.overr_onCreated.bind(this));
        // if (__current_sticky_showing != null) {
        //     __current_sticky_showing.destroy();
        // }
        // __current_sticky_showing = this;
    }

    overr_onCreated(view) {
        var limitToHide = 0, opa = 1;
        var onParentScrolled = (scrollerView, scrollX, scrollY, e) => {
            var translateToY = currentParentScrollY - scrollY;
            if (Math.abs(translateToY) < limitToHide) {
                if (translateToY < -limitToHide / 3 || translateToY > limitToHide / 3) {
                    if (translateToY > 0) {
                        opa = 1 - translateToY / (limitToHide);
                    } else {
                        opa = 1 - (-translateToY / (limitToHide));
                    }
                } else {
                    opa = 1;
                }
                view.setOpacity(opa).setTranslateY(currentParentScrollY - scrollY);
            } else {
                if (scrollerView) {
                    scrollerView.events.override.variables.onScrolledCallbacks.remove(onParentScrolled);
                }
                view.destroy();
            }
        }
        var parents = senjsCts.allParents(this._view.focusView.info.id);


        this._cache.view_parents = parents.filter(function (parent) { return parent.info.isScrollY == true || parent.info.isScrollX == true; });

        var currentParentScrollY = 0;
        if (this._cache.view_parents.size() > 0) {
            this._cache.view_parents.foreach(function (parent, idx) {
                currentParentScrollY += parent.getScrollY();
                parent.events.override.onScrolled(onParentScrolled);
            });
            limitToHide = this._cache.view_parents.get(0).getDOM().offsetHeight * 10;
        }

        this.events.override.onDestroy(() => {
            if (this._cache.view_parents.size() > 0) {
                this._cache.view_parents.foreach(function (parent, idx) {
                    parent.events.override.variables.onScrolledCallbacks.remove(onParentScrolled);
                });
                this._cache.view_parents.clear();
            }
        })
        if (this._view.focusView) {
            this._view.focusView.events.override.onPaused(() => {
                this.destroy();
            });
            this._view.focusView.events.override.onDestroy(() => {
                this.destroy();
            });
        }
    }

    override_onMeasured(view, width, height) {
        if (this._view.focusView.getRelativeTop() + height > senjs.app.info.display.SCREEN_HEIGHT) {
            this._meta.top = this._view.focusView.getRelativeTop() - height;
        }
        if (this._meta.top < 0) {
            this._meta.top = 0;
        }
        this.setLeft(this._meta.left)
            .setTop(this._meta.top);

    }

    override_onDestroy() {
        // if (__current_sticky_showing == this) {
        //     __current_sticky_showing = null;
        // }
        if (this._meta.mouseDownService) {
            this._meta.mouseDownService.remove();
        }
    }

    /**
     * Set prevent or not dismiss when touch outside 
     * @param {boolean} flag 
     */
    setPreventDismissTouchOutside(flag) {
        this._meta.preventDismiss = flag;
        return this;
    }

    setDirection(direction) {
        this._meta.direction = direction;
        switch (direction) {
            case __sticky_direction.INSIDE:
                this._meta.left = this._view.focusView.getRelativeLeft();
                this._meta.top = this._view.focusView.getRelativeTop();
                break;
            case __sticky_direction.BOTTOM:
                this._meta.left = this._view.focusView.getRelativeLeft();
                this._meta.top = this._view.focusView.getRelativeTop() + this._view.focusView.getHeight();
                break;
            case __sticky_direction.RIGHT:
                this._meta.left = this._view.focusView.getRelativeLeft() + this._view.focusView.getWidth();
                this._meta.top = this._view.focusView.getRelativeTop();
                break;
            case __sticky_direction.LEFT:
                this._meta.left = this._view.focusView.getRelativeLeft() - this.getWidth();
                this._meta.top = this._view.focusView.getRelativeTop()
                break;
        }
        this.setLeft(this._meta.left);
        this.setTop(this._meta.top);
        return this;
    }
}