import { app, senjsAdps, senjsCts } from '../core/app-context.js'
import { app_constant } from '../res/constant.js'
import { List } from '../util/list-util.js';
import { Waiter } from '../core/waiter.js';
import { senjs } from '../index.js';
import { ScrollListener } from '../core/event-v2.js';

export class BaseAdapter {
    constructor(dataList) {
        if (dataList == undefined) {
            dataList = new List();
        } else if (Array.isArray(dataList)) {
            dataList = new List(dataList);
        }

        this._meta = {
            list_data: dataList || [],
            min_view_height: -1,
            min_view_width: -1,
            number_of_col: 1,
            limit_minus_top: 0,
            limit_minus_bottom: 0,
            temp_row: 0,
            layout_height: 0,
            isFixedSize: true,
            orientationType: app_constant.Orientation.VERTICAL,
            more_top: 0,
            has_rendered: false,
            has_init_convertView: false,
            reset: function () {
                this.min_view_height = -1
                this.min_view_width = -1;
                this.limit_minus_top = 0;
                this.limit_minus_bottom = 0;
                this.temp_row = 0;
                this.layout_height = 0;
                this.more_top = 0;
                this.has_rendered = false;
                this.has_init_convertView = false;
            }
        }
        var self = this;

        this._cache = {
            isScrollDown: true,
            expected_scroll: 0,
            tracking_scroller: {
                current_x: 0,
                current_y: 0
            }
        }

        this._listener = {
            onRenderRootView: null,
            onRenderConvertView: null
        }

        this._waiter = {
            scrolling: null,
            task_recreate_first_view: null
        }

        this._view = {
            view_parent: null,
            view_scroller: null
        }

        this._pool = {
            metadata: new List(),
            groupViews: new List(),
            groupUsings: new List()
        }
    }

    async _bind(onRenderRootView, baseListView) {
        this._meta.count_row = 0;
        this.removeAllView();
        this._meta.min_view_width = -1;
        this._meta.min_view_height = -1;
        baseListView = !isNaN(baseListView) ? senjsCts.get(baseListView) : baseListView;
        if (baseListView == undefined || baseListView.view == undefined) {
            return;
        }
        this._listener.onRenderRootView = onRenderRootView;
        this._view.view_parent = baseListView.view.frame_dataList;
        if (this._view.view_parent == undefined || this._view.view_parent.info.isDestroy) {
            return;
        } else if (this._view.view_parent &&
            (this._view.view_parent.info.state == app_constant.VIEW_STATE.renderring
                || this._view.view_parent.info.state == app_constant.VIEW_STATE.orderring)) {
            new Waiter(() => {
                this._bind(onRenderRootView, baseListView);
            }, 50)
            return this;
        } else if (this._view.view_parent == undefined) {
            return this;
        }
        if (!(validate_render.bind(this))()) {
            return this;
        }
        this._view.view_parent.removeAllView();
        this._view.view_scroller = baseListView.view.frame_scroller;
        if (this._view.view_scroller) {
            this._view.view_scroller.setScrollY(0);
            // this._view.view_scroller.appEvent.setOnScroll((view, iaScrollEvent, e) => {
            //     (scrollRenderring.bind(this))(view, iaScrollEvent, e);
            // });
            new ScrollListener((view, args) => {
                (scrollRenderring.bind(this))(view, args);
            }).bindToView(this._view.view_scroller);
        }
        if (!this._meta.flagDestroyListener) {
            this._meta.flagDestroyListener = true;
            this._view.view_parent.events.override.onDestroy(() => {
                senjsAdps.remove(this.id);
                Object.keys(this).forEach(key => {
                    this[key] = null;
                    delete this[key];
                })
            })
        }
        this._meta.layout_height = this._view.view_scroller._dom.clientHeight;
        await (initMeta.bind(this))();
        return this;
    }

    getCount() {
        return this._meta.list_data.size();
    }

    getItem(position) {
        return this._meta.list_data.get(position);
    }

    /**
     * @callback returnView 
     * @param dataItem
     * @param position
     * @param convertView
     */

    /**
     * @param {returnView} returnView
     */
    setView(returnView) {
        this._listener.onRenderConvertView = returnView;
        this._meta.has_init_convertView = false;
        return this;
    }

    getView(position) {
        if (!this._pool.metadata.get(position).hasRendered) {
            throw new Error("This view was not rendered");
        }
        return this._pool.metadata.get(position).groupView.convertView;
    }

