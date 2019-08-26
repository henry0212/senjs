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

    notifyDataSetChanged(forceRender) {
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
* @property {number} row_index
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
            est_no_item_in_screen: 0,
            smallest_view_height: 0,
            container_height: 0,
            container_width: 0,
            lim_top: 0,
            lim_bottom: 0,
            has_rendered: false,
        }

        this._caching = {
            tracking: {
                scroll_arg: {
                    scrollY: 0,
                    scrollX: 0
                }
            },
            expected_scroll: 0,
            est_showing_index: 0
        }

        this._listener = {
            onRenderRootView: null
        }

        this._pool = {
            metaDataList: new List(),
            metaTableMap: {},
            metaShowing: new List(),
            group_view_unused: new List(),
            group_view_using: new List(),
            pagers: new List(),
            clear: function () {
                this.metaDataList.clear();
                this.group_view_unused.clear();
                this.group_view_using.clear();
                this.metaTableMap = {};
                this.metaShowing.clear();
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
        this.baseAdapter._meta._view.view_container
            .removeAllView().setMinHeight(0);
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
        // this.reset();
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
                this._meta.est_no_item_in_screen = Math.floor(this._meta.container_height / this._meta.est_view_height) + 4;
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
        console.log("compare ",this._pool.metaDataList.size() ,this.baseAdapter.getCount());
        if (this._pool.metaDataList.size() == 0 || this.baseAdapter._meta.force_render_again) {
            return false;
        } else if (this._pool.metaDataList.size() > this.baseAdapter.getCount()) {
            // var meta_removed = this._pool.metaDataList.removeRange(this.baseAdapter.getCount(), this._pool.metaDataList.size());
            // var list = meta_removed.filter(meta => {
            //     return meta.group_view != null;
            // }).toArray();
            // console.log("list",list);
            // for (var i = 0, l = list.length, meta = list[i]; i < l; ++i, meta = list[i]) {
            //     //   meta.group_view.root_view._dom.remove();
            //     meta.group_view.root_view.setVisibility(senjs.constant.Visibility.GONE);
            //     this._pool.group_view_unused.add(meta.group_view);
            //     this._pool.group_view_using.remove(meta.group_view);
            //     this._pool.metaShowing.remove(meta);
            // }
            // this._meta.row_counter = (this.baseAdapter.getCount() - (this.baseAdapter.getCount() % this.baseAdapter._meta.no_column)) / this.baseAdapter._meta.no_column;
                   return false;
        } else if (this._pool.metaDataList.size() < this.baseAdapter.getCount()) {
            this.updateRowCounter();
            let begin = this._pool.metaDataList.size(), end = this.baseAdapter.getCount();
            for (var i = begin; i < end; i++) {
                var meta = this.newMeta(i);
                // var more_anchor_y = this._pool.metaDataList
                //     .filter(item => {
                //         return item.row_index < meta.row_index;
                //     }).reduce((sum, current) => {
                //         return sum + current.more_height;
                //     }, 0);
                // meta.anchor_y += more_anchor_y;
            }
        } else {
            this.baseAdapter._meta._view.scroller.setScrollY(0);
            this._caching.tracking.scroll_arg.scrollY = 0;
            this._caching.tracking.scroll_arg.scrollX = 0;
            this.detectAndRenderWhenScroll_step2();
            this._pool.metaDataList.filter(meta => {
                return meta.group_view;
            }).foreach(meta => {
                var convertViewRebinded = this.renderConvertView(meta);
                if (convertViewRebinded.info.id != meta.group_view.convert_view.info.id) {
                    meta.group_view.root_view.removeAllView();
                    meta.group_view.root_view.addView(convertViewRebinded);
                }
                // this.baseAdapter._meta._view.view_container._dom.appendChild(groupView.root_view._dom);
                meta.group_view.root_view.reload(meta.group_view.convert_view, meta.dataItem, meta.position);

            });
            return true;
        }
        

        this._caching.tracking.scroll_arg.scrollY = 0;
        this._caching.tracking.scroll_arg.scrollX = 0;
        this.baseAdapter._meta._view.scroller.setScrollY(0);
        // this._pool.group_view_unused.clear();
        // this._pool.group_view_using.clear();
        // this._pool.metaShowing.clear();

        this.updateContainerHeight();
        this.reDrawVisibleItems();
        return true;
    }

    addItem(dataItem) {
        var more_anchor_y = this._pool.metaDataList
            .filter(item => {
                return item.row_index < meta.row_index;
            }).reduce((sum, current) => {
                return sum + current.more_height;
            }, 0);
        meta.anchor_y += more_anchor_y;
    }

    tryRenderFirstView() {
        return new Promise(next => {
            var meta = this.renderRootView(0);
            meta.group_view.root_view.setOpacity(0);
            meta.group_view.root_view.events.override.onCreated(view => {
                this._meta.smallest_view_height = this._meta.est_view_height = view.getHeight();
                next();
                meta.group_view.root_view.setOpacity(1);
            })
        })
        // .catch(err => {
        //     throw new Error(err);
        // })
    }

    newMeta(index) {
        if (index < this._pool.metaDataList.size()) {
            return this._pool.metaDataList.get(index);
        }
        //  else 
        // if (this._pool.metaTableMap["k_" + index] != undefined) {
        //     return this._pool.metaDataList.get(this._pool.metaTableMap["k_" + index]);
        // }
        var meta = {
            _self: this,
            anchor_x: 0,
            anchor_y: 0,
            position: index,
            __grv_view: null,
            has_cal_more_height: false,
            calcAnchor: function () {
                if (this.position > this._self.baseAdapter._meta.no_column - 1) {
                    this._self._meta.row_counter += this.colIndex == 0 ? 1 : 0;
                    this.row_index = this._self._meta.row_counter;
                } else {
                    this.row_index = 0;
                    this._self._meta.row_counter = 0;
                }
                this.anchor_x = ((100 / this._self.baseAdapter._meta.no_column) * this.colIndex) + "%";
                this.anchor_y = this.row_index * this._self._meta.est_view_height;
            },
            get dataItem() {
                return this._self.baseAdapter.getItem(this.position);
            },
            set group_view(val) {
                this.__grv_view = val;
                // if (val && this.has_cal_more_height == false) {
                //     this.more_height = val.root_view._dom.offsetHeight - this._self._meta.est_view_height;
                //     this.has_cal_more_height = true;
                //     if (!isNaN(this.more_height) && this.more_height != 0) {
                //         this._self._pool.metaDataList.filter(item => {
                //             return item.row_index > this.row_index;
                //         }).foreach(item => {
                //             item.anchor_y += this.more_height;
                //         });
                //     }
                //     var page_index = Math.floor(this.anchor_y / this._self._meta.container_height);
                //     if (this._self._pool.pagers.size() >= page_index) {
                //         this._self._pool.pagers.get(page_index).push(this);
                //     }
                // }
            },
            get group_view() {
                return this.__grv_view;
            },
            colIndex: index % this.baseAdapter._meta.no_column,
            row_index: this._meta.row_counter,
            more_height: 0,
            more_width: 0,
            has_rendered: false,
            get isOutside() {
                return (this.anchor_y + this._self._meta.est_view_height + this.more_height < this._self._caching.tracking.scroll_arg.scrollY - this._self._meta.lim_top
                    || this.anchor_y > this._self._caching.tracking.scroll_arg.scrollY + this._self._meta.lim_bottom);
            }
        }
        meta.calcAnchor();
        this._pool.metaTableMap["k_" + index] = this._pool.metaDataList.size();
        this._pool.metaDataList.add(meta);
        this._pool.pagers.add([]);
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
        this._pool.metaShowing.add(meta);
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
        return this.baseAdapter.getView(metaItem.dataItem, metaItem.position, (metaItem.group_view && metaItem.group_view.convert_view.info != undefined) ? metaItem.group_view.convert_view : null);
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
        if ((e.isScrollDown && e.scrollY < this._caching.expected_scroll)
            || (!e.isScrollDown && e.scrollY > this._caching.expected_scroll)) {
            return false
        } else if (e.scrollY < 0 || e.scrollY > view._dom.scrollHeight - view._dom.offsetHeight) {
            return false;
        } else if (e.scrollY < 0 || e.scrollY + view._dom.offsetHeight > view._dom.scrollHeight) {
            return false;
        }
        return true;
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
        this._caching.expected_scroll = this._meta.est_view_height * (Math.round(e.scrollY / this._meta.est_view_height) + (e.isScrollDown ? 1 : -1));
        this._caching.est_showing_index = Math.round(e.scrollY / this._meta.smallest_view_height) - 2;
        // this.detectAndRenderWhenScroll();
        //if (this._pool.metaShowing.size() < this._meta.est_no_item_in_screen) {
        this.detectAndRenderWhenScroll_step2();
        //}
        if (this._waiter.scrolling) {
            this._waiter.scrolling.remove();
        }
        this._waiter.scrolling = new senjs.Waiter(() => {
            //    if (this._pool.metaShowing.size() < this._meta.est_no_item_in_screen) {
            this.detectAndRenderWhenScrollAgain(true);
            //    }
        }, 200);
    }

    detectAndRenderWhenScroll() {
        var temp = this._pool.metaShowing.src_array.filter((meta) => {
            return meta.isOutside && meta.has_rendered;
        }).forEach(meta => {
            // for (var i = 0, l = temp.length, meta = temp[i]; i < l; ++i, meta = temp[i]) {
            if (meta.group_view) {
                if (meta.group_view.root_view._dom) {
                    // meta.group_view.root_view._dom.remove();
                    groupView.root_view.setVisibility(senjs.constant.Visibility.GONE);
                }
                this._pool.group_view_unused.add(meta.group_view);
                this._pool.group_view_using.remove(meta.group_view);
                this._pool.metaShowing.remove(meta);
                meta.group_view = null;
            }
            meta.has_rendered = false;
            // }
        });
        temp = this.baseAdapter.getList()
            // temp = this._pool.metaDataList
            .src_array
            .slice(this._caching.est_showing_index, this._caching.est_showing_index + this._meta.est_no_item_in_screen)
        // .filter((meta) => {
        //     return !meta.isOutside && meta.has_rendered == false;
        // });
        temp.forEach((dataItem, i) => {
            // for (var i = 0, l = temp.length; i < l; i++) {
            var groupView;
            var meta = this.newMeta(this._caching.est_showing_index + i);
            if (meta.isOutside || meta.has_rendered == true) {
                return;
            }
            meta.has_rendered = true;
            if (this._pool.group_view_unused.size() == 0) {
                this.renderRootView(meta.position);
            } else {
                groupView = this._pool.group_view_unused.shift();
                meta.group_view = groupView;
                try {
                    var convertViewRebinded = this.renderConvertView(meta);
                    if (convertViewRebinded.info.id != groupView.convert_view.info.id) {
                        groupView.root_view.removeAllView();
                        groupView.root_view.addView(convertViewRebinded);
                        meta.group_view.convert_view = convertViewRebinded;
                    }
                    // this.baseAdapter._meta._view.view_container._dom.appendChild(groupView.root_view._dom);
                    groupView.root_view.setVisibility(senjs.constant.Visibility.VISIBLE);
                    groupView.root_view.reload(groupView.convert_view, meta.dataItem, meta.position);
                    this._pool.group_view_using.add(groupView);
                    groupView.root_view
                        .setTop(meta.anchor_y)
                        .setLeft(meta.anchor_x);
                    //  this.detectRealSize(meta);
                } catch (e) {
                    this.renderRootView(meta.position);
                    console.warn(e);
                }
            }
            this._pool.metaShowing.add(meta);
            // }
        });
    }


    detectAndRenderWhenScroll_step2() {
        this._pool.metaShowing.src_array.filter((meta) => {
            return meta.isOutside && meta.has_rendered;
        }).forEach(meta => {
            // for (var i = 0, l = temp.length, meta = temp[i]; i < l; ++i, meta = temp[i]) {
            if (meta.group_view) {
                if (meta.group_view.root_view) {
                    // meta.group_view.root_view._dom.remove();
                    meta.group_view.root_view.setVisibility(senjs.constant.Visibility.GONE);
                }
                this._pool.group_view_unused.add(meta.group_view);
                this._pool.group_view_using.remove(meta.group_view);
                this._pool.metaShowing.remove(meta);
                meta.group_view = null;
            }
            meta.has_rendered = false;
            // }
        });

        this._pool.metaDataList
            .src_array
            .filter((meta) => {
                return !meta.isOutside && meta.has_rendered == false;
            }).forEach((meta, i) => {
                // for (var i = 0, l = temp.length; i < l; i++) {
                var groupView;
                meta.has_rendered = true;
                if (this._pool.group_view_unused.size() == 0) {
                    this.renderRootView(meta.position);
                } else {
                    groupView = this._pool.group_view_unused.shift();
                    meta.group_view = groupView;
                    try {
                        var convertViewRebinded = this.renderConvertView(meta);
                        if (convertViewRebinded.info.id != groupView.convert_view.info.id) {
                            groupView.root_view.removeAllView();
                            groupView.root_view.addView(convertViewRebinded);
                        }
                        meta.group_view.root_view.setVisibility(senjs.constant.Visibility.VISIBLE);
                        // this.baseAdapter._meta._view.view_container._dom.appendChild(groupView.root_view._dom);
                        groupView.root_view.reload(groupView.convert_view, meta.dataItem, meta.position);
                        this._pool.group_view_using.add(groupView);
                        groupView.root_view
                            .setTop(meta.anchor_y)
                            .setLeft(meta.anchor_x);
                        this.detectRealSize(meta);
                    } catch (e) {
                        this.renderRootView(meta.position);
                        console.warn(e);
                    }
                }
                this._pool.metaShowing.add(meta);
                // }
            });
    }

    detectAndRenderWhenScrollAgain() {
        var temp = this._pool.metaDataList.src_array.filter((meta) => {
            return meta.isOutside && meta.has_rendered;
        });
        for (var i = 0, l = temp.length, meta = temp[i]; i < l; ++i, meta = temp[i]) {
            if (meta.group_view) {
                if (meta.group_view.root_view) {
                    // meta.group_view.root_view._dom.remove();
                    meta.group_view.root_view.setVisibility(senjs.constant.Visibility.GONE);
                }
                this._pool.group_view_unused.add(meta.group_view);
                this._pool.group_view_using.remove(meta.group_view);
                this._pool.metaShowing.remove(meta);
                meta.group_view = null;
            }
            meta.has_rendered = false;
        }

        temp = this._pool.metaDataList.src_array
            .filter((meta) => {
                return !meta.isOutside && meta.has_rendered == false;
            });
        for (var i = 0, l = temp.length, meta = temp[i]; i < l; ++i, meta = temp[i]) {
            var groupView;
            if (this._pool.group_view_unused.size() == 0) {
                this.renderRootView(meta.position);
            } else {
                groupView = this._pool.group_view_unused.shift();
                meta.group_view = groupView;
                var convertViewRebinded = this.renderConvertView(meta);
                if (convertViewRebinded.info.id != meta.group_view.root_view.info.id && convertViewRebinded.info.id != groupView.convert_view.info.id) {
                    groupView.root_view.removeAllView();
                    groupView.root_view.addView(convertViewRebinded);
                }
                // this.baseAdapter._meta._view.view_container._dom.appendChild(groupView.root_view._dom);
                meta.group_view.root_view.setVisibility(senjs.constant.Visibility.VISIBLE);
                groupView.root_view.reload(groupView.convert_view, meta.dataItem, meta.position);
                this._pool.group_view_using.add(groupView);
                groupView.root_view
                    .setTop(meta.anchor_y)
                    .setLeft(meta.anchor_x);
                this.detectRealSize(meta);
            }
            meta.has_rendered = true;
            this._pool.metaShowing.add(meta);
        }
    }

    reDrawVisibleItems() {
        // this._pool.metaShowing.clear();
        // this._pool.group_view_unused.clear();
        var temp = this._pool.metaDataList.src_array.filter(meta => {
            return meta.group_view != null && meta.group_view.root_view;
        });
        for (let i = 0, l = temp.length, meta = temp[i]; i < l; ++i, meta = temp[i]) {
            if (meta.group_view) {
                if (meta.group_view.root_view._dom) {
                    meta.group_view.root_view._dom.remove();
                }
                this._pool.group_view_unused.add(meta.group_view);
                this._pool.group_view_using.remove(meta.group_view)
                meta.group_view = null;
            }
            meta.has_rendered = false;
        };
        temp = this._pool.metaDataList.src_array.filter(meta => {
            return !meta.isOutside;
        });
        for (let i = 0, l = temp.length, meta = temp[i]; i < l; ++i, meta = temp[i]) {
            var groupView;
            if (meta.has_rendered) {
                var convertViewRebinded = this.renderConvertView(meta);
                if (groupView.root_view && groupView.root_view != groupView.convertView && convertViewRebinded.info.id != groupView.convert_view.info.id) {
                    groupView.root_view.removeAllView();
                    groupView.root_view.addView(convertViewRebinded);
                }
                groupView.root_view.reload(groupView.convert_view, meta.dataItem, meta.position);
            } else if (this._pool.group_view_unused.size() == 0) {
                this.renderRootView(meta.position);
            } else {
                groupView = this._pool.group_view_unused.shift();
                meta.group_view = groupView;
                var convertViewRebinded = this.renderConvertView(meta);
                if (groupView.root_view && groupView.root_view != groupView.convertView && convertViewRebinded.info.id != groupView.convert_view.info.id) {
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
            meta.has_rendered = true;
            this._pool.metaShowing.add(meta);
        };
    }

    detectRealSize(meta) {
        if (meta == null || this.baseAdapter._meta.no_column > 1) {
            return meta;
        }
        setTimeout(() => {
            if (meta.row_index == 0 && meta.group_view && meta.group_view.root_view && meta.group_view.root_view._dom.offsetHeight != this._meta.est_view_height) {
                var more_height = meta.group_view.root_view._dom.offsetHeight - this._meta.est_view_height;
                this._meta.est_view_height = meta.group_view.root_view._dom.offsetHeight;
                this.baseAdapter._meta._view.view_container.setMinHeight(this._meta.est_container_height += more_height);
                var list = this._pool.metaDataList
                    .src_array
                    .filter(i => { return i.row_index > meta.row_index })
                    .filter((item, index) => {
                        item.more_height -= more_height;
                        item.anchor_y += more_height;
                        return item.groupView;
                    });
                for (var i = 0, l = list.length, item = list[i]; i < l; ++i, item = list[i]) {
                    item.group_view.root_view.setTop(item.anchor_y);
                }
            } else if (meta.group_view && meta.group_view.root_view && meta.row_index > 0 && meta.group_view.root_view._dom.offsetHeight > 0 && meta.group_view.root_view._dom.offsetHeight != this._meta.est_view_height + meta.more_height) {
                var old_more_height = meta.more_height;

                meta.more_height = meta.group_view.root_view._dom.offsetHeight - this._meta.est_view_height;
                if (meta.group_view.root_view._dom.offsetHeight < this._meta.smallest_view_height) {
                    this._meta.smallest_view_height = meta.group_view.root_view._dom.offsetHeight;
                    this._meta.est_no_item_in_screen = Math.ceil(this._meta.container_height / this._meta.smallest_view_height);
                }
                this.baseAdapter._meta._view.view_container.setMinHeight(this._meta.est_container_height += meta.more_height - old_more_height);
                var list = this._pool.metaDataList
                    .src_array
                    .filter(i => { return i.row_index > meta.row_index })
                    .filter((item, index) => {
                        item.anchor_y += (meta.more_height - old_more_height);
                        return item.group_view;
                    });
                for (var i = 0, l = list.length, item = list[i]; i < l; ++i, item = list[i]) {
                    item.group_view.root_view.setTop(item.anchor_y);
                }
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
