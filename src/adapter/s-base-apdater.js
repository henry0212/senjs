import { senjs } from "../index.js";
import { BaseList } from "../io/widget/base-list.js";
import { View } from "../core/view.js"
import { senjsCts, Thread } from "../core/app-context.js";
import { List } from "../util/list-util.js";
import { ScrollListener } from "../core/event-v2.js";
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";
import { SERIAL_EXECUTOR } from "../core/thread.js";


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

let queue_push_height = [];

let debug_tool = {
    adapters: []
}

const PRE_RENDER_ITEM = 2;

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

        this._adapterDirector = this.initAdapterDirector();
        if (list == undefined) {
            list = new senjs.util.List();
        }
        this._data = {
            list: Array.isArray(list) ? new senjs.util.List(list) : list
        }

        this._listener = {
            onRootViewRendering: null,
            onRenderConvertView: null,
            onBeginRender: null,
            onRenderFinished: null,
        }
        debug_tool.adapters.push(this);
    }

    initAdapterDirector() {
        return new AdapterDirector(this);
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
        this._adapterDirector.render();
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
        if (this._data) {
            this._data.list = Array.isArray(list) ? new senjs.util.List(list) : list;
            if (this._meta._view.scroller) {
                this._meta._view.scroller.setScrollY(0);
            }
            this._adapterDirector.render();
        }
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
        this._adapterDirector.getNumberOfColumn = function () {
            return number;
        }
        this._adapterDirector.render();
        return this;
    }

    getColumn() {
        return this._meta.no_column;
    }

    notifyDataSetChanged(forceRender) {
        this._adapterDirector.render();
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
        // var meta = this._adapterDirector.generateMetaItem(this.getCount() - 1);
        // console.log("meta", meta);
        // this._adapterDirector.updateContainerSize();
        // this._adapterDirector.scroll2Rendering();
        // this._adapterDirector.detectRealSize(meta);
        this.notifyDataSetChanged();
        return this;
    }


    // addItems(items) {
    //     if (Array.isArray(items)) {
    //         items.forEach((item) => {

    //             this.generateMetaItem();
    //         });
    //     }
    // }

    /**
     * @returns {View}
     */
    get view_scroller() {
        return this._meta._view.scroller;
    }

    /**
    * @returns {View}
    */
    get view_container() {
        return this._meta._view.view_container;
    }

    /**
    * @returns {BaseList}
    */
    get view_listview() {
        return this._meta._view.baseListView;
    }

    get hasCreated() {
        let is_created = true;
        if (this.view_container) {

            is_created =
                !(this.view_container.info.state == senjs.constant.VIEW_STATE.renderring
                    //          || this.view_container.info.state == senjs.constant.VIEW_STATE.pause
                    || this.view_container.info.state == senjs.constant.VIEW_STATE.destroy
                );
        }
        return is_created;
    }

    setOnBeginRender(listener) {
        if (listener) {
            this._listener.onBeginRender = listener.bind(this);
        }
        return;
    }

    setOnRenderFinished(listener) {
        if (listener) {
            this._listener.onRenderFinished = listener.bind(this);
        }
        return;
    }

    onBeginRender() {
        if (this._listener.onRenderFinished) {
            this._listener.onRenderFinished();
        }
        return this;
    }

    onRenderFinished() {
        if (this._listener.onRenderFinished) {
            this._listener.onRenderFinished();
        }
        return this;
    }

    notifyDatasetChangedAt(position) {
        this._adapterDirector.reRenderDataAt(position);
        return this;
    }
}


/**
* @typedef {Object} GroupView
* @property {View} root_view
* @property {View} convert_view
* 
*/
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
* @property {GroupView} group_view
*/

