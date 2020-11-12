import { BaseLayout } from './base-layout.js'
import { app_constant } from '../../res/constant.js'
import { touch_constant } from '../../core/event.js';
import { app } from '../../core/app-context.js';
import { FrameLayout } from './frame-layout.js';


export const DrawerLayout_context = {
    DIM: {
        BLUR: 0,
        BLACK: 1
    }
}
const dim_background = 'rgba(0,0,0,0.7)';


export class DrawerLayout extends BaseLayout {

    constructor(width, height) {
        super(width, height);
    }

    onInit() {
        super.onInit();
        this._view = {
            parentView: null,
            root_view: null,
            dim_view: null
        }
        this._meta = {
            direction: 0,
            current_translate: 0,
            isShowing: false,
            orgin_x: -1,
            orgin_y: -1,
            layout_width: -1,
            layout_height: -1,
            dimMode_enable: true,
            isChildScrolling: false
        }
        this._listener = {
            onPageChanged: null,
            onPageChanging: null
        }

        this.setBackground("#fff");
        this._cache.flagTouchable = false;
        this._cache.flagMoveable = false;
        this._cache.percentShowing = 0;

        this.events.override.onCreated(this.overr_onCreated.bind(this));
        this.events.override.onMeasured(this.overr_onMeasured.bind(this));
    }

    overr_onCreated(view) {
        this._view.root_view = app.mainFrame;
        this._view.parentView = this.getParentView();

        this.events.override.onTouched(this.onTouched.bind(view));
        var touch = this.onTouched.bind(view);
        this._view.root_view.events.override.onTouched(touch);
        this.events.override.onDestroy(() => {
            this._view.root_view.events.override.variables.onTouchCallbacks.remove(touch);
        })
    }
    /**
     * 
     * @param {boolean} flag 
     */
    setDimEnable(flag) {
        this._meta.dimMode_enable = flag;
        return this;
    }

    overr_onMeasured(view, width, height) {
        switch (this._meta.direction) {
            case app_constant.Direction.LEFT:
                this._meta.orgin_x = -width;
                this.setTranslateX(this._meta.orgin_x).toLeftParent().setRight("auto");
                break;
            case app_constant.Direction.RIGHT:
                this._meta.orgin_x = width;
                this.setTranslateX(this._meta.orgin_x).toRightParent().setLeft("auto");
                break;
            case app_constant.Direction.TOP:
                this._meta.orgin_y = -height;
                this.setTranslateY(this._meta.orgin_y).toTopParent().setBottom("auto");
                break;
            case app_constant.Direction.BOTTOM:
                this._meta.orgin_y = height;
                this.setTranslateY(this._meta.orgin_y).toBottomParent().setTop("auto");
                break;
        }
        this.setPosition(app_constant.Position.FIXED);

        this._meta.layout_width = width;
        this._meta.layout_height = height;
    }

    override_onAddView(view, child) {
        if (child.info.scrollType != app_constant.ScrollType.NONE) {
            child.events.override.onScrolled((view, ia_scroll_event, e) => {

            })
            child.events.override.onTouched((view, ia_touch_event) => {
                switch (ia_touch_event.action) {
                    case touch_constant.TOUCH_UP:
                        this.postDelay(() => {
                            this._meta.isChildScrolling = false;
                        }, 100);
                        break;
                    case touch_constant.TOUCH_DOWN:
                    case touch_constant.TOUCH_MOVE:
                        if (!this._meta.isChildScrolling && view.info.scrollType == app_constant.ScrollType.HORIZONTAL
                            && view._dom.scrollWidth > this.getWidth()
                            && view.getScrollX() > 0
                            && view.getScrollX() < view._dom.scrollWidth + view._dom.clientWidth
                            && Math.abs(ia_touch_event.touch_width) > Math.abs(ia_touch_event.touch_height)) {
                            this._meta.isChildScrolling = true;
                        } else if (!this._meta.isChildScrolling && view.info.scrollType == app_constant.ScrollType.VERTICAL
                            && view._dom.scrollHeight > this.getHeight()
                            && view.getScrollY() > 0
                            && view.getScrollY() < view._dom.scrollHeight + view._dom.clientHeight
                            && Math.abs(ia_touch_event.touch_width) < Math.abs(ia_touch_event.touch_height)) {
                            this._meta.isChildScrolling = true;
                        }
                        break;
                }
            })
        }
        child.events.override.onAddView(this.override_onAddView.bind(this));
    }

