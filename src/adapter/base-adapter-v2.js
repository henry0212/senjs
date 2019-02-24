import { senjs } from "../index.js";
import { BaseList } from "../io/widget/base-list.js";
import { View } from "../core/view.js"
import { senjsCts } from "../core/app-context.js";
import { List } from "../util/list-util.js";
import { ScrollListener } from "../core/event-v2.js";


/**
 * @callback onRootViewRendering
 * @param { View } view
 * @param { any }  dataItem
 * @param { number } index
 */


/**
 * @callback onRenderConvertView
 * @param { any }  dataItem
 * @param { number } index
 * @param { View } view
 */

var queue_push_height = [];

export class BaseAdapterV2 {

    constructor(list) {

        this._pool = {

        }

        this._meta = {
            no_column: 1,
            force_render_again: true,
            _view: {
                baseListView: null,
                scroller: null,
                view_container: null
            }
        }

        this._adapterUtil = new AdapterUtil(this);
        if (list == undefined) {
            list = new senjs.util.List();
        }
        this._data = {
            list: Array.isArray(list) ? new senjs.util.List(list) : list
        }

        this._listener = {
            onRootViewRendering: null,
            onRenderConvertView: null
        }

    }

    /**
     * 
     * @param { onRootViewRendering } onRootViewRendering 
     * @param { BaseList } baseListViewComponent 
     */
    _bind(onRootViewRendering, baseListViewComponent) {
        console.log("bind", baseListViewComponent);
        this._meta._view.baseListView = !isNaN(baseListViewComponent) ? senjsCts.get(baseListViewComponent) : baseListViewComponent;
        this._meta._view.scroller = this._meta._view.baseListView.view.frame_scroller;
        this._meta._view.view_container = this._meta._view.baseListView.view.frame_dataList;
        this._listener.onRootViewRendering = onRootViewRendering;
        this._meta.force_render_again = true;
        this._adapterUtil.render();
    }


    /**
     * @returns {List}
     */
    getList() {
        return this._data.list;
    }

    /**
     * 
     * @param {number} index
     * @returns {*} dataItem
     */
    getItem(index) {
        return this._data.list.get(index);
    }

    /**
     * 
     * @param {List} list 
     */
    setList(list) {
        this._data.list = Array.isArray(list) ? new senjs.util.List(list) : list;
        if (this._meta._view.scroller) {
            this._meta._view.scroller.setScrollY(0);
        }
        this._adapterUtil.render();
        return this;
    }

    /**
     * 
     * @param {onRenderConvertView} returnView 
     */
    setView(returnView) {
        this._meta.force_render_again = true;
        this._listener.onRenderConvertView = returnView;
        return this;
    }

    /**
     * @returns {number}
     */
    getCount() {
        return this._data.list.size();
    }

    /**
     * 
     * @param {Number} number 
     */
    setColumn(number) {
        this._meta.force_render_again = true;
        this._meta.no_column = number;
        this._adapterUtil.render();
        return this;
    }

    notifyDataSetChanged() {
        this._adapterUtil.render();
        return this;
    }

    /**
     * This function only override to using
     * 
     * @param {*} dataItem 
     * @param {Number} position 
     * @param {View} convertView 
     * 
     * return the view need to show on ui that related to item
     * @returns {View} 
     */
    getView(dataItem, position, convertView) {
        return this._listener.onRenderConvertView(dataItem, position, convertView);
    }

    addItem(dataItem) {
        this._data.list.add(dataItem);
        this.notifyDataSetChanged();
        return this;
    }
}

/**
* @typedef {Object} MetadataItem
* @property {number} anchor_x
* @property {number} anchor_y
* @property {number} position
* @property {*} dataItem
* @property {number} colIndex
* @property {number} rowIndex
* @property {number} more_height
* @property {number} more_width
*/