class AdapterDirector {
    /**
     * 
     * @param { BaseAdapterV2 } adapter 
     */
    constructor(adapter) {
        this.base_adapter = adapter;
        this._meta = {
            est_container_width: 0,
            est_container_height: 0,
            est_view_width: 0,
            est_view_height: 0,
            lim_top: 0,
            lim_bottom: 0,
            est_no_item_in_view_port: 0,
            has_rendered: false,
            container_height: 0,
            container_width: 0,
            smallest_view_height: 0,
            no_of_col: this.getNumberOfColumn(),
            holder_width: '100%',
            is_convert_view_fix_size: true,
            flag_need_render_when_resume: false
        }

        this._pool = {
            meta_list: new List(),
            meta_list_showing: new List(),
            array_meta_col_index: [],
            array_est_container_height: [],
            group_view_busy: new List(),
            group_view_free: new List(),
            remeasure_list: new List(),
        }

        this._cache = {

        }

        this._tracking = {
            scroll_x: 0,
            scroll_y: 0,
            scroll_arg: {
                scrollY: 0,
                scrollX: 0
            },
            expected_scroll: 0,
            est_showing_index: 0,
            has_bind_destroy: false,
            thread_measure: null
        }
    }

    /**
   * 
   * @param {number} position
   * @returns {MetadataItem}
   */
    generateMetaItem(position) {
        let self = this;
        let meta = {
            // __anchor: {
            //     x: 0,
            //     y: 0
            // },
            // get anchor_y() {
            //     return this
            // },
            // set anchor_y(val){

            // },
            anchor_x: 0,
            anchor_y: 0,
            row_index: 0,
            col_index: 0,
            more_height: 0,
            more_width: 0,
            position: position,
            get dataItem() {
                return self.base_adapter.getItem(position);
            },
            real_size: 0,
            __has_rendered: false,
            get has_rendered() {
                return this.__has_rendered;
            },
            set has_rendered(value) {
                this.__has_rendered = value;
                if (value == false) {
                    // this.__group_view.root_view = null;
                    // this.__group_view.convert_view = null;
                    if (this.__group_view.root_view) {
                        // this.__group_view.root_view._dom.style.display = 'none';
                    }
                    this.__group_view = {
                        root_view: null,
                        convert_view: null
                    }
                }
            },
            __group_view: {
                root_view: null,
                convert_view: null,
            },
            get group_view() {
                return this.__group_view;
            },
            set group_view(group_view) {
                this.__group_view = group_view;
            },
            refresh: function () {
                this.more_height = 0;
                this.more_width = 0;
                this.row_index = 0;
                this.col_index = 0;
                this.anchor_y = 0;
                this.anchor_x = 0;
                // this.has_rendered = false;
                this.calcAnchor();
            },
            calcAnchor: function () {
                let no_col = self._meta.no_of_col;
                let coordinates = self.getAnchorCoordinate(this, no_col);
                this.row_index = coordinates.row_index;
                this.col_index = coordinates.col_index;
                self._pool.array_meta_col_index[coordinates.col_index].push(this);
                if (no_col && no_col > 1) {
                    this.anchor_x = `${(100 / no_col) * coordinates.col_index}%`;
                } else {
                    this.anchor_x = 0;
                }

                this.anchor_y = coordinates.row_index * self._meta.est_view_height;

            },

            get is_outside() {
                return (this.anchor_y + self._meta.est_view_height + this.more_height < self._tracking.scroll_arg.scrollY - self._meta.lim_top
                    || this.anchor_y > self._tracking.scroll_arg.scrollY + self._meta.lim_bottom);
            }
        }
        meta.calcAnchor();
        this._pool.meta_list.add(meta);
        return meta;
    }

    /**
     * 
     * @param {MetadataItem} meta 
     */
    getAnchorCoordinate(meta, no_of_col) {
        return {
            row_index: Math.floor(meta.position / no_of_col),
            col_index: meta.position % no_of_col
        };
    }

    getNumberOfColumn() {
        return this.base_adapter.getColumn();
    }



    ready() {
        return new Promise((next, reject) => {
            if (this.base_adapter._listener.onRootViewRendering == null) {
                reject();
                return;
            } else if (this.base_adapter.hasCreated) {
                this._meta.container_height = this.base_adapter.view_listview.getHeight();
                this._meta.container_width = this.base_adapter.view_listview.getWidth();
                next();
            } else if (this.base_adapter.view_listview) {
                this.base_adapter.view_listview.events.override.onCreated(() => {
                    this._meta.container_height = this.base_adapter.view_listview.getHeight();
                    this._meta.container_width = this.base_adapter.view_listview.getWidth();
                    next();
                });
            }
        });
    }

