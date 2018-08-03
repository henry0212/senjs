import { app, dhAdps, dhCts } from '../core/app-context.js'
import { app_constant } from '../res/constant.js'
import { List } from '../util/list-util.js';
import { Waiter } from '../core/waiter.js';


export class InfinityAdapter {
    constructor(dataList) {
        if (dataList && typeof dataList === "array") {
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
            more_top: 0
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
        this._pool.metadata.clear();
        this._pool.groupViews.clear();
        this._pool.groupUsings.clear();
        this._listener.onRenderRootView = onRenderRootView;
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
        if (!(validate_render.bind(this))()) {
            return this;
        }
        this._view.view_parent.removeAllView();
        this._view.view_scroller = (typeof baseListView === "number") ? dhCts.get(baseListView) : baseListView;
        while (!this._view.view_scroller.info.isScrollY && this._view.view_scroller.info.id > 0) {
            this._view.view_scroller = this._view.view_scroller.getParentView();
        }
        if (this._view.view_scroller) {
            this._view.view_scroller.setScrollY(0);
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

    }

    setColumn(col) {
        this._meta.number_of_col = col;
        return this;
    }

    notifyDataSetChanged() {
        this._bind(this._listener.onRenderRootView, this._view.view_parent);
        return this;
    }

    notifyDataSetChangedAt(position) {
        if (position >= 0 && position < this.getCount() && this._pool.metadata.get(position).groupView) {
            var temp = this._pool.metadata.get(position);
            temp.dataItem = this.getItem(position);
            this._listener.onRenderConvertView(temp.dataItem, temp.position, temp.groupView.convertView);
        }
        return this;
    }

    setList(list) {
        this._meta.list_data = list;
        this.notifyDataSetChanged();
        return this;
    }

    getList() {
        return this._meta.list_data;
    }
}

function validate_render() {
    return this._meta.list_data.size() > 0;
}

async function initMeta() {
    return new Promise(async next => {
        await renderFirstView.bind(this)();
        if (this._meta.orientationType == app_constant.Orientation.VERTICAL) {
            this._view.view_parent.setMinHeight(this._meta.min_container_height = Math.floor(this._meta.min_view_height * (this.getCount() + this._meta.number_of_col - 1) / this._meta.number_of_col));
        } else {
            this._view.view_parent.setMinWidth(this._meta.min_view_width * (this.getCount()));
        }
        this._meta.layout_height = this._view.view_scroller._dom.offsetHeight;
        this._meta.layout_width = this._view.view_scroller._dom.offsetWidth;

        this._meta.limit_minus_top = this._meta.min_view_height * 2;
        this._meta.limit_minus_bottom = this._meta.layout_height + this._meta.min_view_height * 1;

        var number_visible_item = 0;
        if (this._meta.orientationType == app_constant.Orientation.VERTICAL) {
            number_visible_item = (Math.round((this._meta.limit_minus_bottom + this._meta.limit_minus_top) / this._meta.min_view_height)) * this._meta.number_of_col;
        } else {
            number_visible_item = this.getCount();
        }
        if (this.getCount() > number_visible_item) {
            for (var i = 1; i < number_visible_item; i++) {
                (renderViewAt.bind(this))(i);
            }

            for (var i = number_visible_item; i < this.getCount(); i++) {
                (newMeta.bind(this))(i, this.getItem(i));
            }
            for (var i = 1; i < number_visible_item; i++) {
                (drawSizeAgain.bind(this))(this._pool.metadata.get(i));
            }


        } else {
            for (var i = 1; i < this.getCount(); i++) {
                (renderViewAt.bind(this))(i);
            }
            for (var i = 1; i < this.getCount(); i++) {
                (drawSizeAgain.bind(this))(this._pool.metadata.get(i));
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
                this._meta.min_view_height = h;
                this._meta.min_view_width = w / this._meta.number_of_col;
                // rootView.setMinHeight(h);
                if (this._meta.orientationType == app_constant.Orientation.VERTICAL) {
                    rootView.setWidth(`${100 / this._meta.number_of_col}%`);
                } else {
                    rootView.setWidth(this._meta.min_view_width);
                }
                var meta = (newMeta.bind(this))(0, dataItem);
                meta.groupView = { rootView: rootView, convertView: convertView };
                meta.hasRendered = true;
                next();
            })
        } else {
            this._meta.min_view_height = rootView._dom.offsetHeight;
            this._meta.min_view_width = rootView._dom.offsetWidth / this._meta.number_of_col;
            //rootView.setMinHeight(this._meta.min_view_height);
            if (this._meta.orientationType == app_constant.Orientation.VERTICAL) {
                rootView.setWidth(`${100 / this._meta.number_of_col}%`);
            } else {
                rootView.setWidth(this._meta.min_view_width);
            }
            var meta = (newMeta.bind(this))(0, dataItem);
            meta.groupView = { rootView: rootView, convertView: convertView };
            meta.hasRendered = true;
            next();
        }
    })
}

function renderViewAt(position) {
    var dataItem = this.getItem(position);
    var convertView = (newConvertView.bind(this))(dataItem, position, null);
    var rootView = this._listener.onRenderRootView(convertView, dataItem, position);
    var meta = (newMeta.bind(this))(position, dataItem);
    meta.groupView = { rootView: rootView, convertView: convertView, meta: meta };
    meta.hasRendered = true;
    this._pool.groupUsings.add(meta.groupView);

    if (this._meta.orientationType == app_constant.Orientation.VERTICAL) {
        rootView.setWidth(`${100 / this._meta.number_of_col}%`);
    } else {
        rootView.setWidth(this._meta.min_view_width);
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

function newMeta(position, dataItem) {
    var meta = {
        position: position,
        colIndex: (position % this._meta.number_of_col),
        rowIndex: this._meta.temp_row,
        dataItem: this.getItem(position),
        offsetTop: 0,
        offsetLeft: 0,
        hasRendered: false,
        moreHeight: 0
    }
    if (position > this._meta.number_of_col - 1) {
        this._meta.temp_row += meta.colIndex == 0 ? 1 : 0;
        meta.rowIndex = this._meta.temp_row;
    } else {
        this._meta.temp_row = 0;
        meta.rowIndex = 0;
    }
    switch (this._meta.orientationType) {
        case app_constant.Orientation.VERTICAL:
            meta.offsetTop = meta.rowIndex * this._meta.min_view_height;
            meta.offsetLeft = meta.colIndex * this._meta.min_view_width;
            break;
        case app_constant.Orientation.HORIZONTAL:
            meta.offsetLeft = meta.rowIndex * this._meta.min_view_width;
            break;

    }
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
    console.log("Pool", this._pool.groupViews.size());
    this._pool.metadata.filter(item => {
        return !item.hasRendered && item.offsetTop >= iaScrollEvent.scrollY - this._meta.limit_minus_top && item.offsetTop <= iaScrollEvent.scrollY + this._meta.limit_minus_bottom;
    }).foreach(item => {
        item.hasRendered = true;
        var groupView;
        if (this._pool.groupViews.size() > 0) {
            groupView = this._pool.groupViews.shift();
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
            groupView.rootView
                .setTop(item.offsetTop)
                .setLeft(item.offsetLeft);

            (drawSizeAgain.bind(this))(item);
        } else {
            (renderViewAt.bind(this))(item.position);
        }
    });
    // }
}

function drawSizeAgain(meta) {
    if (meta.groupView.rootView._dom.offsetHeight != this._meta.min_view_height + meta.moreHeight) {
        meta.moreHeight = meta.groupView.rootView._dom.offsetHeight - this._meta.min_view_height;
        console.log(" meta.moreHeight ", meta.moreHeight);
        this._view.view_parent.setMinHeight(this._meta.min_container_height += meta.moreHeight);
        this._pool.metadata
            .filter(i => { return i.position > meta.position })
            .filter((item, index) => {
                item.offsetTop += meta.moreHeight;
                return item.groupView;
            }).foreach(item => {
                item.groupView.rootView.setTop(item.offsetTop);
            });
    }
    // else if(groupView.rootView._dom.offsetHeight < this._meta.min_view_height + meta.moreHeight){
    //     meta.moreHeight =  this._meta.min_view_height - groupView.rootView._dom.offsetHeight;
    //     console.log(" meta.moreHeight ", meta.moreHeight);
    //     this._pool.metadata
    //             .filter(i => {return i.position > meta.position})
    //             .filter((item,index) =>{
    //                 item.offsetTop -= meta.moreHeight;
    //            });
    // }
}