class AdapterUtil {
    /**
     * 
     * @param {BaseAdapterV2 } adapter 
     */
    constructor(adapter) {
        this._meta = {
            row_counter: 0,
            est_view_height: 0,
            est_view_width: 0,
            est_container_height: 0,
            container_height: 0,
            container_width: 0,
            lim_top: 0,
            lim_bottom: 0,
            has_rendered: false
        }

        this._caching = {
            tracking: {
                scroll_arg: {
                    scrollY: 0,
                    scrollX: 0
                }
            },
            expected_scroll: 0
        }

        this._listener = {
            onRenderRootView: null
        }

        this._pool = {
            metaDataList: new List(),
            group_view_unused: new List(),
            group_view_using: new List(),
            clear: function () {
                this.metaDataList.clear();
                this.group_view_unused.clear();
                this.group_view_using.clear();
            }
        }

        this._waiter = {
            scrolling: null
        }

        this.baseAdapter = adapter;
    }

    reset() {
        if (this.baseAdapter._meta._view.scroller == undefined) {
            return;
        }
        this._pool.clear();
        this.baseAdapter._meta._view.scroller.setScrollY(0);
        this._caching.tracking.scroll_arg.scrollX = 0;
        this._caching.tracking.scroll_arg.scrollY = 0;
        this.baseAdapter._meta._view.view_container.removeAllView();
    }

    render() {
        if (this.baseAdapter._meta._view.view_container == undefined || this.baseAdapter._meta._view.view_container.info.isDestroy) {
            return;
        } else if (this.baseAdapter._meta._view.view_container &&
            (this.baseAdapter._meta._view.view_container.info.state == senjs.constant.VIEW_STATE.renderring
                || this.baseAdapter._meta._view.view_container.info.state == senjs.constant.VIEW_STATE.orderring)) {
            new senjs.Waiter(() => {
                this.render();
            }, 50)
            return this;
        } else if (this.baseAdapter.getCount() == 0) {
            this.reset();
            return;
        }
        if (this.reRender()) {
            return;
        }
        this.reset();
        new ScrollListener(this.onScrolling.bind(this)).bindToView(this.baseAdapter._meta._view.scroller);
        return new Promise(next => {
            if (this.baseAdapter._meta._view.view_container.info.state == senjs.constant.VIEW_STATE.pause
                && this.baseAdapter._meta._view.view_container.getHeight() == 0) {
                this.baseAdapter._meta._view.view_container.events.override.onResume(() => {
                    if (!this._meta.has_rendered) {
                        this.render()
                            .then(() => {
                                next();
                            });
                    }
                });
                return;
            }
            this.tryRenderFirstView().then(() => {
                this.updateContainerHeight();

                this._meta.container_height = this.baseAdapter._meta._view.scroller.getHeight();
                this._meta.container_width = this.baseAdapter._meta._view.scroller.getWidth();

                this._meta.lim_top = Math.floor(this._meta.est_view_height * 2);
                this._meta.lim_bottom = Math.floor(this._meta.container_height + this._meta.est_view_height * 2);
                var no_showing = (Math.round((this._meta.lim_bottom + this._meta.lim_top) / this._meta.est_view_height)) * this.baseAdapter._meta.no_column;
                if (this.baseAdapter.getCount() > no_showing) {
                    this.baseAdapter.getList().map((item, index) => {
                        this.newMeta(index);
                    });
                    for (var i = 1; i < no_showing; i++) {
                        this.renderRootView(i);
                    }

                    // for (var i = no_showing; i < this.baseAdapter.getCount(); i++) {
                    //     this.newMeta(i);
                    // }

                } else {
                    var end = this.baseAdapter.getCount();
                    for (var i = 1; i < end; i++) {
                        this.renderRootView(i);
                    }
                }
                next();
                this.baseAdapter._meta.force_render_again = false;
                // this.baseAdapter._meta._view.scroller.setScrollY(0);
            })
        });
    }