    setOrientation(orientation) {
        this._meta.orientationType = orientation;
        return this;
    }

    removeAllView() {
        if (this._view.view_parent) {
            this._view.view_parent.removeAllView();
            this._view.view_parent.setMinHeight(0);
            this._view.view_parent.setHtml("");
        }
        this._meta.reset();
        this._pool.metadata.clear();
        this._pool.groupViews.clear();
        this._pool.groupUsings.clear();
        return this;
    }

    setColumn(col) {
        this._meta.number_of_col = col;
        return this;
    }

    async notifyDataSetChanged() {
        if (!(_reBind.bind(this))()) {
            await this._bind(this._listener.onRenderRootView, this._view.view_parent);
        }
        return this;
    }

    notifyDataSetChangedAt(position) {
        if (position >= 0 && position < this.getCount()) {
            var meta = this._pool.metadata.get(position);
            meta.dataItem = this.getItem(position);
            if (meta.groupView) {
                this._listener.onRenderConvertView(meta.dataItem, meta.position, meta.groupView.convertView);
                //  (forceRenderAgain.bind(this))();
                (drawSizeAgain.bind(this))(meta);

            }
        }
        return this;
    }

    async setList(list) {
        this._meta.list_data = Array.isArray(list) ? new List(list) : list;
        this._cache.tracking_scroller.current_y = 0;
        this._cache.tracking_scroller.current_x = 0;
        if (this._view.view_scroller) {
            this._view.view_scroller._dom.scrollTop = this._cache.tracking_scroller.current_y;
        }
        await this.notifyDataSetChanged();
        return this;
    }

    /**
     * @returns {List}
     */
    getList() {
        return this._meta.list_data;
    }

    addItem(item) {
        if (this.getCount() == 0) {
            this.removeAllView();
            this._meta.list_data.add(item);
            this.notifyDataSetChanged();
            return this;
        }
        var currentIndex = this.getCount();
        this._meta.list_data.add(item);
        this._meta.count_row = (this._pool.metadata.size() - (this._pool.metadata.size() % this._meta.number_of_col)) / this._meta.number_of_col;
        if (this._pool.metadata.size() % this._meta.number_of_col == 0) {
            this._meta.count_row--;
        }
        var meta = (newMeta.bind(this))(currentIndex);
        var plus_offsetTop = this._pool.metadata
            .filter(item => {
                return item.rowIndex < meta.rowIndex;
            }).reduce((sum, current) => {
                return sum + current.moreHeight;
            }, 0);
        meta.offsetTop += plus_offsetTop;
        (updateContainerHeight.bind(this))();
        if (!meta.isOutsideScreen) {
            new Waiter(() => {
                (needRenderMetaAt.bind(this))(currentIndex);
                (drawSizeAgain.bind(this))();
            }, 50);
            return this;
        }
    }

    addItems(list) {
        var plus_offsetTop = this._pool.metadata.reduce((sum, current) => {
            return sum + current.moreHeight;
        }, 0);
        var count = list.size != undefined ? list.size() : list.length;
        var currentIndex = this.getCount();
        this._meta.list_data.addAll(list);
        (updateRowCounter.bind(this))();
        (updateContainerHeight.bind(this))();
        this._meta.count_row = (this.getCount() - (this.getCount() % this._meta.number_of_col)) / this._meta.number_of_col;
        for (var i = currentIndex; i < this.getCount(); i++) {
            (newMeta.bind(this))(i).offsetTop += plus_offsetTop;
        }
        new Waiter(() => {
            (needRenderMetaAt.bind(this))(currentIndex);
        }, 100);
        return this;
    }
}