    renderFirstMeta() {
        return new Promise(next => {
            if (this.base_adapter.getCount() > 0 && this._meta.est_view_height > 0) {
                let meta = this.generateMetaItem(0);
                let group_view = this.renderRootView(meta);
                var temp = group_view.root_view.getHeight();
                this._meta.est_view_height = temp > this._meta.est_view_height ? temp : this._meta.est_view_height;
                this._meta.est_view_width = group_view.root_view.getWidth();
                next();
            } else if (this.base_adapter.getCount() > 0) {
                let meta = this.generateMetaItem(0);
                let group_view = this.renderRootView(meta);
                group_view.root_view.setOpacity(0);
                group_view.root_view.events.override.onCreated((view) => {
                    setTimeout(() => {
                        this._meta.est_view_height = view.getHeight();
                        this._meta.est_view_width = view.getWidth();
                        next();
                    }, 50);
                });
            }
        });
    }

    renderAllMeta() {
        return new Promise(next => {
            let max = this.base_adapter.getCount();
            for (let i = 1; i < max; i++) {
                this.generateMetaItem(i);
            }
            let no_showing = (Math.round((this._meta.lim_bottom + this._meta.lim_top) / this._meta.est_view_height)) * this.getNumberOfColumn();
            let end = 0;
            if (this.base_adapter.view_listview._meta.enable_lazy_loading) {
                end = this.base_adapter.getCount() > no_showing ? no_showing : this.base_adapter.getCount();
            } else {
                end = this.base_adapter.getCount();
            }
            // this.base_adapter.getList().src_array.slice(1, end).map((item, position) => {
            //     this.renderRootView(this._pool.meta_list.get(position + 1));
            // })
            for (let i = 1; i < end; i++) {
                this.renderRootView(this._pool.meta_list.get(i));
            }
            this.updateContainerSize();
            this._pool.meta_list.get(0).group_view.root_view.setOpacity(1);
            next();
        });
    }

    calcViewportLimit() {
        this._meta.container_height = this.base_adapter.view_listview.getHeight();
        this._meta.container_width = this.base_adapter.view_listview.getWidth();
        this._meta.lim_top = Math.floor(this._meta.est_view_height * PRE_RENDER_ITEM);
        this._meta.lim_bottom = Math.floor(this._meta.container_height + this._meta.est_view_height * PRE_RENDER_ITEM);
        this._meta.est_no_item_in_view_port = Math.floor(this._meta.container_height / this._meta.est_view_height) + (PRE_RENDER_ITEM * 2);
    }

    onBeginRender() {
        this.base_adapter.onBeginRender();
        return this;
    }

    onRenderFinished() {
        this.base_adapter.onRenderFinished();
        return this;
    }

