
import { View } from "../../core/view.js";
import { app_constant } from "../../res/constant.js";
import { FrameLayout } from "../layout/frame-layout.js";
import { senjs } from "../../index.js";
import { BaseAdapter } from "../../adapter/base-adapter.js";

export class BaseList extends View {
    constructor() {
        super(document.createElement("div"));
        this.view = {};
        this.view.frame_dataList = new FrameLayout(app_constant.Size.FILL_PARENT, app_constant.Size.WRAP_CONTENT);

        this.view.panel_loadmore = new senjs.layout.LinearLayout("100%")
            .toLeftParent().toRightParent()
            .setGravity(senjs.constant.Gravity.CENTER)
            .setVisibility(senjs.constant.Visibility.GONE);

        this.view.icon_loadmore = new senjs.widget.IconView("autorenew")
            .setPadding(8)
            .setClassName('rotate_infinite')
            .setTextAlign(senjs.constant.TextAlign.CENTER)
            .setIconColor(senjs.res.material_colors.Grey.g600)
            .setIconSize(senjs.res.dimen.icon.larger);

        this.adapter = {};
        this.setScrollType(app_constant.ScrollType.VERTICAL);
        this.listener = {
            onItemClicked: null,
            onItemLongClicked: null,
            onScrollToBottom: null
        };



        this._meta.hasBindScroll = false;
        this.view.panel_loadmore.addView(this.view.icon_loadmore);
        this.addView(this.view.frame_dataList)
            .addView(this.view.panel_loadmore);
    }

    onCreated(view) {

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
            rootView.setOnClick(function (view) {
                if (self.listener.onItemClicked != null) {
                    self.listener.onItemClicked(view.getTag().convertView, adapter.getItem(view.getTag().position), view.getTag().position);
                } else {
                    view.setAcceptClickAnimation(false);
                }
            });

            rootView.setOnLongClick(function (view) {
                console.log("long click");
                if (self.listener.onItemLongClicked) {
                    self.listener.onItemLongClicked(adapter.getView(view.getTag().position), adapter.getItem(view.getTag()), view.getTag());
                } else {
                    view.setAcceptClickAnimation(false);
                }
            });

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
            this.adapter._bind(onRenderDataView, this.view.frame_dataList.info.id);
        } else {
            this.view.frame_dataList.events.override.onCreated(() => {
                this.setAdapter(adapter);
            })
        }
        return this;
    }

    setOnItemClicked(callback) {
        this.listener.onItemClicked = callback;
        return this;
    }

    setOnItemLongClicked(callback) {
        this.listener.onItemLongClicked = callback;
        return this;
    }

    setOnScrollToBottom(callback) {
        if (!this._meta.hasBindScroll) {
            this._meta.hasBindScroll = true;
            this.events.override.onScrolled((view, ia_event) => {
                console.log(ia_event);
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
        return this;
    }
    hideLoadMoreProgress() {
        this.view.panel_loadmore.setVisibility(senjs.constant.Visibility.GONE);
        return this;
    }


}