function _reBind() {
    if (this._pool.metadata.size() == 0 || !this._meta.has_init_convertView) {
        return false;
    } else if (this._pool.metadata.size() > this.getCount()) {
        var meta_removed = this._pool.metadata.removeRange(this.getCount(), this._pool.metadata.size());
        meta_removed.filter(meta => {
            return meta.groupView != null;
        }).foreach(item => {
            if (item.groupView.rootView) {
                item.groupView.rootView._dom.remove();
            }
        });
        this._pool.metadata.foreach((metaItem, index) => {
            metaItem.dataItem = this.getItem(index);
        });
        this._meta.count_row = (this.getCount() - (this.getCount() % this._meta.number_of_col)) / this._meta.number_of_col;
    } else if (this._pool.metadata.size() < this.getCount()) {
        this._pool.metadata.foreach((metaItem, index) => {
            metaItem.dataItem = this.getItem(index);

        });
        (updateRowCounter.bind(this))();
        let begin = this._pool.metadata.size(), end = this.getCount();
        for (var i = begin; i < end; i++) {
            (newMeta.bind(this))(i);
        }
    } else {
        this._meta.count_row = (this.getCount() - (this.getCount() % this._meta.number_of_col)) / this._meta.number_of_col;
    }
    // if (this._meta.count_row > 0) {
    //     this._meta.count_row = (this.getCount() - (this.getCount() % this._meta.number_of_col)) / this._meta.number_of_col;
    // }
    (updateContainerHeight.bind(this))();
    (forceRenderAgain.bind(this))();
    return true;
}

function updateRowCounter() {
    this._meta.count_row = (this._pool.metadata.size() - (this._pool.metadata.size() % this._meta.number_of_col)) / this._meta.number_of_col;
    if (this._pool.metadata.size() % this._meta.number_of_col == 0) {
        this._meta.count_row--;
    }

}

function validate_render() {
    return this._meta.list_data && (!(this._meta.list_data instanceof Array) ? this._meta.list_data.size() : this._meta.list_data.length) > 0;
}

async function initMeta() {
    return new Promise(async next => {
        if (this._view.view_parent.info.state == app_constant.VIEW_STATE.pause
            && this._view.view_parent.getHeight() == 0) {
            this._view.view_parent.events.override.onResume(() => {
                if (!this._meta.has_rendered) {
                    (initMeta.bind(this))();
                }
            })
            return;
        }
        await renderFirstView.bind(this)();
        (updateContainerHeight.bind(this))();
        this._meta.layout_height = this._view.view_scroller._dom.offsetHeight;
        this._meta.layout_width = this._view.view_scroller._dom.offsetWidth;

        this._meta.limit_minus_top = Math.floor(this._meta.min_view_height);
        this._meta.limit_minus_bottom = Math.floor(this._meta.layout_height + this._meta.min_view_height * 1.5);

        var number_visible_item = 0;
        if (this._meta.orientationType == app_constant.Orientation.VERTICAL) {
            number_visible_item = (Math.round((this._meta.limit_minus_bottom + this._meta.limit_minus_top) / this._meta.min_view_height)) * this._meta.number_of_col;
            number_visible_item += this._meta.number_of_col;
        } else {
            number_visible_item = this.getCount();
        }
        if (this.getCount() > number_visible_item) {
            for (var i = 1; i < number_visible_item; i++) {
                (renderViewAt.bind(this))(i);
            }

            for (var i = number_visible_item; i < this.getCount(); i++) {
                (newMeta.bind(this))(i);
            }

            for (var i = 0; i < number_visible_item; i++) {
                (drawSizeAgain.bind(this))(this._pool.metadata.get(i));
            }
        } else {
            for (var i = 1; i < this.getCount(); i++) {
                (renderViewAt.bind(this))(i);
            }
            for (var i = 0; i < this.getCount(); i++) {
                (drawSizeAgain.bind(this))(this._pool.metadata.get(i));
            }

        }
        next();
        this._meta.has_rendered = true;
    });
}