    render() {
        if (this.base_adapter.getCount() == 0) {
            this.reset();
            return;
        }
        //  else if (this.reRender()) {
        //     return;
        // }
        return this.ready().then(() => {
            if (this._tracking.has_bind_destroy == false) {
                let tv_detect_size = setInterval(() => {
                    try {
                        this.calcViewportLimit();
                    } catch (err) {
                        clearInterval(tv_detect_size);
                    }
                }, 2000);
                this.base_adapter.view_listview.events.override.onDestroy(() => {
                    if (this._tracking.thread_measure) {
                        cancelAnimationFrame(this._tracking.thread_measure)
                    }
                    clearInterval(tv_detect_size);
                    this.reset();
                    this.base_adapter._data.list.clear();
                    let temp = [this.base_adapter, this];
                    let keys, max, obj;
                    while (temp.length > 0) {
                        obj = temp.shift();
                        keys = Object.keys(obj);
                        max = keys.length;
                        for (let i = 0; i < max; i++) {
                            obj[keys[i]] = null;
                            delete obj[keys[i]];
                        }
                    }
                    keys = null;
                });
                this.base_adapter.view_listview.events.override.onResume((view) => {
                    if (this._meta.flag_need_render_when_resume) {
                        this._meta.flag_need_render_when_resume = false;
                        var old_scroll_x = this._tracking.scroll_x,
                            old_scroll_y = this._tracking.scroll_y;
                        this.render().then(() => {
                            this.base_adapter.view_scroller.setScrollY(old_scroll_y).setScrollX(old_scroll_x);
                        });
                    } else {
                        this._pool.meta_list_showing.foreach((meta) => {
                            meta.group_view.root_view.setTop(meta.anchor_y).setLeft(meta.anchor_x);
                            meta.group_view.root_view._dom.style.display = 'block';
                        });
                    }
                });
                this._tracking.has_bind_destroy = true;
            }

            if (this.base_adapter.view_listview.info.state == senjs.constant.VIEW_STATE.pause) {
                this._meta.flag_need_render_when_resume = true;
                return Promise.reject(new Error('this._meta.flag_need_render_when_resume: ' + this._meta.flag_need_render_when_resume));
            }
            this.reset();
            this.onBeginRender();
            return this.renderFirstMeta();
        }).then(() => {
            this.calcViewportLimit();
            return this.renderAllMeta();
        }).then(() => {
            new ScrollListener(this.onScrolling.bind(this)).bindToView(this.base_adapter.view_scroller);
            this.onRenderFinished();
            return Promise.resolve();
        }).catch((err) => {
            console.error(err);
            console.warn("Adapter was not initial");
            // return Promise.reject();
        });
    }

    reset() {
        this._pool.group_view_busy.clear();
        this._pool.group_view_free.clear();
        this._pool.meta_list_showing.clear();
        this._pool.meta_list.clear();
        this._pool.array_meta_col_index = [];
        this._pool.array_est_container_height = [];
        if (this.base_adapter.view_container) {
            this.base_adapter.view_container.removeAllView();
            this.base_adapter.view_container.setMinHeight(0);
        }
        this._meta.no_of_col = this.getNumberOfColumn();
        this._meta.holder_width = (100 / this._meta.no_of_col) + "%";
        this._tracking.expected_scroll = 0;
        this._tracking.est_showing_index = 0;
        this._tracking.scroll_x = 0;
        this._tracking.scroll_y = 0;
        this._tracking.scroll_arg.scrollX = 0;
        this._tracking.scroll_arg.scrollY = 0;

        // Prepare Array for meta same column index
        for (let i = 0; i < this._meta.no_of_col; i++) {
            this._pool.array_meta_col_index.push(new Array());
            this._pool.array_est_container_height.push(0);
        }
    }

