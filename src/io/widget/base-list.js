
import { View } from "../../core/view.js";
import { app_constant } from "../../res/constant.js";
import { FrameLayout } from "../layout/frame-layout.js";
import { senjs } from "../../index.js";
import { BaseAdapter } from "../../adapter/base-adapter.js";
import { List } from "../../util/list-util.js";
import { BaseAdapterV2 } from "../../adapter/base-adapter-v2.js";

export class BaseList extends View {
    constructor() {
        super(document.createElement("div"));
        if (this.view == undefined) {
            this.__render_wrapper();
        }

        this.setScrollType(app_constant.ScrollType.NONE);

        this.view.panel_loadmore = new senjs.layout.LinearLayout("100%")
            .toLeftParent().toRightParent().setBackground("rgba(255,255,255,0.05)").setRadius(0)
            .setGravity(senjs.constant.Gravity.CENTER)
            .setVisibility(senjs.constant.Visibility.GONE);

        this.view.icon_loadmore = new senjs.widget.IconView("autorenew")
            .setPadding(8)
            .setClassName('rotate_infinite')
            .setTextAlign(senjs.constant.TextAlign.CENTER)
            .setIconColor(senjs.res.material_colors.Grey.g600)
            .setIconSize(senjs.res.dimen.icon.larger);

        this.adapter = null;
        this.setScrollType(app_constant.ScrollType.VERTICAL);
        this.listener = {
            onItemClicked: null,
            onItemDoubleClicked: null,
            onItemLongClicked: null,
            onScrollToBottom: null
        };

        this.view.frame_scroller.addView(this.view.frame_dataList);

        this._meta.hasBindScroll = false;
        this._meta.enable_lazy_loading = true;
        this.view.panel_loadmore.addView(this.view.icon_loadmore);
        this.addView(this.view.frame_scroller)
            .addView(this.view.panel_loadmore);

        this.events.override.onScrolled = ((listener) => {
            this.view.frame_scroller.events.override.onScrolled(listener);
            return this;
        })
    }

    __render_wrapper() {
        this.view = {
            frame_dataList: new FrameLayout(app_constant.Size.FILL_PARENT, app_constant.Size.WRAP_CONTENT),
            frame_scroller: new FrameLayout().toFillParent("absolute").setScrollType(app_constant.ScrollType.VERTICAL)
        };
    }

    onCreated(view) {

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

    /**
     * 
     * @param {Array | List} list_data 
     */
    setList(list_data) {
        if (this.adapter == null) {
            this.adapter = new BaseAdapterV2(list_data);
            this.setAdapter(this.adapter)
        } else {
            this.adapter.setList(list_data);
        }
    }

    /**
     * 
     * @param {import("../../adapter/base-adapter-v2.js").onRenderConvertView} returnView 
     */
    setView(returnView) {
        if (this.adapter == null) {
            this.adapter = new BaseAdapterV2();
            this.setAdapter(this.adapter)
        }
        this.adapter.setView(returnView);
        return this;
    }

    /**
     * 
     * @param {BaseAdapter} adapter 
     */
    setAdapter(adapter) {
        this.adapter = adapter;
        var self = this;
        var onRenderDataView = (view, dataItem, index) => {
            var rootView = new FrameLayout();
            rootView.addView(view);
            rootView.setTag({ position: index, convertView: view });
            rootView.setOnClick((view) => {
                if (self.listener.onItemClicked != null) {
                    self.listener.onItemClicked(view.getTag().convertView, adapter.getItem(view.getTag().position), view.getTag().position);
                }
            });

            rootView.setOnLongClick((view) => {
                if (self.listener.onItemLongClicked) {
                    self.listener.onItemLongClicked(adapter.getView(view.getTag().position), adapter.getItem(view.getTag()), view.getTag());
                }
            });

            if (self.listener.onItemDoubleClicked) {
                rootView.setOnDoubleClick((view) => {
                    self.listener.onItemDoubleClicked(view.getTag().convertView, adapter.getItem(view.getTag().position), view.getTag().position);
                });

            }

            rootView.reload = function (v, item, position) {
                view = v;
                dataItem = item;
                index = position;
                this.setTag({ position: position, convertView: v });
            }
            this.view.frame_dataList.addView(rootView);
            return rootView;
        }
        if (this.info.isCreated) {
            this.adapter._bind(onRenderDataView, this.info.id);
        } else {
            this.view.frame_dataList.events.override.onCreated(() => {
                this.setAdapter(adapter);
            })
        }
        return this;
    }

    setScrollY(value) {
        this.view.frame_scroller.setScrollY(value);
        return this;
    }

    setOnItemClicked(callback) {
        this.listener.onItemClicked = callback;
        return this;
    }

    setOnItemLongClicked(callback) {
        this.adapter.notifyDataSetChanged();
        this.listener.onItemLongClicked = callback;
        return this;
    }

    setOnItemDoubleClicked(callback) {
        this.listener.onItemDoubleClicked = callback;
        return this;
    }

    setOnScrollToBottom(callback) {
        if (!this._meta.hasBindScroll) {
            this._meta.hasBindScroll = true;
            this.view.frame_scroller.events.override.onScrolled((view, ia_event) => {
                if (this.listener.onScrollToBottom && ia_event.scrollY > view._dom.scrollHeight - view._dom.offsetHeight - 5) {
                    this.listener.onScrollToBottom(this);
                }
            })
        }
        this.listener.onScrollToBottom = callback;
    }

    showLoadMoreProgress() {
        this.view.panel_loadmore
            // .setTop(this._dom.scrollHeight - 100)
            .setVisibility(senjs.constant.Visibility.VISIBLE);
        this._cache.wt_show_loadmore = null;
        return this;
    }
    hideLoadMoreProgress() {
        this.view.panel_loadmore.setVisibility(senjs.constant.Visibility.GONE);
        return this;
    }

    setPadding(value) {
        this.view.frame_scroller.setPadding(value);
        return this;
    }

    setPaddingLeft(value) {
        this.view.frame_scroller.setPaddingLeft(value);
        return this;
    }

    setPaddingRight(value) {
        this.view.frame_scroller.setPaddingRight(value);
        return this;
    }

    setPaddingTop(value) {
        this.view.frame_scroller.setPaddingTop(value);
        return this;
    }

    setPaddingBottom(value) {
        this.view.frame_scroller.setPaddingBottom(value);
        return this;
    }

    setScrollBarHidden(flag) {
        this.view.frame_scroller.setRight(flag ? -20 : 0).setPaddingRight(20);
        return this;
    }

    setHeightSameContent(flag) {
        if (flag) {
            this._meta.enable_lazy_loading = false;
            this.view.frame_scroller.setPosition(app_constant.Position.RELATIVE).setWidth("100%").setHeight("auto");
        } else {
            this._meta.enable_lazy_loading = true;
            this.view.frame_scroller.setPosition(app_constant.Position.ABSOLUTE).toFillParent().setWidth("auto").setHeight("auto");
        }
        if (this.adapter)
            this.adapter.notifyDataSetChanged();
        return this;
    }

    setEnableLazyLoading(flag) {
        if (flag == false) {
            this._meta.enable_lazy_loading = false;
            this.view.frame_scroller.setPosition(app_constant.Position.RELATIVE).setWidth("100%").setHeight("auto");
        } else {
            this._meta.enable_lazy_loading = true;
            this.view.frame_scroller.setPosition(app_constant.Position.ABSOLUTE).toFillParent().setWidth("auto").setHeight("auto");
        }
        if (this.adapter)
            this.adapter.notifyDataSetChanged();
        return this;
    }
}