    reRender() {
        if (this._pool.metaDataList.size() == 0 || this.baseAdapter._meta.force_render_again) {
            return false;
        } else if (this._pool.metaDataList.size() > this.baseAdapter.getCount()) {
            var meta_removed = this._pool.metaDataList.removeRange(this.baseAdapter.getCount(), this._pool.metaDataList.size());
            meta_removed.filter(meta => {
                return meta.group_view != null;
            }).foreach(meta => {
                if (meta.group_view.root_view) {
                    meta.group_view.root_view._dom.remove();
                }
            });
            this._meta.row_counter = (this.baseAdapter.getCount() - (this.baseAdapter.getCount() % this.baseAdapter._meta.no_column)) / this.baseAdapter._meta.no_column;
        } else if (this._pool.metaDataList.size() < this.baseAdapter.getCount()) {
            this.updateRowCounter();
            let begin = this._pool.metaDataList.size(), end = this.baseAdapter.getCount();
            // this._pool.metaDataList.map((item, i) => {
            //     if (i >= begin && i < end) {
            //         var meta = this.newMeta(i);
            //     }
            // })
            for (var i = begin; i < end; i++) {
                var meta = this.newMeta(i);
                // var more_anchor_y = this._pool.metaDataList
                //     .filter(item => {
                //         return item.rowIndex < meta.rowIndex;
                //     }).reduce((sum, current) => {
                //         return sum + current.more_height;
                //     }, 0);
                // meta.anchor_y += more_anchor_y;
            }
        } else {
            this._meta.row_counter = (this.baseAdapter.getCount() - (this.baseAdapter.getCount() % this.baseAdapter._meta.no_column)) / this.baseAdapter._meta.no_column;
        }
        // this._caching.tracking.scroll_arg.scrollY = 0;
        // this._caching.tracking.scroll_arg.scrollX = 0;
        // this.baseAdapter._meta._view.scroller.setScrollY(0);
        this.updateContainerHeight();
        this.reDrawVisibleItems();
        return true;
    }

    addItem(dataItem) {
        var more_anchor_y = this._pool.metaDataList
            .filter(item => {
                return item.rowIndex < meta.rowIndex;
            }).reduce((sum, current) => {
                return sum + current.more_height;
            }, 0);
        meta.anchor_y += more_anchor_y;
    }

    tryRenderFirstView() {
        return new Promise(next => {
            var meta = this.renderRootView(0);
            meta.group_view.root_view.events.override.onCreated(view => {
                this._meta.est_view_height = view.getHeight();
                next();
            })
        }).catch(err => {
            throw new Error(err);
        })
    }

    newMeta(index) {
        if (index < this._pool.metaDataList.size()) {
            return this._pool.metaDataList.get(index);
        }
        var meta = {
            _self: this,
            anchor_x: 0,
            anchor_y: 0,
            position: index,
            get dataItem() {
                return this._self.baseAdapter.getItem(this.position);
            },
            colIndex: index % this.baseAdapter._meta.no_column,
            rowIndex: this._meta.row_counter,
            more_height: 0,
            more_width: 0,
            group_view: null,
            has_rendered: false,
            get isOutside() {
                return (this.anchor_y + this._self._meta.est_view_height + this.more_height < this._self._caching.tracking.scroll_arg.scrollY - this._self._meta.lim_top
                    || this.anchor_y > this._self._caching.tracking.scroll_arg.scrollY + this._self._meta.lim_bottom)

            }
        }
        if (index > this.baseAdapter._meta.no_column - 1) {
            this._meta.row_counter += meta.colIndex == 0 ? 1 : 0;
            meta.rowIndex = this._meta.row_counter;
        } else {
            meta.rowIndex = 0;
            this._meta.row_counter = 0;
        }

        meta.anchor_x = ((100 / this.baseAdapter._meta.no_column) * meta.colIndex) + "%";
        meta.anchor_y = meta.rowIndex * this._meta.est_view_height;
        this._pool.metaDataList.add(meta);
        return meta;
    }

    /**
     * 
     * @param {number} index
     * @returns {MetadataItem} 
     */
    renderRootView(index) {
        var meta = this.newMeta(index),
            convertView = this.renderConvertView(meta),
            rootView = this.baseAdapter._listener.onRootViewRendering(convertView, meta.dataItem, meta.position);
        meta.group_view = {
            convert_view: convertView,
            root_view: rootView
        }
        this._pool.group_view_using.add(meta.group_view);
        meta.group_view.root_view.setWidth(`${100 / this.baseAdapter._meta.no_column}%`);
        rootView.setPosition(senjs.constant.Position.ABSOLUTE)
            .setTop(meta.anchor_y)
            .setLeft(meta.anchor_x);
        meta.has_rendered = true;
        this.detectRealSize(meta);

        return meta;
    }