function renderFirstView() {
    var meta = (renderViewAt.bind(this))(0);
    meta.moreHeight = 0;
    if (this._waiter.task_recreate_first_view) {
        clearInterval(this._waiter.task_recreate_first_view)
    }
    return new Promise(next => {
        this._waiter.task_recreate_first_view = setInterval(async () => {
            if (meta == null || meta.groupView == null || meta.groupView.rootView == null) {
                await this._bind(this._listener.onRenderRootView, this._view.view_parent);
                clearInterval(this._waiter.task_recreate_first_view);
                return;
            }
            var count = meta.groupView.rootView.countChildNotYetCreated();
            if (count > 0) {
                return;
            }
            clearInterval(this._waiter.task_recreate_first_view);
            this._waiter.task_recreate_first_view = null;
            if (meta.groupView.rootView._dom.offsetHeight == 0) {
                meta.groupView.rootView.events.override.onMeasured((view, w, h) => {
                    this._meta.min_view_height = meta.groupView.rootView._dom.offsetHeight;
                    (updateContainerHeight.bind(this))();
                    this._view.view_parent.setOpacity(0);
                    this._meta.min_view_height = h;
                    this._meta.min_view_width = w / this._meta.number_of_col;
                    if (this._meta.orientationType == app_constant.Orientation.VERTICAL) {
                        meta.groupView.rootView.setWidth(`${100 / this._meta.number_of_col}%`);
                    } else {
                        meta.groupView.rootView.setWidth(this._meta.min_view_width);
                    }
                    this._view.view_parent.setOpacity(1);
                    next();
                    this._meta.timeout = null;
                    this._meta.has_init_convertView = true;
                })
            } else {
                this._meta.min_view_height = meta.groupView.rootView._dom.offsetHeight;

                (updateContainerHeight.bind(this))();
                this._view.view_parent.setOpacity(0);
                this._meta.min_view_height = meta.groupView.rootView._dom.offsetHeight;
                this._meta.min_view_width = meta.groupView.rootView._dom.offsetWidth / this._meta.number_of_col;
                if (this._meta.orientationType == app_constant.Orientation.VERTICAL) {
                    meta.groupView.rootView.setWidth(`${100 / this._meta.number_of_col}%`);
                } else {
                    meta.groupView.rootView.setWidth(this._meta.min_view_width);
                }
                this._view.view_parent.setOpacity(1);
                next();
                this._meta.timeout = null;
                this._meta.has_init_convertView = true;

                if (meta.groupView.rootView._dom.offsetHeight != this._meta.min_view_height) {
                    this._pool.metadata.foreach(meta => {
                        meta.moreHeight = 0;
                        if (meta.hasRendered || (meta.groupView != undefined && meta.groupView.rootView != undefined)) {
                            (drawSizeAgain.bind(this))(meta);
                        }
                    });
                    this._meta.min_view_height = meta.groupView.rootView._dom.offsetHeight;
                    (updateContainerHeight.bind(this))();
                }
            }
        }, 40);
    })
}

function updateContainerHeight() {
    if (this._meta.orientationType == app_constant.Orientation.VERTICAL) {
        var total_row = this.getCount() % this._meta.number_of_col;
        total_row = (this.getCount() - total_row) / this._meta.number_of_col + (total_row > 0 ? 1 : 0);
        this._meta.min_container_height = Math.ceil(this._meta.min_view_height * total_row);
        this._meta.min_container_height += this._pool.metadata.sum("moreHeight");
    } else {
        this._meta.min_container_height = this.getCount() * this._meta.min_view_height;
    }
    this._view.view_parent.setMinHeight(this._meta.min_container_height);
}

function renderViewAt(position) {
    var dataItem = this.getItem(position);
    var convertView = (newConvertView.bind(this))(dataItem, position, null);
    var rootView = this._listener.onRenderRootView(convertView, dataItem, position);
    var meta = (newMeta.bind(this))(position);
    meta.groupView = { rootView: rootView, convertView: convertView, meta: meta };
    meta.hasRendered = true;
    this._pool.groupUsings.add(meta.groupView);

    if (this._meta.min_view_width != -1) {
        if (this._meta.orientationType == app_constant.Orientation.VERTICAL) {
            rootView.setWidth(`${100 / this._meta.number_of_col}%`);
        } else {
            rootView.setWidth(this._meta.min_view_width);
        }
    }
    rootView.setPosition(app_constant.Position.ABSOLUTE)
        .setTop(meta.offsetTop)
        .setLeft(meta.offsetLeft);
    return meta;
}

function preparePool() {
    var dataItem = this.getItem(0);
    var convertView = (newConvertView.bind(this))(dataItem, 0, null);
    this._pool.groupViews.add({ rootView: null, convertView: null });
}

function newConvertView(dataItem, position, existingConvertView) {
    return this._listener.onRenderConvertView(dataItem, position, existingConvertView);
}