    reRender() {
        if (this._pool.meta_list.size() == 0) {
            return false;
        }
        let no_need_render = false;

        if (this._pool.meta_list.size() == this.base_adapter.getCount()) {
            this._pool.meta_list.src_array = this._pool.meta_list.src_array.map((meta, index) => {
                meta.dataItem = this.base_adapter.getItem(index);
                meta.refresh();
                return meta;
            });
            no_need_render = true;
        } else if (this._pool.meta_list.size() > this.base_adapter.getCount()) {
            no_need_render = true;
            this._pool.meta_list.src_array.splice(this.base_adapter.getCount(), this._pool.meta_list.size() - this.base_adapter.getCount());
            this._pool.meta_list.src_array = this._pool.meta_list.src_array.map((meta, index) => {
                meta.dataItem = this.base_adapter.getItem(index);
                //  meta.refresh();
                return meta;
            });
        } else if (this._pool.meta_list.size() < this.base_adapter.getCount()) {
            no_need_render = true;
            this._pool.meta_list.src_array = this._pool.meta_list.src_array.map((meta, index) => {
                meta.dataItem = this.base_adapter.getItem(index);
                // meta.refresh();
                return meta;
            });
            let countinue_index = this._pool.meta_list.size();
            let limit = this.base_adapter.getCount();
            for (let i = countinue_index; i < limit; i++) {
                this.generateMetaItem(i);
            }
        }

        if (no_need_render) {
            this._pool.remeasure_list.clear();
            if (this._tracking.thread_measure) {
                cancelAnimationFrame(this._tracking.thread_measure);
            }
            this._pool.meta_list.filter(item => {
                return item.has_rendered && item.position > 0;
            }).foreach(item => {
                item.has_rendered = false;
                if (item.group_view.root_view) {
                    this._pool.group_view_busy.remove(item.group_view);
                    this._pool.group_view_free.add(item.group_view);
                }
            })
            this._pool.meta_list_showing.clear();
            if (this._tracking.scroll_arg && this._tracking.scroll_arg.scrollY == 0) {
                // this._pool.meta_list_showing.foreach(meta => {
                //     this.renderRootView(meta);
                // });
            } else {
                this._tracking.expected_scroll = 0;
                this.base_adapter.view_scroller.setScrollY(0).setScrollX(0);
                this._tracking.scroll_arg.scrollX = 0;
                this._tracking.scroll_arg.scrollY = 0;
                this._tracking.est_showing_index = 0;
                // this.scroll2Rendering();
            }
            setTimeout(() => {
                if (this._meta.est_view_height != this._pool.meta_list.get(0).group_view.root_view.getHeight()) {
                    this._meta.est_view_height = this._pool.meta_list.get(0).group_view.root_view.getHeight();
                    this._pool.array_meta_col_index = [];
                    this._pool.array_est_container_height = [];
                    for (let i = 0; i < this._meta.no_of_col; i++) {
                        this._pool.array_est_container_height.push(0);
                        this._pool.array_meta_col_index.push(new Array());
                    }
                    this._pool.meta_list.src_array = this._pool.meta_list.src_array.map(meta => {
                        meta.refresh();
                        return meta;
                    })

                    this.calcViewportLimit();
                    this.updateContainerSize();
                    // this._pool.meta_list_showing.foreach(meta => {
                    //     meta.group_view
                    //         .root_view.setTop(meta.anchor_y)
                    //         .setLeft(meta.anchor_x);
                    //     this.detectRealSize(meta);
                    // });
                    // console.log(this._pool.array_meta_col_index, this.base_adapter.getCount());
                } else {
                    this.calcViewportLimit();
                    this.updateContainerSize();
                }
                let no_showing = (Math.round((this._meta.lim_bottom + this._meta.lim_top) / this._meta.est_view_height)) * this.getNumberOfColumn();
                let end = this.base_adapter.getCount() > no_showing ? no_showing : this.base_adapter.getCount();
                for (let i = 0; i < end; i++) {
                    this.renderRootView(this._pool.meta_list.get(i));
                }
            }, 20);
        }
        return no_need_render;
    }

    /**
     * 
     * @param {MetadataItem} meta 
     */
    renderRootView(meta) {
        let group_view = this._pool.group_view_free.shift();
        if (group_view) {
            meta.group_view = group_view;
            group_view.root_view.reload(group_view.convert_view, meta.dataItem, meta.position);
            meta.group_view.convert_view = this.renderConvertView(meta);
            this.detectRealSize(meta);
        } else {
            meta.group_view.convert_view = this.renderConvertView(meta);
            meta.group_view.root_view = this.base_adapter._listener.onRootViewRendering(meta.group_view.convert_view, meta.dataItem, meta.position);
            meta.group_view.root_view.getDOM().style.overflow = 'hidden';
            meta.group_view.root_view
                .setPosition(senjs.constant.Position.ABSOLUTE)
                .setWidth(this._meta.holder_width);
            group_view = meta.group_view;
            meta.group_view.root_view.events.override.onCreated(() => {
                this.detectRealSize(meta);
            })
        }
        if (this.base_adapter.view_listview._meta.enable_lazy_loading) {
            group_view.root_view.setTop(meta.anchor_y).setLeft(meta.anchor_x);
            group_view.root_view.setZIndex(meta.position + 1);
            this._pool.group_view_busy.add(group_view);
            this._pool.meta_list_showing.add(meta);
            meta.has_rendered = true;
            group_view.root_view._dom.style.display = 'block';
        } else {
            group_view.root_view.setTop(0).setLeft(0).setPosition(senjs.constant.Position.RELATIVE);
        }
        return group_view;
    }