    onTouched(view, ia_touch_event) {
        if (this._meta.isChildScrolling) {
            return false;
        } else if (this._view.parentView && this._view.parentView.getVisibility() != app_constant.Visibility.VISIBLE
            || this._view.parentView.info.state != app_constant.VIEW_STATE.running
            || ia_touch_event.finger_count != 1) {
            return false;
        } else if ((this._meta.isShowing && view == this._view.root_view)) {
            return false;
        } else if (!this._cache.flagTouchable && !(checkCondition.bind(this))(ia_touch_event)) {
            return false;
        } else if (view == this && this._meta.isShowing) {
            if (this._meta.direction == app_constant.Direction.LEFT && ia_touch_event.touch_width > 0) {
                return false;
            } else if (this._meta.direction == app_constant.Direction.RIGHT && ia_touch_event.touch_width < 0) {
                return false;
            } else if (this._meta.direction == app_constant.Direction.TOP && ia_touch_event.touch_height > 0) {
                return false;
            } else if (this._meta.direction == app_constant.Direction.BOTTOM && ia_touch_event.touch_height < 0) {
                return false;
            }
        }

        switch (ia_touch_event.action) {
            case touch_constant.TOUCH_DOWN:
                this._cache.flagTouchable = true;
                (onTouched_down.bind(this))(ia_touch_event);
                return true;
            case touch_constant.TOUCH_MOVE:
                ia_touch_event._e.preventDefault();
                (onTouched_move.bind(this))(ia_touch_event);
                return true;
            case touch_constant.TOUCH_UP:
            case touch_constant.TOUCH_CANCEL:
            case touch_constant.TOUCH_OUTSIDE:
                (onTouched_up.bind(this))(ia_touch_event);
                return true;
        }


    }

    /**
     * set the direction of layout, swipe from left, right ,top or bottom,
     * default from left
     * @param {int} direction 
     */
    setDirection(direction) {
        this._meta.direction = direction;
        return this;
    }

    setOnPageChanging(cb) {
        this._listener.onPageChanging = cb;
    }

    setOnPageChanged(cb) {
        this._listener.onPageChanged = cb;
    }

    openPage() {
        this._meta.isShowing = true;
        switch (this._meta.direction) {
            case app_constant.Direction.LEFT:
            case app_constant.Direction.RIGHT:
                this.setTransition("all", ".4", "cubic-bezier(0,0.2,0.1,1)").setTranslateX(0);
                break;
            case app_constant.Direction.TOP:
            case app_constant.Direction.BOTTOM:
                this.setTransition("all", ".4", "ease-out").setTranslateY(0);
                break;
        }
        if (this._meta.dimMode_enable && this._view.dim_view == null) {
            this._view.dim_view = newDimView(this);
            this._view.parentView.addView(this._view.dim_view);
        }
        if (this._listener.onPageChanging) {
            this._cache.percentShowing = 100;
            this._listener.onPageChanging(this, this._meta.isShowing, this._cache.percentShowing);
        }
        if (this._listener.onPageChanged) {
            this._listener.onPageChanged(this, this._meta.isShowing);
        }
    }

    closePage() {
        this._meta.isShowing = false;
        switch (this._meta.direction) {
            case app_constant.Direction.LEFT:
            case app_constant.Direction.RIGHT:
                this.setTransition("all", ".3", "ease-out").setTranslateX(this._meta.orgin_x);
                break;
            case app_constant.Direction.TOP:
            case app_constant.Direction.BOTTOM:
                this.setTransition("all", ".3", "ease-out").setTranslateY(this._meta.orgin_y);
                break;
        }
        if (this._view.dim_view) {
            this._view.dim_view.setTransition("opacity", ".2").setOpacity(0).postDelay(view => {
                view.destroy();
            }, 210);
            this._view.dim_view = null;
        }
        if (this._listener.onPageChanging) {
            this._cache.percentShowing = 0;
            this._listener.onPageChanging(this, this._meta.isShowing, this._cache.percentShowing);
        }
        if (this._listener.onPageChanged) {
            this._listener.onPageChanged(this, this._meta.isShowing);
        }
    }

    setTouchFocusToView(view) {
        view.events.override.onTouched(this.onTouched);
    }

    isOpening() {
        return this._meta.isShowing;
    }
    // get isOpening(){
    //     return this._meta.isShowing;
    // }
}



