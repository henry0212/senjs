
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
export class StickyLayout extends BaseLayout {

    /**
     * 
     * @param {View} focusView 
     */
    constructor(focusView) {
        super();
        this._view = {
            focusView: focusView
        };

        this._meta = {
            left: this._view.focusView.getRelativeLeft(),
            top: this._view.focusView.getRelativeTop() + this._view.focusView.getHeight(),
            isMouseOut: false,
            mouseDownService: null,
            preventDismiss: false
        }

        this.setPosition(app_constant.Position.FIXED)
            .setWidth(focusView.getWidth())
            .setMinHeight(10)
            .setBackground(app_theme.stickyLayout.background)
            .setRadius(app_theme.stickyLayout.radius)
            .setShadow(app_theme.stickyLayout.shadow)
            .setScrollType(app_constant.ScrollType.VERTICAL)
            .setDisplayType(senjs.constant.Display.INLINE_BLOCK)
            .setLeft(this._meta.left)
            .setTop(this._meta.top)
            .setAnimation(app_animation.STICKY_LAYOUT_SHOW);

        var button_dismiss = new BaseLayout().toFillParent().setAbsoluteZIndex(10000);
        this.setAbsoluteZIndex(10001);

        app._addViewToRoot(button_dismiss);
        app._addViewToRoot(this);

        button_dismiss.setOnMouseEnter((view) => {
            this._meta.isMouseOut = true;
            button_dismiss.setVisibility(app_constant.Visibility.GONE);
        })


        super.setOnMouseEnter(() => {
            this._meta.isMouseOut = false;
            button_dismiss.setVisibility(app_constant.Visibility.VISIBLE);
        })

        this._meta.mouseDownService = app.service.register.onMouseDown((service, e) => {
            if (senjs.app.isMobile.any() && e.targetTouches && compareBound(this, e.targetTouches[0].clientX, e.targetTouches[0].clientY)) {
                return;
            }
            if (this._meta && this._meta.isMouseOut && !this._meta.preventDismiss) {
                this.destroy();
            }
        })

        this.events.override.onDestroy(() => {
            button_dismiss.destroy();
        })
        this.events.override.onCreated(this.overr_onCreated.bind(this));
    }

    overr_onCreated(view) {
        var limitToHide, opa = 1;
        var onParentScrolled = (parentNode, scrollX, scrollY, e) => {
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
                this.setOpacity(opa).setTranslateY(currentParentScrollY - scrollY);
            } else {
                super.destroy();
            }
        }
        var parents = senjsCts.allParents(this._view.focusView.info.id);
        var dialog = parents.toArray().find((item) => {
            return item.info._dialog;
        });
        console.log("dialog", dialog);
        if (dialog) {
            this.moveTo(dialog);
            parent = senjsCts.allParents(this._view.focusView.info.id);
        }

        this._cache.view_parents = parents.filter(function (parent) { return parent.info.isScrollY == true || parent.info.isScrollX == true; });

        var currentParentScrollY = 0;
        if (this._cache.view_parents.size() > 0) {
            this._cache.view_parents.foreach(function (parent, idx) {
                currentParentScrollY += parent.getScrollY();
                parent.events.override.onScrolled(onParentScrolled);
            });
            limitToHide = this._cache.view_parents.get(0).getDOM().offsetHeight / 3;
        }

        this.events.override.onDestroy(() => {
            if (this._cache.view_parents.size() > 0) {
                this._cache.view_parents.foreach(function (parent, idx) {
                    parent.events.override.variables.onScrolledCallbacks.remove(onParentScrolled);
                });
            }
        })
        if (this._view.focusView) {
            this._view.focusView.events.override.onPaused(() => {
                super.destroy();
            });
            this._view.focusView.events.override.onDestroy(() => {
                super.destroy();
            });
        }
    }

    override_onMeasured(view, width, height) {
        if (this._view.focusView.getRelativeTop() + height > senjs.app.info.display.SCREEN_HEIGHT) {
            this._meta.top = this._view.focusView.getRelativeTop() - height;
        }
        this.setLeft(this._meta.left)
            .setTop(this._meta.top);

    }

    override_onDestroy() {
        if (this._meta.mouseDownService) {
            this._meta.mouseDownService.remove();
        }
    }

    destroy() {
        this.destroyWithCustomAnimation(app_animation.STICKY_LAYOUT_HIDE);
        return this;
    }

    /**
     * Set prevent or not dismiss when touch outside 
     * @param {boolean} flag 
     */
    setPreventDismissTouchOutside(flag) {
        this._meta.preventDismiss = flag;
        return this;
    }
}