import { BaseLayout } from "./base-layout.js";
import { LinearLayout } from "./linear-layout.js";
import { ScreenUtil } from "../../util/screen-util.js";
import { FrameLayout } from "./frame-layout.js";
import { List } from "../../util/list-util.js";
import { IconView } from "../widget/icon-view.js";
import { app_constant } from "../../res/constant.js";
import { app_theme } from "../../res/theme.js";
import { senjsCts, app, Thread } from "../../core/app-context.js";
import { TextView } from "../widget/text-view.js";
import { app_size } from "../../res/dimen.js";
import { Waiter } from "../../core/waiter.js";
import { senjs } from "../../index.js";
import { RouterUtil } from "../../util/router-util.js";
import { View } from "../../core/view.js";

const _view_config = {
    limit_text_toolbar_left: 10,
    icon_back: "arrow_back_ios",
    icon_color: "#222",
    default_toolbar_height: '4em'
}

export class StoryLayout extends BaseLayout {
    constructor(width, height) {
        super(width, height);
        this._view = {};
        this._meta = {
            pages: new List(),
            titles: new List(),
            toolbarViews: new List(),
            backIconsName: new List(),
            saveStates: new List(),
            toolbarVisibilityState: new List(),
            toolbarOffsetTop: new List(),
            instances: new List(),
        }

        this._tracking = {
            allow_new_page: true
        }
        this._listener = {
            onPageChanged: null,
            onPageBeginChange: null,
            onBackClicked: null
        }
        this._view.toolbar = new LinearLayout();

        this._view.toolbar
            .setBackground(app_theme.storyLayout.toolbar)
            .setWidth("100%").toLeftParent().toRightParent().toTopParent()
            .setHeight(_view_config.default_toolbar_height)
            .setShadow(app_theme.storyLayout.toolbar_shadow, 0, 0, 2);

        this._view.toolbar_pn_left = new LinearLayout("25%", "100%").setGravity(app_constant.Gravity.CENTER_LEFT);
        this._view.toolbar_pn_center = new FrameLayout("60%", "100%").setGravity(app_constant.Gravity.CENTER);
        this._view.toolbar_pn_right = new LinearLayout("25%", "100%").setGravity(app_constant.Gravity.CENTER_RIGHT)
        this._view.toolbar_btn_back = new IconView(_view_config.icon_back);
        this._view.toolbar_btn_back
            .setAbsoluteZIndex(2).setHeight("100%").setPaddingLeft(10);
        this._view.toolbar_lb_left = new TextView();
        this._view.toolbar_lb_left
            .setTextAlign("left")
            .ellipsis()
            .setAbsoluteZIndex(1)
            .setTextSize('70%')
            .bold();

        this._view.toolbar
            .addView(this._view.toolbar_pn_left)
            .addView(this._view.toolbar_pn_center)
            .addView(this._view.toolbar_pn_right);

        this._view.toolbar_pn_left
            .addView(this._view.toolbar_btn_back)
            .addView(this._view.toolbar_lb_left);

        this._view.frame_content = new FrameLayout("100%");
        this._view.frame_content
            .toTopParent()
            .toLeftParent()
            .toRightParent()
            .toBottomParent();

        // Must be call super to addview to avoid override funciton
        super.addView(this._view.frame_content);
        super.addView(this._view.toolbar);


        this._view.toolbar_btn_back.setOnClick((view) => {
            if (this._meta.pages.size() == 1 && this._meta.instances.size() > 0) {
                this._meta.instances.pop().destroyWithCustomAnimation("storyBoard_instance_out");
            } else {
                var prevent = false;
                if (this._listener.onBackClicked) {
                    prevent = this._listener.onBackClicked(this, this._meta.pages.size() - 1);
                    prevent = prevent == undefined ? true : prevent;
                }
                if (!prevent)
                    this.backPage();
            }
        })

        this._view.toolbar_lb_left.setOnClick(() => {
            this._view.toolbar_btn_back.events.perform.click();
        })
        this.newPage();
    }