function checkCondition(ia_touch_event) {
    switch (this._meta.direction) {
        case app_constant.Direction.LEFT:
            if (ia_touch_event.firstX > 20 && !this._meta.isShowing) {
                return false;
            }
            return true;
        case app_constant.Direction.RIGHT:
            if (Math.abs(ia_touch_event.firstX) < this.getRelativeLeft() - 30 && !this._meta.isShowing) {
                return false;
            }
            return true;
        case app_constant.Direction.TOP:
            if (ia_touch_event.firstY - this._view.parentView.getRelativeTop() > 30 && !this._meta.isShowing) {
                return false;
            }
            return true;
        case app_constant.Direction.BOTTOM:
            if (Math.abs(ia_touch_event.firstY) < Math.abs(this.getRelativeTop() - 30) && !this._meta.isShowing) {
                return false;
            }
            return true;
    }
    return false;
}

function onTouched_down(ia_touch_event) {
    this.setTransition("transform", "0", "ease-out");
}

function onTouched_move(ia_touch_event) {
    switch (this._meta.direction) {
        case app_constant.Direction.LEFT:
            if (this._meta.isShowing && Math.abs(ia_touch_event.touch_width) < 30) {
                return;
            } else if (Math.abs(ia_touch_event.touch_width) > 20) {
                this._cache.current_translate = (!this._meta.isShowing ? this._meta.orgin_x - 20 : 30) + ia_touch_event.touch_width;
                this._cache.current_translate = this._cache.current_translate > 0 ? 0 : this._cache.current_translate;
                this._cache.percentShowing = (this._meta.layout_width + this._cache.current_translate) * 100 / this._meta.layout_width;
                this.setTranslateX(this._cache.current_translate);
                ia_touch_event._e.preventDefault();
            }
            break;
        case app_constant.Direction.RIGHT:
            if (this._meta.isShowing && Math.abs(ia_touch_event.touch_width) < 30) {
                return;
            } else if (Math.abs(ia_touch_event.touch_width) > 20) {
                this._cache.current_translate = (!this._meta.isShowing ? this._meta.orgin_x + 20 : -30) + ia_touch_event.touch_width;
                this._cache.current_translate = this._cache.current_translate < 0 ? 0 : this._cache.current_translate;
                this._cache.percentShowing = (this._meta.layout_width - this._cache.current_translate * 100 / this._meta.layout_width);
                this.setTranslateX(this._cache.current_translate);
                ia_touch_event._e.preventDefault();
            }
            break;
        case app_constant.Direction.TOP:
            if (this._meta.isShowing && Math.abs(ia_touch_event.touch_height) < 30) {
                return;
            } else if (Math.abs(ia_touch_event.touch_height) > 20) {
                this._cache.current_translate = (!this._meta.isShowing ? this._meta.orgin_y - 20 : 30) + ia_touch_event.touch_height;
                this._cache.current_translate = this._cache.current_translate > 0 ? 0 : this._cache.current_translate;
                this._cache.percentShowing = (this._meta.layout_height + this._cache.current_translate) * 100 / this._meta.layout_height;
                this.setTranslateY(this._cache.current_translate);
                ia_touch_event._e.preventDefault();
            }
            break;
        case app_constant.Direction.BOTTOM:
            if (this._meta.isShowing && Math.abs(ia_touch_event.touch_height) < 30) {
                return;
            } else if (Math.abs(ia_touch_event.touch_height) > 20) {
                this._cache.current_translate = (!this._meta.isShowing ? this._meta.orgin_y + 20 : -30) + ia_touch_event.touch_height;
                this._cache.current_translate = this._cache.current_translate < 0 ? 0 : this._cache.current_translate;
                this._cache.percentShowing = (this._meta.layout_height - this._cache.current_translate) * 100 / this._meta.layout_height;
                this.setTranslateY(this._cache.current_translate);
                ia_touch_event._e.preventDefault();
            }
            break;
    }
    this._cache.percentShowing = this._cache.percentShowing;
    if (this._listener.onPageChanging) {
        this._listener.onPageChanging(this, this._meta.isShowing, this._cache.percentShowing);
    }
    if (this._meta.dimMode_enable && this._view.dim_view == null && this._cache.percentShowing >= 10) {
        this._view.dim_view = newDimView(this);
        this._view.parentView.addView(this._view.dim_view);
    } else if (this._view.dim_view) {
        this._view.dim_view.setOpacity(this._cache.percentShowing * 0.01);
    }
}

