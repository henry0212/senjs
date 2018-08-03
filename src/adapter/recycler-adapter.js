import { app, dhAdps, dhCts } from '../core/app-context.js'
import { app_constant } from '../res/constant.js'
import { List } from '../util/list-util.js';
import { Waiter } from '../core/waiter.js';


export class RecyclerAdapter {
    constructor(dataList) {

        this._meta = {
            list_data: dataList,
            min_view_height: -1,
            number_of_col: 1,
            limit_minus_top: 0,
            limit_minus_bottom: 0,
            temp_row: 0,
            layout_height: 0,
            isFixedSize: true,
            more_top: 0,
        }

        this._cache = {
            isScrollDown: true,
            expected_scroll: 0
        }

        this._listener = {
            onRenderRootView: null,
            onRenderConvertView: null
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
        this._listener.onRenderRootView = onRenderRootView;
        if (!(validate_render.bind(this))()) {
            return this;
        }
        this._view.view_parent = (typeof baseListView === "number") ? dhCts.get(baseListView) : baseListView;
        if (this._view.view_parent &&
            (this._view.view_parent.info.state == app_constant.VIEW_STATE.renderring
                || this._view.view_parent.info.state == app_constant.VIEW_STATE.orderring)) {
            new Waiter(() => {
                this._bind(onRenderRootView, baseListView);
            }, 100)
            return this;
        } else if (this._view.view_parent == undefined) {
            return this;
        }
        this._view.view_scroller = (typeof baseListView === "number") ? dhCts.get(baseListView) : baseListView;
        while (!this._view.view_scroller.info.isScrollY && this._view.view_scroller.info.id > 0) {
            this._view.view_scroller = this._view.view_scroller.getParentView();
        }
        if (this._view.view_scroller) {
            this._view.view_scroller.appEvent.setOnScroll((view, iaScrollEvent, e) => {
                (scrollRenderring.bind(this))(iaScrollEvent, e);
            });
        }
        if (!this._meta.flagDestroyListener) {
            this._meta.flagDestroyListener = true;
            this._view.view_parent.events.override.onDestroy(() => {
                new Promise(next => {
                    dhAdps.remove(this.id);
                    Object.keys(this).forEach(key => {
                        this[key] = null;
                        delete this[key];
                        console.log(key);
                    })
                }).then(() => {

                    //   this.removeAllView();
                });

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

    setView(returnView) {
        this._listener.onRenderConvertView = returnView;
        return this;
    }

    getView(position) {
        if (!this._pool.metadata.get(position).hasRendered) {
            throw new Error("This view was not rendered");
        }
        return this._pool.metadata.get(position).groupView.convertView;
    }

    removeAllView() {

    }
}

function validate_render() {
    return this._meta.list_data.size() > 0;
}

async function initMeta() {
    return new Promise(async next => {
        await renderFirstView.bind(this)();
        console.log("he", this._meta.min_view_height * this.getCount());
        this._view.view_parent.setMinHeight(this._meta.min_view_height * this.getCount());
        this._meta.layout_height = this._view.view_scroller._dom.offsetHeight;
        this._meta.layout_width = this._view.view_scroller._dom.offsetWidth;

        this._meta.limit_minus_top = this._meta.layout_height;
        this._meta.limit_minus_bottom = this._meta.layout_height * 2;

        var number_visible_item = Math.round((this._meta.limit_minus_bottom + this._meta.limit_minus_top) / this._meta.min_view_height) + 2;
        if (this.getCount() > number_visible_item) {
            for (var i = 1; i < number_visible_item; i++) {
                (renderViewAt.bind(this))(i);
            }
            for (var i = number_visible_item; i < this.getCount(); i++) {
                (newMeta.bind(this))(i, this.getItem(i));
            }
        } else {
            for (var i = 1; i < this.getCount(); i++) {
                (renderViewAt.bind(this))(i);
            }
        }
        next();
    });
}

function renderFirstView() {
    return new Promise(next => {
        var dataItem = this.getItem(0);
        var convertView = (newConvertView.bind(this))(dataItem, 0, null);
        var rootView = this._listener.onRenderRootView(convertView, dataItem, 0);
        if (rootView._dom.offsetHeight == -1) {
            rootView.events.override.onMeasured((view, w, h) => {
                rootView.setMinHeight(h);
                var meta = (newMeta.bind(this))(0, dataItem);
                meta.groupView = { rootView: rootView, convertView: convertView };
                meta.hasRendered = true;
                this._meta.place_to_put += rootView._dom.offsetHeight;
                next();
            })
        } else {
            this._meta.min_view_height = rootView._dom.offsetHeight;
            rootView.setMinHeight(this._meta.min_view_height);
            var meta = (newMeta.bind(this))(0, dataItem);
            meta.groupView = { rootView: rootView, convertView: convertView, meta: meta };
            meta.hasRendered = true;
            this._meta.place_to_put += rootView._dom.offsetHeight;
            meta.more_height = 0;

            next();
        }
    })
}

function renderViewAt(position) {
    var dataItem = this.getItem(position);
    var convertView = (newConvertView.bind(this))(dataItem, position, null);
    var rootView = this._listener.onRenderRootView(convertView, dataItem, position);
    rootView.setBackground("#fff")
    var meta = (newMeta.bind(this))(position, dataItem);
    meta.groupView = { rootView: rootView, convertView: convertView, meta: meta };
    meta.hasRendered = true;
    this._pool.groupUsings.add(meta.groupView);
    (initMoreTop.bind(this))(meta);
    rootView.setPosition(app_constant.Position.ABSOLUTE).setTop(meta.offsetTop);
    return meta;
}

function newConvertView(dataItem, position, existingConvertView) {
    return this._listener.onRenderConvertView(dataItem, position, existingConvertView);
}

function newMeta(position, dataItem) {
    var meta = {
        position: position,
        colIndex: (position % this._meta.number_of_col),
        rowIndex: this._meta.temp_row,
        dataItem: dataItem,
        offsetTop: 0,
        hasRendered: false,
        groupView: null,
        more_height: -1,
        more_top: position == 0 ? 0 : -1,
        real_size: -1,
        aboveMeta: position > 0 ? this._pool.metadata.get(position - 1) : null
    }
    if (position > this._meta.number_of_col - 1) {
        this._meta.temp_row += meta.colIndex == 0 ? 1 : 0;
        meta.rowIndex = this._meta.temp_row;
    } else {
        this._meta.temp_row = 0;
        meta.rowIndex = 0;
    }
    meta.offsetTop = meta.rowIndex * this._meta.min_view_height;
    this._pool.metadata.add(meta);
    return meta;
}

function scrollRenderring(iaScrollEvent, e) {
    if (iaScrollEvent.isScrollDown && iaScrollEvent.scrollY < this._cache.expected_scroll
        || !iaScrollEvent.isScrollDown && iaScrollEvent.scrollY + this._meta.min_view_height > this._cache.expected_scroll) {
        return;
    }

    this._cache.isScrollDown = iaScrollEvent.isScrollDown;
    this._cache.expected_scroll = this._meta.min_view_height * (Math.round(iaScrollEvent.scrollY / this._meta.min_view_height) + (iaScrollEvent.isScrollDown ? 1 : 1));

    this._pool.metadata.filter(item => {
        return item.hasRendered && (item.offsetTop < iaScrollEvent.scrollY - this._meta.limit_minus_top || item.offsetTop > iaScrollEvent.scrollY + this._meta.limit_minus_bottom);
    }).foreach(item => {
        item.hasRendered = false;
        if (item.groupView) {
            this._pool.groupViews.add(item.groupView);
            this._pool.groupUsings.remove(item.groupView)
            item.groupView = null;
        }
    });
    // console.log("this._pool.groupUsings", this._pool.groupUsings.size());
    // console.log("this._pool.groupViews", this._pool.groupViews.size());

    if (this._pool.groupViews.size() > 0) {
        this._pool.metadata.filter(item => {
            return !item.hasRendered && item.offsetTop >= iaScrollEvent.scrollY - this._meta.limit_minus_top && item.offsetTop <= iaScrollEvent.scrollY + this._meta.limit_minus_bottom;
        }).foreach(item => {
            item.hasRendered = true;
            var groupView;
            if (this._pool.groupViews.size() > 0) {
                groupView = this._pool.groupViews.shift();
                this._listener.onRenderConvertView(item.dataItem, item.position, groupView.convertView);
                groupView.rootView.reload(groupView.convertView, item.dataItem, item.position);
                groupView.meta = item;
                this._pool.groupUsings.add(groupView);
                item.groupView = groupView;
                (initMoreTop.bind(this))(item);
                groupView.rootView.setTop(item.offsetTop);
            }
        });
    }
}

function initMoreTop(metaItem) {
    if (metaItem.position == 0 || metaItem.groupView == null) {
        return;
    }
    metaItem.real_size = metaItem.groupView.rootView._dom.offsetHeight;
    metaItem.more_top = metaItem.real_size - this._meta.min_view_height;
    console.log("real size",metaItem.real_size);
    var above = this._pool.metadata.get(metaItem.position - 1);
    if (above.real_size > -1) {
        metaItem.offsetTop = above.offsetTop + above.real_size;
    } else {
        metaItem.offsetTop = metaItem.position * this._meta.min_view_height;
    }
}


// Backup
 // if (iaScrollEvent.speed == 1) {
    //      var beginIndex = Math.round(iaScrollEvent.scrollY / this._meta.min_view_height), temp = beginIndex;
    //      var tem_scroll = iaScrollEvent.scrollY;
    //      this._pool.groupUsings.foreach((groupView, position) => {
    //          console.log("geneta", beginIndex);
    //          var meta = this._pool.metadata.get(beginIndex);
    //          if (meta) {
    //              this._listener.onRenderConvertView(meta.dataItem, meta.position, groupView.convertView);
    //              groupView.rootView.reload(groupView.convertView, meta.dataItem, meta.position);
    //              groupView.rootView.setTop(tem_scroll+ (position * this._meta.min_view_height));
    //              beginIndex++;
    //          }
    //      })
    //      return;
    //  }