function newMeta(position) {
    if (position < this._pool.metadata.size()) {
        return this._pool.metadata.get(position);
    }
    var meta = {
        _self: this,
        position: position,
        colIndex: (position % this._meta.number_of_col),
        rowIndex: this._meta.count_row,
        dataItem: this.getItem(position),
        offsetTop: 0,
        offsetLeft: 0,
        hasRendered: false,
        moreHeight: 0,
        moreTop: 0,
        get isOutsideScreen() {
            return (this.offsetTop + this._self._meta.min_view_height + this.moreHeight < this._self._cache.tracking_scroller.current_y - this._self._meta.limit_minus_top
                || this.offsetTop > this._self._cache.tracking_scroller.current_y + this._self._meta.limit_minus_bottom)
        }
    }

    if (position > this._meta.number_of_col - 1) {
        this._meta.count_row += meta.colIndex == 0 ? 1 : 0;
        meta.rowIndex = this._meta.count_row;
    } else {
        meta.rowIndex = 0;
        this._meta.count_row = 0;
    }
    switch (this._meta.orientationType) {
        case app_constant.Orientation.VERTICAL:
            meta.offsetTop = meta.rowIndex * this._meta.min_view_height;
            meta.offsetLeft = ((100 / this._meta.number_of_col) * meta.colIndex) + "%";
            break;
        case app_constant.Orientation.HORIZONTAL:
            meta.offsetLeft = meta.rowIndex * this._meta.min_view_width;
            break;

    }
    this._pool.metadata.add(meta);
    return meta;
}

function scrollRenderring(view, iaScrollEvent, e) {
    this._cache.tracking_scroller.current_x = iaScrollEvent.scrollX;
    this._cache.tracking_scroller.current_y = iaScrollEvent.scrollY;
    if (iaScrollEvent.isScrollDown && iaScrollEvent.scrollY < this._cache.expected_scroll
        || !iaScrollEvent.isScrollDown && iaScrollEvent.scrollY + this._meta.min_view_height > this._cache.expected_scroll) {
        return;
    } else if (iaScrollEvent.scrollY < 0 || iaScrollEvent.scrollY > view._dom.scrollHeight - view._dom.offsetHeight) {
        return;
    }
    this._cache.isScrollDown = iaScrollEvent.isScrollDown;
    this._cache.expected_scroll = this._meta.min_view_height * (Math.round(iaScrollEvent.scrollY / this._meta.min_view_height) + (iaScrollEvent.isScrollDown ? 1 : 1));
    (renderScrolling.bind(this))(iaScrollEvent);
    if (this._waiter.scrolling) {
        this._waiter.scrolling.remove();
    }
    this._waiter.scrolling = new Waiter(() => {
        (renderScrolling.bind(this))(iaScrollEvent);
    }, 100);
}


function renderScrolling(iaScrollEvent) {
    this._pool.metadata.filter(item => {
        return item.hasRendered && item.isOutsideScreen;
    }).foreach(item => {
        if (item.groupView) {
            item.groupView.rootView._dom.remove();
            this._pool.groupViews.add(item.groupView);
            this._pool.groupUsings.remove(item.groupView)
            item.groupView = null;
        }
        item.hasRendered = false;
    });
    this._pool.metadata.filter(item => {
        return !item.hasRendered && !item.isOutsideScreen;
    }).foreach(item => {
        item.hasRendered = true;
        var groupView;
        if (this._pool.groupViews.size() > 0) {
            groupView = this._pool.groupViews.shift();
            groupView.meta = item;
            this._view.view_parent._dom.appendChild(groupView.rootView._dom);
            var temp = this._listener.onRenderConvertView(this.getItem(item.position), item.position, groupView.convertView);
            if (temp.info.id != groupView.convertView.info.id) {
                groupView.rootView.removeAllView();
                groupView.rootView.addView(temp);
            }
            item.dataItem = this.getItem(item.position);
            groupView.rootView.reload(groupView.convertView, item.dataItem, item.position);
            groupView.meta = item;
            this._pool.groupUsings.add(groupView);
            item.groupView = groupView;
            // groupView.rootView._dom.style.display = "block";
            groupView.rootView
                .setTop(item.offsetTop)
                .setLeft(item.offsetLeft);
            (drawSizeAgain.bind(this))(item);
        }
        else {
            (drawSizeAgain.bind(this))(renderViewAt.bind(this)(item.position));
        }
    });
    if (this._waiter.makeSureClearView) {
        this._waiter.makeSureClearView.remove();
    }
}