    /**
     * 
     * @param {MetadataItem} meta 
     */
    renderConvertView(meta) {
        return this.base_adapter.getView(meta.dataItem, meta.position, (meta.group_view && meta.group_view.convert_view != undefined) ? meta.group_view.convert_view : null);
    }

    reRenderDataAt(position) {
        let index = this._pool.meta_list_showing.indexOf(this._pool.meta_list.get(position));
        if (index > -1) {
            let meta = this._pool.meta_list_showing.get(index);
            let group_view = meta.group_view;
            group_view.root_view.reload(group_view.convert_view, meta.dataItem, meta.position);
            meta.group_view.convert_view = this.renderConvertView(meta);
        }
        return this;
    }

    /**
     * 
     * @param {View} view_scroller 
     * @param {import("../core/event-v2.js").ScrollArgument} args 
     */
    onScrolling(view_scroller, args) {
        this._tracking.scroll_arg = args;
        this._tracking.scroll_x = args.scrollX;
        this._tracking.scroll_y = args.scrollY;
        if (this.checkScrollCondition(view_scroller, args) == false || this.base_adapter.view_scroller.isNotShowOnUI()) {
            return;
        }
        this._tracking.est_showing_index = Math.round(args.scrollY / this._meta.est_view_height) - 2;
        this._tracking.est_showing_index = this._tracking.est_showing_index < 0 ? 0 : this._tracking.est_showing_index;
        this._tracking.expected_scroll = this._meta.est_view_height * (Math.round(args.scrollY / this._meta.est_view_height) + (args.isScrollDown ? PRE_RENDER_ITEM : -PRE_RENDER_ITEM));
        this._tracking.expected_scroll = this._tracking.expected_scroll < 0 ? 0 : this._tracking.expected_scroll;
        // clearTimeout(this._tracking.wt_pain);
        //     this._tracking.wt_pain = setTimeout(() => {
        // this.scroll2Rendering();
        requestAnimationFrame(this.scroll2Rendering.bind(this));
        // this._tracking.wt_pain = null;
        //   }, 1);

        if (this._tracking.re_pain) {
            this._tracking.re_pain.remove();
        }
        this._tracking.re_pain = new senjs.Waiter(() => {
            this._tracking.est_showing_index = Math.round(args.scrollY / this._meta.est_view_height) - 2;
            this._tracking.est_showing_index = this._tracking.est_showing_index < 0 ? 0 : this._tracking.est_showing_index;
            this._tracking.expected_scroll = this._meta.est_view_height * (Math.round(args.scrollY / this._meta.est_view_height) + (args.isScrollDown ? 1 : -1));
            this._tracking.expected_scroll = this._tracking.expected_scroll < 0 ? 0 : this._tracking.expected_scroll;
            this.scroll2Rendering();
        }, 200);

    }

    /**
    * 
    * @param {View} view 
    * @param {import("../core/event-v2.js").ScrollArgument} e 
    */
    checkScrollCondition(view, e) {
        if ((e.isScrollDown && e.scrollY < this._tracking.expected_scroll)
            || (!e.isScrollDown && e.scrollY > this._tracking.expected_scroll)) {
            return false
        } else if (e.scrollY < 0) {
            return false;
        } else if (e.scrollY + view._dom.offsetHeight > view._dom.scrollHeight + 5) {
            return false;
        }
        return true;
    }

    updateContainerSize() {
        let total_row = this.base_adapter.getCount() % this.getNumberOfColumn();
        total_row = (this.base_adapter.getCount() - total_row) / this.getNumberOfColumn() + (total_row > 0 ? 1 : 0);
        this._meta.est_container_height = Math.ceil(this._meta.est_view_height * total_row);
        this._meta.est_container_height += this._pool.meta_list.sum("more_height");
        this.base_adapter.view_container.setMinHeight(this._meta.est_container_height);
        for (let i = 0; i < this._pool.array_est_container_height.length; i++) {
            this._pool.array_est_container_height[i] = this._meta.est_container_height;
        }
        return this;
    }