function onTouched_up(ia_touch_event) {
    this._cache.flagTouchable = false;
    this.setTransition("transform", ".2", "ease-out");
    switch (this._meta.direction) {
        case app_constant.Direction.LEFT:
            if (this._meta.isShowing && ia_touch_event.touch_width > -this._meta.layout_width * 0.3) {
                this.setTranslateX(0);
                return;
            } else if (Math.abs(ia_touch_event.touch_width) > this._meta.layout_width / 2 && !this._meta.isShowing) {
                this._meta.isShowing = true;
                this.setTranslateX(0);
            } else {
                this._meta.isShowing = false;
                this.setTranslateX(this._meta.orgin_x);
            }
            break;
        case app_constant.Direction.RIGHT:
            if (this._meta.isShowing && ia_touch_event.touch_width < this._meta.layout_width * 0.3) {
                this.setTranslateX(0);
                return;
            } else if (Math.abs(ia_touch_event.touch_width) > this._meta.layout_width / 2 && !this._meta.isShowing) {
                this._meta.isShowing = true;
                this.setTranslateX(0);
            } else {
                this._meta.isShowing = false;
                this.setTranslateX(this._meta.orgin_x);
            }
            break;
        case app_constant.Direction.TOP:
            if (this._meta.isShowing && ia_touch_event.touch_height > -this._meta.layout_height * 0.3) {
                this.setTranslateY(0);
                return;
            } else if (Math.abs(ia_touch_event.touch_height) > this._meta.layout_height / 2 && !this._meta.isShowing) {
                this._meta.isShowing = true;
                this.setTranslateY(0);
            } else {
                this._meta.isShowing = false;
                this.setTranslateY(this._meta.orgin_y);
            }
            break;
        case app_constant.Direction.BOTTOM:
            if (this._meta.isShowing && ia_touch_event.touch_height < this._meta.layout_height * 0.3) {
                this.setTranslateY(0);
                return;
            } else if (Math.abs(ia_touch_event.touch_height) > this._meta.layout_height / 2 && !this._meta.isShowing) {
                this._meta.isShowing = true;
                this.setTranslateY(0);
            } else {
                this._meta.isShowing = false;
                this.setTranslateY(this._meta.orgin_y);
            }
            break;
    }
    if (this._view.dim_view && this._meta.isShowing) {
        this._view.dim_view.setOpacity(1);
        this._cache.percentShowing = 100;
    } else if (this._view.dim_view) {
        this._cache.percentShowing = 0;
        this._view.dim_view.setTransition("opacity", ".2")
            .setOpacity(0)
            .postDelay(view => {
                view.destroy();
            }, 210);

    }
    if (this._listener.onPageChanging) {
        this._listener.onPageChanging(this, this._meta.isShowing, this._cache.percentShowing);
    }
    if (this._listener.onPageChanged) {
        this._listener.onPageChanged(this, this._meta.isShowing);
    }
}

function onTouched_cancel(ia_touch_event) {

}

function newDimView(drawerLayout) {
    let dim = new FrameLayout().toFillParent();
    dim.setOpacity(0)
        .setAbsoluteZIndex(drawerLayout.getZIndex() - 1)
        .setTransition("opacity", '.1')
        .setBackground(dim_background);

    dim.setOnClick(() => {
        drawerLayout.closePage();
    })
    var isPreventTouch = false;
    let backEvent = app.service.register.onBackPress("", "", () => {
        drawerLayout.closePage();
        backEvent = null;
    });
    dim.setOnTouch((view, ia_touch_event) => {
        if (!isPreventTouch) {
            drawerLayout.onTouched(drawerLayout, ia_touch_event);
        }
    })

    dim.events.override.onDestroy(() => {
        drawerLayout._view.dim_view = null;
        console.log("backEvent", backEvent);
        if (backEvent) {
            backEvent.remove();
        }
    })
    dim.events.override.onPaused((view) => {
        isPreventTouch = true;
    })
    dim.events.override.onResume((view) => {
        isPreventTouch = false;
    })
    if (drawerLayout._meta.isShowing) {
        dim.setTransition("opacity", ".2").postDelay(v => { v.setOpacity(1) }, 40);
    }
    return dim;
}