    /**
     * @description Create a new blank page
     * @param title:string - the header text of page - place at toolbar
     */
    newPage(title) {
        let frame_newPage = new FrameLayout();
        let lb_newTitle = new TextView().bold()
            .setWidth("100%")
            .ellipsis()
            .toFillParent()
            .setTextGravity(app_constant.Gravity.CENTER);
        lb_newTitle.setText(title || "");
        frame_newPage
            .setBackground(app_theme.storyLayout.container)
            .setScrollType(app_constant.ScrollType.VERTICAL)
            .toFillParent().setTop(_view_config.default_toolbar_height)
            .setAbsoluteZIndex(this._meta.pages.size() + 2);

        frame_newPage.events.override.onResume(() => {
            if (this._listener.onPageChanged) {
                this._listener.onPageChanged(this, this._meta.pages.size() - 1, true);
            }
        });


        var frame_prevent = new FrameLayout().toFillParent();
        var closePage;
        if (this._meta.pages.size() >= 1) {
            closePage = this._meta.pages.last();
            let closeTitle = this._meta.titles.last();
            closeTitle.setAnimation("storyBoardTitleClose").postDelay((view) => {
                view.setVisibility(app_constant.Visibility.GONE);
            }, closeTitle.getAnimationDuration());
            var text = closeTitle.getText();
            text = text.length > _view_config.limit_text_toolbar_left ? `${text.substring(0, _view_config.limit_text_toolbar_left)}...` : text;
            this._view.toolbar_lb_left.setTextWithAnimation(text, "openPageFromRight");
            var view_right = this._meta.toolbarViews.last();
            if (view_right) {
                view_right.setVisibility(app_constant.Visibility.GONE);
            }
        }

        this._meta.pages.add(frame_newPage);
        this._meta.titles.add(lb_newTitle);
        this._meta.toolbarViews.add(null);
        this._meta.backIconsName.add(null);
        this._view.toolbar_btn_back.updateIcon(_view_config.icon_back);

        this._view.toolbar_pn_center
            .addView(lb_newTitle);

        this._view.frame_content
            .addView(frame_newPage);

        if (this._listener.onPageBeginChange) {
            this._listener.onPageBeginChange(this, this._meta.pages.size() - 1, true);
        }


        if (this._meta.pages.size() > 1 || this._meta.instances.size() > 0) {
            frame_newPage.setVisibility(app_constant.Visibility.INVISIBLE);
            lb_newTitle.setVisibility(app_constant.Visibility.INVISIBLE);

            checkAllChildCreated.bind(this)().then(() => {
                frame_newPage.setVisibility(app_constant.Visibility.VISIBLE);
                lb_newTitle.setVisibility(app_constant.Visibility.VISIBLE)
                lb_newTitle.setAnimation("storyBoardTitleOpen");
                frame_newPage.setAnimation("storyBoardOpen");
                // var layer_black = new FrameLayout();
                // layer_black
                //     .setBackground("rgba(0,0,0,0)").toFillParent()
                //     .setAbsoluteZIndex(this._meta.pages.size());
                if (closePage) {
                    closePage.setAnimation("storyBoardCloseBelow").events.system.pause();
                    frame_newPage.events.override.onBeforeDestroy(() => {
                        // closePage.restoreState();
                    })
                }
                closePage._cache.pageIndex = this._meta.pages.size() - 2;
                frame_prevent.postDelay((view) => {
                    frame_prevent.destroy();
                    view.destroy();
                    closePage.saveState();
                }, frame_newPage.getAnimationDuration() + 30);
                // this._view.frame_content.addView(layer_black);
                super.addView(frame_prevent);
                this._view.toolbar_btn_back.setVisibility(app_constant.Visibility.VISIBLE);
                this._view.toolbar_lb_left.setVisibility(app_constant.Visibility.VISIBLE);
            });
        } else {
            this._view.toolbar_btn_back.setVisibility(app_constant.Visibility.GONE);
            this._view.toolbar_lb_left.setVisibility(app_constant.Visibility.GONE);
        }
        this.hasRegisterRouting = false;
        var service_back = app.service.register.onBackPress(null, null, () => {
            try {
                if (this._meta.pages.size() == 1 && this._meta.instances.size() > 0) {
                    this._meta.instances.pop().destroyWithCustomAnimation("storyBoard_instance_out");
                } else {
                    this.backPage();
                }
            } catch (err) { }
        });
        this.events.override.onDestroy(() => {
            service_back.remove();
        });
        this._meta.toolbarVisibilityState.add(senjs.constant.Visibility.VISIBLE);
        this._meta.toolbarOffsetTop.add(0);
        this.setToolbarVisibility(senjs.constant.Visibility.VISIBLE);
        return this;
    }

