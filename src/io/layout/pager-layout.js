

import { BaseLayout } from './base-layout.js'
import { FrameLayout } from './frame-layout.js'
import { app_constant } from '../../res/constant.js'
import { touch_constant } from '../../core/event.js';

export class PagerLayout extends BaseLayout {
    constructor(width, height) {
        super(width, height);
        this._view = {};
        this._listener ={
            onPageChanged: null
        }
        this._meta.isChildScrolling = false;
        this._meta.currentPage = 0;
        this._meta.isSwiping = false;
        
        this._cache.currentTranslate = 0;
        this._view.frame_dataList = new FrameLayout(app_constant.Size.FILL_PARENT, app_constant.Size.WRAP_CONTENT);
        this.setScrollType(app_constant.ScrollType.HORIZONTAL);
        this.addView(this._view.frame_dataList);
    }


    override_onAddView(view, child) {
        if (child.info.scrollType != app_constant.ScrollType.NONE) {
            child.events.override.onScrolled((view, ia_scroll_event, e) => {
                e.preventDefault();
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
                        if (!this._meta.isSwiping && child.info.scrollType == app_constant.ScrollType.VERTICAL
                            && Math.abs(ia_touch_event.touch_height) > Math.abs(ia_touch_event.touch_width)) {
                            this._meta.isChildScrolling = true;
                        }
                        break;
                }
            })
        }
        child.events.override.onAddView(this.override_onAddView);
    }

    override_onTouched(view, ia_touch_event) {
        if (this._meta.isChildScrolling
            || (this._meta.currentPage == 0 && ia_touch_event.touch_width > 0)
            || (this._meta.currentPage >= this.adapter.getCount() - 1 && ia_touch_event.touch_width < 0)) {
            return;
        }
        switch (ia_touch_event.action) {
            case touch_constant.TOUCH_DOWN:
                this._view.frame_dataList.setTransition("transform", '0', 'ease-out')
                break;
            case touch_constant.TOUCH_MOVE:
                this._meta.isSwiping = true;
                this._view.frame_dataList.setTranslateX(this._cache.currentTranslate + ia_touch_event.touch_width);
                break;
            case touch_constant.TOUCH_UP:
            case touch_constant.TOUCH_CANCEL:
                var touchWidth = Math.abs(ia_touch_event.touch_width);
                if (ia_touch_event.touch_width < 0 && ia_touch_event.tick_last - ia_touch_event.tick_first < 120 && touchWidth >= this.getWidth() * 0.05) {
                    this._meta.currentPage++;
                    this._view.frame_dataList.setTransition("transform", '.2', 'ease-out');
                } else if (ia_touch_event.touch_width < 0 && Math.abs(ia_touch_event.touch_width) > this.getWidth() * 0.3) {
                    this._meta.currentPage++;
                    this._view.frame_dataList.setTransition("transform", '.3', 'ease-out');
                } else if (ia_touch_event.touch_width > 0 && ia_touch_event.tick_last - ia_touch_event.tick_first < 120 && touchWidth >= this.getWidth() * 0.05) {
                    this._meta.currentPage--;
                    this._view.frame_dataList.setTransition("transform", '.2', 'ease-out');
                } else if (ia_touch_event.touch_width > 0 && Math.abs(ia_touch_event.touch_width) > this.getWidth() * 0.3) {
                    this._meta.currentPage--;
                    this._view.frame_dataList.setTransition("transform", '.3', 'ease-out');
                } else {
                    this._view.frame_dataList.setTransition("transform", '.2', 'ease-out');
                }
                this.setCurrentPage(this._meta.currentPage);
                if(this._listener.onPageChanged){
                    this._listener.onPageChanged(this,this._meta.currentPage);
                }
                this._meta.isSwiping = false;
                break;
        }
    }




    setAdapter(adapter) {
        if(!adapter._meta){
            return;
        }
        this.adapter = adapter;
        adapter._meta.orientationType = app_constant.Orientation.HORIZONTAL;
        var onRenderDataView = (view, dataItem, index) => {
            var rootView = new FrameLayout(this.getWidth(), this.getHeight());
            rootView.addView(view);
            rootView.setTag({ position: index, convertView: view });
            rootView.reload = function (v, item, position) {
                view = v;
                dataItem = item;
                index = position;
                this.setTag({ position: position, convertView: v });
            }
            this._view.frame_dataList.setWidth(this.getWidth() * index);
            this._view.frame_dataList.addView(rootView);
            return rootView;
        }
        if (this.info.isCreated) {
            this.adapter._bind(onRenderDataView, this._view.frame_dataList.info.id);
        } else {
            this._view.frame_dataList.events.override.onCreated(() => {
                this.setAdapter(adapter);
            })
        }
    }

    setCurrentPage(index) {
        if (index > this.adapter.getCount() - 1 || index < 0) {
            throw new Error("Out of range");
        }
        this._meta.currentPage = index;
        this._cache.currentTranslate = -this._meta.currentPage * this.getWidth();
        this._view.frame_dataList.setTransition("transform",".2","ease-out").setTranslateX(this._cache.currentTranslate);
        return this;
    }


    /**
     * set callback when page has changed to other.
     * @param listener
     * @description - pass the function with two arguments function(pager, pageIndex)
     */

    setOnPageChanged(listener){
        this._listener.onPageChanged =listener;
        return this;
    }

}