
import { View } from "../../core/view.js";
import { app_constant } from "../../res/constant.js";
import { FrameLayout } from "../layout/frame-layout.js";

export class BaseList extends View {
    constructor() {
        super(document.createElement("div"));
        this.view = {};
        this.view.frame_dataList = new FrameLayout(app_constant.Size.FILL_PARENT, app_constant.Size.WRAP_CONTENT);
        this.adapter = {};
        this.setScrollType(app_constant.ScrollType.VERTICAL);
        this.listener = {
            onItemClicked: null,
            onItemLongClicked: null
        };
        this.addView(this.view.frame_dataList);
    }

    onCreated(view) {

    }

    setAdapter(adapter) {
        this.adapter = adapter;
       var self = this;
        var onRenderDataView = (view, dataItem, index) => {
            var rootView = new FrameLayout();
            rootView.addView(view);
            rootView.setTag({position: index, convertView:view});
            rootView.setOnClick(function(view) {
                if (self.listener.onItemClicked != null) {
                    self.listener.onItemClicked(view.getTag().convertView, adapter.getItem(view.getTag().position), view.getTag().position);
                } else {
                    view.setAcceptClickAnimation(false);
                }
            });
            
            rootView.setOnLongClick(function(view){
                console.log("long click");
                if (self.listener.onItemLongClicked) {
                    self.listener.onItemLongClicked(adapter.getView(view.getTag().position), adapter.getItem(view.getTag()), view.getTag());
                } else {
                    view.setAcceptClickAnimation(false);
                }
            });

            rootView.reload = function(v, item, position){
                view = v;
                dataItem = item;
                index = position;
                this.setTag({position: position, convertView:v});
            }

            this.view.frame_dataList.addView(rootView);
            return rootView;
        }
        if (this.info.isCreated) {
            this.adapter._bind(onRenderDataView, this.view.frame_dataList.info.id);
        }else{
            this.view.frame_dataList.events.override.onCreated(() =>{
                this.setAdapter(adapter);
            })
        }
    }

    setOnItemClicked(callback) {
        this.listener.onItemClicked = callback;
        return this;
    }

    setOnItemLongClicked(callback) {
        this.listener.onItemLongClicked = callback;
        return this;
    }

}