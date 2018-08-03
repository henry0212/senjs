import { BaseLayout } from "./base-layout.js";
import { LinearLayout } from "./linear-layout.js";
import { ScreenUtil } from "../../util/screen-util.js";
import { FrameLayout } from "./frame-layout.js";
import { List } from "../../util/list-util.js";
import { IconView } from "../widget/icon-view.js";
import { app_constant } from "../../res/constant.js";
import { app_theme } from "../../res/theme.js";
import { dhCts, app, Thread } from "../../core/app-context.js";
import { TextView } from "../widget/text-view.js";
import { app_size } from "../../res/dimen.js";
import { Waiter } from "../../core/waiter.js";

const _view_config = {
    limit_text_toolbar_left: 10,
    icon_back: "arrow_back_ios",
    icon_color: "#222"
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
            instances: new List()
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
            .setHeight(ScreenUtil.calculateHeightSize(8))
            .setShadow(app_theme.storyLayout.toolbar_shadow, 0, 0, 2);

        this._view.toolbar_pn_left = new LinearLayout("25%");
        this._view.toolbar_pn_center = new FrameLayout("60%");
        this._view.toolbar_pn_right = new LinearLayout("25%");
        this._view.toolbar_pn_right.setGravity(app_constant.Gravity.CENTER_RIGHT);
        this._view.toolbar_btn_back = new IconView(_view_config.icon_back);
        this._view.toolbar_btn_back.setIconColor(_view_config.icon_color).setAbsoluteZIndex(2).setHeight("100%").setPaddingLeft(10);
        this._view.toolbar_lb_left = new TextView();
        this._view.toolbar_lb_left
            .setTextAlign("left")
            .setAbsoluteZIndex(1)
            .setTextSize(app_size.font.small)
            .setTextGravity(app_constant.Gravity.CENTER_LEFT)
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
            .toBelowOf(this._view.toolbar)
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
            this._view.toolbar_btn_back.performClick();
        })
        this.newPage();
    }

    /**
     * @description Create a new blank page
     * @param title:string - the header text of page - place at toolbar
     */
    newPage(title) {
        let frame_newPage = new FrameLayout();
        frame_newPage.setScrollType(app_constant.ScrollType.VERTICAL);
        let lb_newTitle = new TextView().bold()
            .ellipsis()
            .setBackground(this._view.toolbar.getBackground())
            .toFillParent().setTextGravity(app_constant.Gravity.CENTER);
        lb_newTitle.setText(title || "");
        frame_newPage
            .setBackground(app_theme.storyLayout.container)
            .toFillParent()
            .setAbsoluteZIndex(this._meta.pages.size() + 2);

        frame_newPage.events.override.onResume(() => {
            if (this._listener.onPageChanged) {
                this._listener.onPageChanged(this, this._meta.pages.size() - 1, true);
            }
        })
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
                var layer_black = new FrameLayout();
                layer_black
                    .setBackground("rgba(0,0,0,0)").toFillParent()
                    .setAbsoluteZIndex(this._meta.pages.size())
                    .setAnimation("fadeIn");
                var anim = layer_black.getAnimation();
                anim.setDuration(200);
                anim.setDelay(200);
                if (closePage) {
                    closePage.setAnimation("storyBoardCloseBelow").events.system.pause();
                    dhCts.allRootChilds(closePage.info.id).foreach(function (view_child) {
                        if (view_child._cache == null) {
                            view_child._cache = {
                                _story: {}
                            }
                        } else if (view_child._cache && view_child._cache._story == null) {
                            view_child._cache._story = {};
                        }
                        view_child._cache._story.scrollY = view_child._dom.scrollTop;
                        view_child._cache._story.scrollX = view_child.getScrollX();
                    });
                }
                closePage._cache.pageIndex = this._meta.pages.size() - 2;
                layer_black.postDelay((view) => {
                    view.destroy();
                    if (closePage && closePage._cache.pageIndex != this._meta.pages.size() - 1) {
                        closePage.setHtml("");
                    }
                    frame_prevent.destroy();

                }, frame_newPage.getAnimationDuration() + 30);
                this._view.frame_content.addView(layer_black);

                super.addView(frame_prevent);
                this._view.toolbar_btn_back.setVisibility(app_constant.Visibility.VISIBLE);
                this._view.toolbar_lb_left.setVisibility(app_constant.Visibility.VISIBLE);
            });
        } else {
            this._view.toolbar_btn_back.setVisibility(app_constant.Visibility.GONE);
            this._view.toolbar_lb_left.setVisibility(app_constant.Visibility.GONE);
        }
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
                    ?app_constant.Visibility.GONE :app_constant.Visibility.VISIBLE);
                }
            default:
                let openTitle = this._meta.titles.get(this._meta.titles.size() - 2);
                let openPage = this._meta.pages.get(this._meta.pages.size() - 2);
                this._meta.backIconsName.pop();
                this._view.toolbar_btn_back.updateIcon(this._meta.backIconsName.last());
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
                var layer_black = new FrameLayout();

                layer_black
                    .setBackground("rgba(0,0,0,0.1)").toFillParent()
                    .setAbsoluteZIndex(this._meta.pages.size() + 1)
                    .setOpacity(0)
                    .setAnimation("fadeOut");

                layer_black.getAnimation().setDuration(400);

                this._view.frame_content.addView(layer_black);

                openTitle.setAnimation("storyBoardTitleOpen_back");
                openPage.setAnimation("storyBoardOpenBelow").postDelay(() => {
                    if (this._listener.onPageChanged) {
                        this._listener.onPageChanged(this, this._meta.pages.size() - 1, false);
                    }
                    layer_black.destroy();
                }, openPage.getAnimationDuration());
                openPage.events.system.resume();
                dhCts.allChilds(openPage.info.id).foreach(function (child, position) {
                    openPage._dom.appendChild(child._dom);
                });
                try {
                    dhCts.allRootChilds(openPage.info.id).filter(item => {
                        return (item
                            && item._cache != undefined
                            && item._cache._story != undefined
                            && (item._cache._story.scrollX || 0) > 0 || (item._cache._story.scrollY || 0) > 0) || false;
                    }).foreach(child => {
                        child.setScrollX(child._cache._story.scrollX);
                        child.setScrollY(child._cache._story.scrollY);
                    })
                } catch (ex) {

                }
                break;
        }
        return this;
    }



    getPageOpening() {
        return this._meta.pages.last();
    }

    /**
     * @description add view to current page opening
     */
    addView(view) {
        this._meta.pages.last().addView(view);
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
    newInstance(title) {
        this._meta.pages.last().events.system.pause();
        var layer_black = new FrameLayout().toFillParent().setBackground("rgba(0,0,0,0.2)");
        layer_black.setAnimation("fadeIn");
        layer_black.postDelay(() => {
            layer_black.destroy();
        }, 500)
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
        new_story_instance.events.override.onDestroy((new_story_instance) => {
            this._meta.instances.remove(new_story_instance);
            this._meta.pages.last().events.system.resume();
        });
        return new_story_instance;
    }
}


function checkAllChildCreated() {
    return new Promise(next => {
        new Waiter(() => {
            var childs = dhCts.allRootChilds(this.info.id);
            var size = childs.filter(child => {
                return child.info.state == app_constant.VIEW_STATE.renderring;
            }).size();
            if (size == 0) {
                next()
            } else {
                return checkAllChildCreated.bind(this)();
            }
        }, 30);
    });

}