    /**
     * 
     * @param {MetadataItem} metaItem 
     * @returns {View}
     */
    renderConvertView(metaItem) {
        var v = this.baseAdapter.getView(metaItem.dataItem, metaItem.position, metaItem.group_view ? metaItem.group_view.convert_view : null);
        return v;
    }

    updateContainerHeight() {
        var total_row = this.baseAdapter.getCount() % this.baseAdapter._meta.no_column;
        total_row = (this.baseAdapter.getCount() - total_row) / this.baseAdapter._meta.no_column + (total_row > 0 ? 1 : 0);
        this._meta.est_container_height = Math.ceil(this._meta.est_view_height * total_row);
        this._meta.est_container_height += this._pool.metaDataList.sum("more_height");
        this.baseAdapter._meta._view.view_container.setMinHeight(this._meta.est_container_height);
    }
    /**
     * @param {View} view
     * @param {import("../core/event-v2.js").ScrollArgument} e 
     */
    checkScrollCondition(view, e) {
        var isValid = true;
        if (e.isScrollDown && e.scrollY < this._caching.expected_scroll
            || !e.isScrollDown && e.scrollY + this._meta.min_view_height > this._caching.expected_scroll) {
            isValid = false;
        } else if (e.scrollY < 0 || e.scrollY > view._dom.scrollHeight - view._dom.offsetHeight) {
            isValid = false;
        }
        return isValid;
    }

    /**
     * 
     * @param {View} view 
     * @param {import("../core/event-v2.js").ScrollArgument} e 
     */
    onScrolling(view, e) {
        if (!this.checkScrollCondition(view, e)) {
            return;
        }
        this._caching.tracking.scroll_arg = e;
        this._caching.expected_scroll = this._meta.est_view_height * (Math.round(e.scrollY / this._meta.est_view_height) + (e.isScrollDown ? 1 : 1));
        this.detectAndRenderWhenScroll();
        if (this._waiter.scrolling) {
            this._waiter.scrolling.remove();
        }
        this._waiter.scrolling = new senjs.Waiter(() => {
            this.detectAndRenderWhenScroll();
        }, 100);
    }

    detectAndRenderWhenScroll() {
        this._pool.metaDataList.filter((meta) => {
            return meta.isOutside && meta.has_rendered;
        }).foreach((meta) => {
            if (meta.group_view) {
                meta.group_view.root_view._dom.remove();
                this._pool.group_view_unused.add(meta.group_view);
                this._pool.group_view_using.remove(meta.group_view);
                meta.group_view = null;
            }
            meta.has_rendered = false;
        });
        var temp = this._pool.metaDataList.filter((meta) => {
            return !meta.isOutside && meta.has_rendered == false;
        });
        temp.foreach((meta) => {
            var groupView;
            meta.has_rendered = true;
            if (this._pool.group_view_unused.size() == 0) {
                this.renderRootView(meta.position);
            } else {
                groupView = this._pool.group_view_unused.shift();
                meta.group_view = groupView;
                var convertViewRebinded = this.renderConvertView(meta);
                if (convertViewRebinded.info.id != groupView.convert_view.info.id) {
                    groupView.root_view.removeAllView();
                    groupView.root_view.addView(convertViewRebinded);
                }
                this.baseAdapter._meta._view.view_container._dom.appendChild(groupView.root_view._dom);
                groupView.root_view.reload(groupView.convert_view, meta.dataItem, meta.position);
                this._pool.group_view_using.add(groupView);
                groupView.root_view
                    .setTop(meta.anchor_y)
                    .setLeft(meta.anchor_x);
                this.detectRealSize(meta);
            }
        });
    }