    override_onCreated() {
        if (this._meta.instances.size() > 0) {
            this._view.toolbar_btn_back.setVisibility(app_constant.Visibility.VISIBLE);
        }
    }

    destroy() {
        if (this._meta.instances.size() > 0) {
        } else {
            super.destroy();
        }
        return this;
    }

    /**
     * @description move to previous page
     */
    backPage() {
        switch (this._meta.pages.size()) {
            case 1:
                return this;
            case 2:
                this._view.toolbar_lb_left.setVisibility(app_constant.Visibility.GONE);
                if (this._meta.instances.size() == 0) {
                    this._view.toolbar_btn_back.setVisibility(this._meta.backIconsName.get(0) == null
                        ? app_constant.Visibility.GONE : app_constant.Visibility.VISIBLE);
                }
            default:
                this._meta.toolbarVisibilityState.pop();
                this.setToolbarVisibility(this._meta.toolbarVisibilityState.last());
                let openTitle = this._meta.titles.get(this._meta.titles.size() - 2);
                let openPage = this._meta.pages.get(this._meta.pages.size() - 2);
                openPage.restoreState();
                this._meta.backIconsName.pop();
                this._meta.toolbarOffsetTop.pop();
                if (this._meta.toolbarVisibilityState.last() != senjs.constant.Visibility.GONE) {
                    var top = this._meta.toolbarOffsetTop.last();
                    this.getPageOpening().setTop(top);
                    this._view.toolbar.setTranslateY(-top);
                }
                if (this._meta.backIconsName.last() != null) {
                    this._view.toolbar_btn_back.updateIcon(this._meta.backIconsName.last() || _view_config.icon_back);

                }
                openTitle.setVisibility(app_constant.Visibility.VISIBLE);
                if (this._meta.titles.size() >= 3) {
                    var text = this._meta.titles.get(this._meta.titles.size() - 3).getText()
                    text = text.length > _view_config.limit_text_toolbar_left ? `${text.substring(0, _view_config.limit_text_toolbar_left)}...` : text;
                    this._view.toolbar_lb_left.setTextWithAnimation(text, "fadeIn", "closePageFromRight");
                }
                this._meta.pages.pop().destroyWithCustomAnimation("storyBoardClose");
                this._meta.titles.pop().destroyWithCustomAnimation("storyBoardTitleClose_back");
                var view_right = this._meta.toolbarViews.pop();
                if (view_right) {
                    view_right.destroy();
                }
                view_right = this._meta.toolbarViews.last();
                if (view_right) {
                    view_right.setVisibility(app_constant.Visibility.VISIBLE);
                }
                if (this._listener.onPageBeginChange) {
                    this._listener.onPageBeginChange(this, this._meta.pages.size() - 2, false);
                }
                // var layer_black = new FrameLayout();

                // layer_black
                //     .setBackground("rgba(0,0,0,0)").toFillParent()
                //     .setAbsoluteZIndex(this._meta.pages.size() + 1);

                // this._view.frame_content.addView(layer_black);

                openTitle.setAnimation("storyBoardTitleOpen_back");
                openPage.setAnimation("storyBoardOpenBelow").postDelay(() => {
                    if (this._listener.onPageChanged) {
                        this._listener.onPageChanged(this, this._meta.pages.size() - 1, false);
                    }
                    // layer_black.destroy();
                }, openPage.getAnimationDuration());
                openPage.events.system.resume();
                break;
        }
        return this;
    }



    getPageOpening() {
        return this._meta.pages.last();
    }

    backToHome() {
        while (this._meta.instances.size() > 0) {
            this.backInstance();
        }
        while (this._meta.pages.size() > 1) {
            this.backPage();
        }
        return this;
    }
    /**
     * @description add view to current page opening
     */
    addView(view) {
        this._meta.pages.last().addView(view);
        return this;
    }