function forceRenderAgain() {
    this._pool.metadata.filter(item => {
        return item.groupView != null;
    }).foreach(item => {
        if (item.groupView) {
            item.groupView.rootView._dom.remove();
            this._pool.groupViews.add(item.groupView);
            this._pool.groupUsings.remove(item.groupView)
            item.groupView = null;
        }
        item.hasRendered = false;
    });
    this._pool.metadata.filter(item => {
        return !item.hasRendered && !item.isOutsideScreen;
    }).foreach(item => {
        item.hasRendered = true;
        var groupView;
        if (this._pool.groupViews.size() > 0) {
            groupView = this._pool.groupViews.shift();
            groupView.meta = item;
            this._view.view_parent._dom.appendChild(groupView.rootView._dom);
            var temp = this._listener.onRenderConvertView(this.getItem(item.position), item.position, groupView.convertView);
            if (temp.info.id != groupView.convertView.info.id) {
                groupView.rootView.removeAllView();
                groupView.rootView.addView(temp);
            }
            item.dataItem = this.getItem(item.position);
            groupView.rootView.reload(groupView.convertView, item.dataItem, item.position);
            groupView.meta = item;
            this._pool.groupUsings.add(groupView);
            item.groupView = groupView;
            // groupView.rootView._dom.style.display = "block";
            groupView.rootView
                .setTop(item.offsetTop)
                .setLeft(item.offsetLeft);
            (drawSizeAgain.bind(this))(item);
        }
        else {
            (drawSizeAgain.bind(this))(renderViewAt.bind(this)(item.position));
        }
    });

    if (this._waiter.makeSureClearView) {
        this._waiter.makeSureClearView.remove();
    }
}

function needRenderMetaAt(index) {
    var item = this._pool.metadata.get(index);
    if (!item) {
        return;
    }
    this._pool.metadata.filter(item => {
        return item.isOutsideScreen;
    }).foreach(item => {
        if (item.groupView) {
            item.groupView.rootView._dom.remove();
            this._pool.groupViews.add(item.groupView);
            this._pool.groupUsings.remove(item.groupView);
            item.groupView = null;
        }
    });
    var groupView;
    if (this._pool.groupViews.size() > 0) {
        groupView = this._pool.groupViews.shift();
        //  this._view.view_parent._dom.appendChild(groupView.rootView._dom);
        var temp = this._listener.onRenderConvertView(this.getItem(item.position), item.position, groupView.convertView);
        if (temp.info.id != groupView.convertView.info.id) {
            groupView.rootView.removeAllView();
            groupView.rootView.addView(temp);
        }
        item.dataItem = this.getItem(item.position);
        groupView.rootView.reload(groupView.convertView, item.dataItem, item.position);
        groupView.meta = item;
        this._pool.groupUsings.add(groupView);
        item.groupView = groupView;
        // groupView.rootView._dom.style.display = "block";
        groupView.rootView
            .setTop(item.offsetTop)
            .setLeft(item.offsetLeft);
        (drawSizeAgain.bind(this))(item);
    } else {
        (renderViewAt.bind(this))(item.position);
        (drawSizeAgain.bind(this))(item);
    }
}


function drawSizeAgain(meta) {
    if (meta == null) {
        return meta;
    }
    setTimeout(() => {
        if (meta.rowIndex == 0 && meta.groupView && meta.groupView.rootView && meta.groupView.rootView._dom.offsetHeight != this._meta.min_view_height) {
            var more_height = meta.groupView.rootView._dom.offsetHeight - this._meta.min_view_height;
            console.log("update more height", more_height);
            this._meta.min_view_height = meta.groupView.rootView._dom.offsetHeight;
            this._view.view_parent.setMinHeight(this._meta.min_container_height += more_height);
            this._pool.metadata
                .filter(i => { return i.rowIndex > meta.rowIndex })
                .filter((item, index) => {
                    item.moreHeight -= more_height;
                    item.offsetTop += more_height;
                    return item.groupView;
                }).foreach(item => {
                    item.groupView.rootView.setTop(item.offsetTop);
                });
        } else if (meta.groupView && meta.groupView.rootView && meta.rowIndex >= 1 && meta.groupView.rootView._dom.offsetHeight > 0 && meta.groupView.rootView._dom.offsetHeight != this._meta.min_view_height + meta.moreHeight) {
            var old_more_height = meta.moreHeight;
            meta.moreHeight = meta.groupView.rootView._dom.offsetHeight - this._meta.min_view_height;
            this._view.view_parent.setMinHeight(this._meta.min_container_height += meta.moreHeight - old_more_height);
            this._pool.metadata
                .filter(i => { return i.rowIndex > meta.rowIndex })
                .filter((item, index) => {
                    item.offsetTop += (meta.moreHeight - old_more_height);
                    return item.groupView;
                }).foreach(item => {
                    item.groupView.rootView.setTop(item.offsetTop);
                });
        }
    }, 30);
    return meta;
}