    reDrawVisibleItems() {
        this._pool.metaDataList.filter(meta => {
            return meta.group_view != null;
        }).foreach(meta => {
            if (meta.group_view) {
                meta.group_view.root_view._dom.remove();
                this._pool.group_view_unused.add(meta.group_view);
                this._pool.group_view_using.remove(meta.group_view)
                meta.group_view = null;
            }
            meta.has_rendered = false;
        });
        this._pool.metaDataList.filter(meta => {
            return !meta.has_rendered && !meta.isOutside;
        }).foreach(meta => {
            // meta.more_height = 0;
            meta.has_rendered = true;
            var groupView;
            if (this._pool.group_view_unused.size() == 0) {
                this.renderRootView(meta.position);
            } else {
                groupView = this._pool.group_view_unused.shift();
                meta.group_view = groupView;
                var convertViewRebinded = this.renderConvertView(meta);
                if (convertViewRebinded.info.id != groupView.convert_view.info.id) {
                    groupView.root_view.removeAllView();
                    groupView.root_view.addView(convertViewRebinded);
                }
                this.baseAdapter._meta._view.view_container._dom.appendChild(groupView.root_view._dom);
                groupView.root_view.reload(groupView.convert_view, meta.dataItem, meta.position);
                this._pool.group_view_using.add(groupView);
                groupView.root_view
                    .setTop(meta.anchor_y)
                    .setLeft(meta.anchor_x);
                this.detectRealSize(meta);
            }
        });
    }

    detectRealSize(meta) {
        if (meta == null || this.baseAdapter._meta.no_column > 1) {
            return meta;
        }
        setTimeout(() => {
            if (meta.rowIndex == 0 && meta.group_view && meta.group_view.root_view && meta.group_view.root_view._dom.offsetHeight != this._meta.est_view_height) {
                var more_height = meta.group_view.root_view._dom.offsetHeight - this._meta.est_view_height;
                this._meta.est_view_height = meta.group_view.root_view._dom.offsetHeight;
                this.baseAdapter._meta._view.view_container.setMinHeight(this._meta.est_container_height += more_height);
                this._pool.metaDataList
                    .filter(i => { return i.rowIndex > meta.rowIndex })
                    .filter((item, index) => {
                        console.log("add more size", item);
                        item.more_height -= more_height;
                        item.anchor_y += more_height;
                        return item.groupView;
                    }).foreach(item => {
                        item.group_view.root_view.setTop(item.anchor_y);
                    });
            } else if (meta.group_view && meta.group_view.root_view && meta.rowIndex > 0 && meta.group_view.root_view._dom.offsetHeight > 0 && meta.group_view.root_view._dom.offsetHeight != this._meta.est_view_height + meta.more_height) {
                var old_more_height = meta.more_height;
                meta.more_height = meta.group_view.root_view._dom.offsetHeight - this._meta.est_view_height;
                this.baseAdapter._meta._view.view_container.setMinHeight(this._meta.est_container_height += meta.more_height - old_more_height);
                this._pool.metaDataList
                    .filter(i => { return i.rowIndex > meta.rowIndex })
                    .filter((item, index) => {
                        console.log("old anchor", item.anchor_y, item.anchor_y + (meta.more_height - old_more_height));
                        item.anchor_y += (meta.more_height - old_more_height);
                        console.log("add more size", item);
                        return item.group_view;
                    }).foreach(item => {
                        item.group_view.root_view.setTop(item.anchor_y);
                    });
            }
        }, 30);
        return meta;
    }

    updateRowCounter() {
        this._meta.row_counter = (this._pool.metaDataList.size() - (this._pool.metaDataList.size() % this.baseAdapter._meta.no_column)) / this.baseAdapter._meta.no_column
        if (this._pool.metaDataList.size() % this.baseAdapter._meta.no_column == 0) {
            this._meta.row_counter--;
        }
    }

    /**
     * Update existing data
     * @param {number} position 
     * @param {*} data 
     */
    updateDataAt(position, data) {
        if (position < this._pool.metaDataList.size()) {

        }
    }
}