    addViewToRoot(view) {
        super.addView(view);
        return this;
    }

    /**
     * override 
     */
    getViewAt(index) {
        return this._meta.pages.last().getViewAt(index);
    }

    /**
     * @description set header text for page is opening
     * @param text:string
     */
    setToolbarHeader(text) {
        this._meta.titles.last().setText(text)
        return this;
    }

    /**
     * @description add a view at top right of toolbar
     * @param view:View
     */
    addViewToToolbar(view) {
        var container = this._meta.toolbarViews.last();
        if (!container) {
            container = new LinearLayout("100%", "100%")
            this._meta.toolbarViews.set(this._meta.pages.size() - 1, container);
            container.setGravity(app_constant.Gravity.CENTER_RIGHT);
            this._view.toolbar_pn_right.addView(container);
        }
        container.addView(view);
        return this;
    }

    removeViewsRightToolbar() {
        var container = this._meta.toolbarViews.last();
        if (container) {
            this._meta.toolbarViews.remove(container);
            container.destroy();
        }
        return this;
    }

    /**
     * 
     * @param {View} scroll_view 
     */
    setHideToolbarWhenScroll(scroll_view) {
        // if(true){
        //     return;
        // }
        var top = null, real_top = 0, anchor_scroll = null, is_down = false;
        var wrapper = this.getPageOpening();
        scroll_view.events.override.onScrolled((view, args) => {
            if (args.scrollY + view.getHeight() > view.getDOM().scrollHeight || args.scrollY < 0) {
                return;
            }
            if (top == null) {
                top = wrapper.getTop();
                real_top = top;
            }

            if (is_down != args.isScrollDown) {
                anchor_scroll = args.scrollY;
                is_down = args.isScrollDown;
            }
            if (args.isScrollDown && top != 0) {
                top = real_top - (args.scrollY - anchor_scroll);
                if (top > 0) {
                    wrapper.setTop(top);
                    this._view.toolbar.setTranslateY(top - real_top);
                } else if (top < 0) {
                    top = 0;
                    wrapper.setTop(0)
                    this._view.toolbar.setTranslateY(-real_top - 5);
                }
                this._meta.toolbarOffsetTop.set(this._meta.toolbarOffsetTop.size() - 1, top);
            } else if (!args.isScrollDown && top < real_top) {
                top = anchor_scroll - args.scrollY;
                if (top > real_top || args.scrollY == 0) {
                    wrapper.setTop(real_top)
                    this._view.toolbar.setTranslateY(0);
                } else if (top < real_top) {
                    wrapper.setTop(top);
                    this._view.toolbar.setTranslateY(-real_top + top);
                }
                this._meta.toolbarOffsetTop.set(this._meta.toolbarOffsetTop.size() - 1, top);
            }
        });
        return this;
    }

    /**
     * 
     * Handler the click event of left button in toolbar
     * @return true if want to prevent default action
     * @param function with param: view:StoryLayout, currentPageIndex:Number
     * 
     */
    setOnToolbarLeftIconClicked(listener) {
        this._listener.onBackClicked = listener;
    }

    /**
    * 
    * @callback onPageChange(view,pageIndex,isNext)
    * @param StoryLayout
    * @param {number} pageIndex
    * @param {boolean} isNext
    * 
    */
    /**
     * @param {onPageChange} cb - when the page has been changed this event will be called
     */
    setOnPageChanged(cb) {
        this._listener.onPageChanged = cb;
    }

    getToolbarWrapper() {
        return this._view.toolbar;
    }

    setToolbarBackground(value) {
        this._view.toolbar.setBackground(value);
        return this;
    }
    /**
     * 
     * @callback onPageBeginChange
     * @param {StoryLayout} view
     * @param {number}pageIndex - will move to page index
     * @param {boolean} isNext
     * 
     */
    /**
     * @param { onPageBeginChange } cb - when the page before change this event will be called
     * 
     * 
     */
    setOnPageBeginChange(cb) {
        this._listener.onPageBeginChange = cb;
    }

