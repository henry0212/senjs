
import { app_constant, app_animation } from "../../res/constant.js";
import { app_theme } from "../../res/theme.js";
import { app, dhCts } from "../../core/app-context.js";
import { BaseLayout } from "./base-layout.js";
import { app_size } from "../../res/dimen.js";


export class StickyLayout extends BaseLayout {

    constructor(focusView) {
        super();
        this._view = {};
        this._view.focusView = focusView;

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

        this._meta.mouseDownService = app.service.register.onMouseDown((service) => {
            console.log("mousedown", this._meta.isMouseOut);
            if (this._meta.isMouseOut && !this._meta.preventDismiss) {
                this.destroy();
            }
        })

        this.events.override.onDestroy(() =>{
            button_dismiss.destroy();
        })
    }

    override_onCreated(view) {
        var limitToHide, opa = 1;
        var onParentScrolled = (parentNode, scrollX, scrollY, e) => {
            console.log("scroll y", scrollY);
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

        this._cache.view_parents = dhCts.allParents(this._view.focusView.info.id).filter(function (parent) { return parent.info.isScrollY == true || parent.info.isScrollX == true; });
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
            // this._view.focusView.events.override.onPaused(() => {
            //     super.destroy();
            // });
            this._view.focusView.events.override.onDestroy(() => {
                super.destroy();
            });
        }
    }

    override_onMeasured(view, width, height) {
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