    /**
     * 
     *  @param {import("../core/event-v2.js").ScrollArgument} args 
     */
    scroll2Rendering() {
        this._pool.meta_list_showing = this._pool.meta_list_showing.filter((meta, index) => {
            let is_outside = meta.is_outside;
            if (is_outside && meta.has_rendered) {
                this._pool.group_view_busy.remove(meta.group_view);
                this._pool.group_view_free.add(meta.group_view);
                meta.has_rendered = false;
                return false;
            } else if (is_outside) {
                meta.has_rendered = false;
                return false;
            } else {
                return true;
            }
        });
        // let meta_list = this._meta.is_convert_view_fix_size
        //     ? this._pool.meta_list.src_array.slice(this._tracking.est_showing_index, this._tracking.est_showing_index + this._meta.est_no_item_in_view_port)
        //     : this._pool.meta_list.src_array;
        if (this._meta.is_convert_view_fix_size && this._meta.no_of_col == 1) {
            let items = this._pool.meta_list.src_array
                .slice(this._tracking.est_showing_index, this._tracking.est_showing_index + this._meta.est_no_item_in_view_port)
                .filter(meta => {
                    return !meta.is_outside && meta.has_rendered == false;
                });
            let max = items.length, meta;
            for (let i = 0; i < max; i++) {
                meta = items[i];
                this.renderRootView(meta);
            }
            max = null;
            meta = null;
        } else if (this._meta.is_convert_view_fix_size) {
            this._pool.ƒarray_meta_col_index.forEach(array_col => {
                array_col.slice(this._tracking.est_showing_index, this._tracking.est_showing_index + this._meta.est_no_item_in_view_port)
                    .forEach((meta) => {
                        if (!meta.is_outside && meta.has_rendered == false) {
                            this.renderRootView(meta);
                        }
                    })
            });
        } else {
            this._pool.meta_list.src_array.filter((meta) => {
                return !meta.is_outside && meta.has_rendered == false;
            }).forEach((meta) => {
                this.renderRootView(meta);
            });
        }
    }

    detectRealSize(meta) {
        if (meta.group_view.root_view == null || meta.position == 0) {
            return;
        } else if (this._tracking.thread_measure != null) {
            this._pool.remeasure_list.add(meta);
            return;
        }
        this._pool.remeasure_list.add(meta);

        var loop = () => () => {
            let meta = this._pool.remeasure_list.shift();
            if (meta && meta.group_view.root_view != null) {
                let _real_height = meta.group_view.root_view._dom.offsetHeight;
                if (_real_height > 0 && Math.abs(_real_height - this._meta.est_view_height - meta.more_height) > 2) {
                    this._meta.is_convert_view_fix_size = false;
                    let old_more_height = meta.more_height;
                    meta.more_height = _real_height - this._meta.est_view_height;
                    let diff_size = meta.more_height - old_more_height;
                    this._pool.array_est_container_height[meta.col_index] += diff_size;
                    this._pool.array_meta_col_index[meta.col_index].filter(item => {
                        if (item.row_index > meta.row_index) {
                            item.anchor_y += diff_size;
                            return item.group_view.root_view != null;
                        } else {
                            return false;
                        }
                    }).forEach(item => {
                        // item.group_view.root_view.setTransform(`translate3d(0,${item.anchor_y}px,0)`);
                        item.group_view.root_view.setTop(item.anchor_y);
                    });
                    this._meta.est_container_height = Math.max.apply(null, this._pool.array_est_container_height);
                    this.base_adapter.view_container.setMinHeight(this._meta.est_container_height);
                }
            }
            if (this._pool.remeasure_list.size() == 0 && this.base_adapter.view_listview != null) {
                cancelAnimationFrame(this._tracking.thread_measure);
                this._tracking.thread_measure = null;
            } else {
                requestAnimationFrame(loop);
            }
        }

        this._tracking.thread_measure = requestAnimationFrame(loop);

        // this._tracking.thread_measure = new Thread(, 2, Thread.POOL_EXECUTOR);
    }
}