    /**
     * Set material icon for back button - must be font icon
     * @param {material icon} material_icon 
     */
    setToolbarLeftIcon(material_icon) {
        this._meta.backIconsName.set(this._meta.pages.size() - 1, material_icon)
        this._view.toolbar_btn_back.updateIcon(material_icon);
        if (this._meta.pages.size() == 1) {
            this._view.toolbar_btn_back.setVisibility(app_constant.Visibility.VISIBLE);
        }
        return this;
    }


    /**
     * set color for back button - material icon font
     * @param {string} color 
     */
    setColorBackIcon(color) {
        this._view.toolbar_btn_back.setIconColor(color);
        return this;
    }


    /**
     * New other instance of Story layout (blank page) - it is other story layout
     * @param {string} title 
     */
    newInstance(title, path) {
        this._meta.pages.last().events.system.pause();
        var hiddenPage = this._meta.pages.last();

        var layer_black = new FrameLayout().toFillParent().setBackground("rgba(0,0,0,0.2)");
        layer_black.setAnimation("fadeIn");


        var new_story_instance = new StoryLayout().toFillParent();
        new_story_instance._meta.instances = this._meta.instances;
        new_story_instance.setToolbarHeader(title);
        new_story_instance.setAnimation("storyBoard_instance_in");
        new_story_instance.newInstance = this.newInstance;

        this._meta.instances.add(new_story_instance);
        new_story_instance.setAbsoluteZIndex(this._meta.instances.size() + 3)
        layer_black.setAbsoluteZIndex(this._meta.instances.size() + 2)
        super.addView(layer_black)
        super.addView(new_story_instance);

        if (hiddenPage) {
            layer_black.postDelay((view) => {
                view.destroy();
                hiddenPage.saveState();
            }, new_story_instance.getAnimationDuration() + 30);
        } else {
            layer_black.postDelay(() => {
                layer_black.destroy();
            }, 500);
        }
        new_story_instance.events.override.onBeforeDestroy((new_story_instance) => {
            hiddenPage.restoreState();
        });
        new_story_instance.events.override.onDestroy((new_story_instance) => {
            this._meta.instances.remove(new_story_instance);

            this._meta.pages.last().events.system.resume();
        });
        return new_story_instance;
    }

    backInstance() {
        if (this._meta.instances.size() > 0) {
            this._meta.instances.pop().destroyWithCustomAnimation("storyBoard_instance_out");
        } else {
            console.warn("The instance pool is empty");
        }
        return this;
    }

    setToolbarVisibility(visibility) {
        this._meta.toolbarVisibilityState.set(this._meta.toolbarVisibilityState.size() - 1, visibility);
        this._view.toolbar.setVisibility(visibility);
        switch (visibility) {
            case app_constant.Visibility.VISIBLE:
            case app_constant.Visibility.INVISIBLE:
                if (this.getPageOpening() && this.getPageOpening().info.isCreated) {
                    this.getPageOpening().setTop(this._view.toolbar.getHeight());
                }

                //  else if (this.getPageOpening()) {
                //     this.getPageOpening().events.override.onCreated(() => {
                //         this.setToolbarVisibility(visibility);
                //     });
                // }


                // .toBelowOf(this._view.toolbar);
                break;
            case app_constant.Visibility.GONE:
                if (this.getPageOpening())
                    this.getPageOpening().toTopParent();
                break;

        }
        return this;
    }

    /**
     * @returns {StoryLayout}
     */
    getCurrentInstance() {
        return this._meta.instances.size() > 0 ? this._meta.instances.last() : this;
    }


    registerRouting(path, title) {
        this.hasRegisterRouting = true;
        RouterUtil.replacePath(path, title);
        return this;
    }
}

function checkAllChildCreated() {
    return new Promise(next => {
        new Waiter(() => {
            var childs = senjsCts.allRootChilds(this.info.id);
            var size = childs.filter(child => {
                return child.info.state == app_constant.VIEW_STATE.renderring;
            }).size();
            if (size == 0) {
                next()
            } else {
                (checkAllChildCreated.bind(this)()).then(() => {
                    next();
                });
            }
        }, 100);
    });

}