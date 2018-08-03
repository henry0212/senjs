
import { List } from '../util/list-util.js';
import { app, dhCts, dhAdps } from '../core/app-context.js';
import { Waiter } from '../core/waiter.js';
import { app_constant } from '../res/constant.js';
import { BaseAdapter } from './base-adapter.js';

export var Adapter2 = function (dhList) {
    var config = {
        bind_delay: 0,
        destroy: false,
        min_height_item: 0,
        empty_data_text: null,
        confirmBeforeRemove: true,
        clockMaxRenderEachTime: 50,
        number_of_col: 1,
        convertViewWidth: 0,
        convertViewHeight: 0,
        layout_height: 0,
    }
    dhList = dhList || new List();
    var self = this;
    this.id = "";
    var convertViews = new List(),
        convertView_pool = new List(),
        rootView_pool = new List(),
        showing_meta_items = new List();

    var setViewCallBack = null,
        onUpdateRootViewItem,
        onParentRenderedItemCallback,
        onRender = null,
        parentView, scrollParentView,
        dhListFilter = null,
        filterObj = null,
        listOnRenderedListener = new Array(),
        onDatabinding, addedOnDestroy = false,
        waiterRenderView,
        sysDestroy, parent,
        wtBinding = null,
        mListMeta = new List(),
        threadDetectScroll = null,
        limitTop, limitBottom,
        cache_scroll_top = 0,
        lb_nodata, delay_waiter,
        lock_limit_render = true,
        limit_convertView = -1,
        waiter_renderring = null,
        temp_row = 0,
        thr_update,
        asyncRenderRoot = null;
    var notifyBox;
    var isNewView, isBinding, view_height;

    if (Array.isArray(dhList)) {
        dhList = new List(dhList);
    }
    this.setView = function (returnView) {
        isNewView = true;
        setViewCallBack = returnView.bind(this);
    }
    this.filter = function (key, value) {
        if (waiterRenderView != null) {
            waiterRenderView.remove();
        }
        waiterRenderView = new Waiter(function () {
            waiterRenderView = null;
            isSearching = true;
            if (key != null) {
                filterObj = new Object();
                filterObj.key = key;
                filterObj.value = value;
                dhListFilter = dhList.find.equal(key, value);
            } else {
                dhListFilter = null;
                filterObj = null;
            }
            self.nofityDataSetChanged();
        }, 70);
    }
    this.contain = function (key, value) {
        if (waiterRenderView != null) {
            waiterRenderView.remove();
        }
        waiterRenderView = new Waiter(function () {
            waiterRenderView = null;
            isSearching = true;
            itemDelay = 0;
            if (key != null && value.trim().length > 0) {
                filterObj = new Object();
                filterObj.key = key;
                filterObj.value = value;
                if (key instanceof Array) {
                    dhListFilter = new List();
                    for (var k in key) {
                        dhListFilter.addAll(dhList.filter.contain(key[k], value).toArray());
                    }
                } else {
                    dhListFilter = dhList.filter.contain(key, value);
                }
            } else {
                dhListFilter = null;
                filterObj = null;
            }
            filterWaiter = null;
            self.nofityDataSetChanged();
        }, 70);
    }
    this.clearFilter = function () {
        filterObj = null;
        this.nofityDataSetChanged();
    }

    this.getAllViewsAsList = function () {
    }
    this.getAllViewsAsArray = function () {
        var rs = new Array();
        return []
    }

    this.setDhList = function (list) {
        if (waiterRenderView != null) {
            waiterRenderView.remove();
        }
        if (list instanceof Array) {
            dhList = new List(list);
        } else {
            dhList = list;
        }
        waiterRenderView = new Waiter(function () {
            filterObj = null;
            dhListFilter = null;
            self.nofityDataSetChanged();
            waiterRenderView = null;
        }, 70);
    }
    this.getDhList = function () {
        if (filterObj == null) {
            return dhList;
        } else {
            return dhListFilter;
        }
    }

    /* Return the list without filter */
    this.getOriginalList = function () {
        return dhList;
    }

    this.getCount = function () {
        if (filterObj == null) {
            return dhList != null ? dhList.size() : 0;
        } else {
            return dhListFilter.size();
        }
    }
    this.getItem = function (index) {
        return this.getDhList().get(index);
    }
    this.setOnDatabinding = function (listener) {
        onDatabinding = listener;
    }
    this.setOnRender = function (listnener) {
        onRender = listnener;
    }
    this.setEnableAsync = function (flag) {
        enableAsync = flag;
    }
    var temp, maxCompare;
    this.dataBind = function (callback, parentId) {
        if (config.destroy) {
            return;
        }

        parentView = dhCts.get(parentId);
        if (parentView == null) {
            return;
        }
        if (!parentView.info.isCreated) {
            console.log("Parent donot created");
            return;
        }
        if (wtBinding != null) {
            wtBinding.remove();
        }
        scrollParentView = dhCts.get(parentId);
        if (scrollParentView != null) {
            while (!scrollParentView.info.isScrollY && scrollParentView.info.id > 0) {
                scrollParentView = scrollParentView.getParentView();
            }
        }

        onParentRenderedItemCallback = callback;
        isBinding = true;
        wtBinding = new Waiter(function () {
            wtBinding = null;
            if (dhList == null) {
                return;
            }
            if (onDatabinding != null) {
                onDatabinding(self);
            }
            if (lb_nodata != null) {

            }
            if (self.getDhList().size() == 0) {
                self.removeAllView();
                // lb_nodata = dh.IO.textView(config.empty_data_text || dhString.no_data);
                // lb_nodata.textAlign(color.NO_DATA_TEXT);
                // lb_nodata.setTextSize(dhSize.textView.textSize_small);
                // lb_nodata.setPercentWidth(100);
                // lb_nodata.setTop(15).setBottom(15);
                // lb_nodata.bold();
                // lb_nodata.TextColor(ggColors.Grey.g500);
                // parentView.addView(lb_nodata);
                parentView.setMinHeight(0);
                return;
            } else if (lb_nodata != null) {
                lb_nodata.destroy();
                lb_nodata = null;
            }

            if (parent != null && sysDestroy != null) {
                parent.events.system.destroy = sysDestroy;
            }
            view_height = config.layout_height = scrollParentView._dom.clientHeight;

            clearAllRenderThread();

            renderView();


            temp = config.convertViewHeight;
            maxCompare = convertViews.size();

            if (threadDetectScroll != null) {
                threadDetectScroll.remove();
            }
            new Waiter(function () {
                scrollParentView.appEvent.setOnScroll(function (view, scrollLeft, scrollTop, e, iaScrollEvent) {
                    renderWhenScroll(scrollTop, false, iaScrollEvent);
                });
                isBinding = false;
            }, 30);
        }, config.bind_delay);
    }

    function renderView() {
        if (parentView == null) {
            new Waiter(function () {
                renderView();
            }, 50);
            return;
        }
        if (parentView.info.state == app_constant.VIEW_STATE.renderring || parentView.info.state == app_constant.VIEW_STATE.orderring) {
            parentView.postDelay(function (view) {
                console.log("waiter to renderring");
                view_height = config.layout_height = parentView.control.clientHeight;
                renderView();
            }, 100);
            return;
        }
        if (!addedOnDestroy && parentView != null) {
            addedOnDestroy = true;
            parentView.events.override.onPaused(function (parent) {
            });
            parentView.events.override.onResume(function (parent) {
                forceRerenderUI();
            });
            parentView.events.override.onDestroy(function () {
                self.removeAllView();
                dhAdps.remove(self.id);
                /** free memory before destroy */
                // convertView_pool.clear();
                // rootView_pool.clear();
                // dhList = null;
            });
        }
        if (scrollParentView) {
            scrollParentView.setScrollY(0);
        }
        convertView_pool.clear();
        rootView_pool.clear();
        mListMeta.filter(function (i) { return i.rootView != null; }).foreach(function (meta, pos) {
            dhCts.forceRemove(meta.rootView.info.id);
        });
        mListMeta.clear();
        if (delay_waiter != null) {
            delay_waiter.remove();
        }
        if (waiter_renderring != null) {
            waiter_renderring.remove();
        }
        renderViewItemV2(self.getItem(0));
        isBinding = false;
        scrollParentView.setScrollX(0).setScrollY(0);
        delay_waiter = null;
    }
    var no_item_need_show_first_time, compare_range;
    function renderViewItemV2(item) {
        self.removeAllView();
        if (setViewCallBack != null && mListMeta.size() == 0) {
            var convertView = initConvertView(item, 0, null);

            var root = onParentRenderedItemCallback(convertView, item, 0);
            config.convertViewHeight = root._dom.offsetHeight;
            config.convertViewWidth = parentView._dom.offsetWidth / config.number_of_col;
            no_item_need_show_first_time = parseInt((config.layout_height + config.convertViewHeight * 6) / config.convertViewHeight) * config.number_of_col;
            convertView.info.prevent_trash_cleaner = true;
            convertView.expected_move_to = 0;
            root.setMinWidth(config.convertViewHeight);
            root.setWidth(config.convertViewWidth);
            var meta = createMeta(0, item);
            meta.rootView = root;
            meta.convertView = convertView;
            meta.existConvertView = true;
            meta.offsetTop = 0;
            meta.needShow = true;
            flagPreventTrashCleaner(root);
            var count = self.getCount();
            if (config.convertViewHeight == 0) {
                root.events.override.onMeasured(function (view, width, height) {
                    renderAllRootView();
                    config.convertViewHeight = height;
                    calculateLimitConvertView();
                    compare_range = parseInt(config.convertViewHeight * (limit_convertView * 0.25));
                    root.setMinHeight(config.convertViewHeight);

                });
            } else {
                calculateLimitConvertView()
                compare_range = parseInt(config.convertViewHeight * (limit_convertView * 0.25));
                renderAllRootView();

            }
            isNewView = false;
            updateParentHeight();

        }
    }

    function calculateLimitConvertView() {
        limit_convertView = parseInt(config.layout_height / config.convertViewHeight) + (config.number_of_col == 1 ? 8 : 1);
        limit_convertView = limit_convertView * config.number_of_col + (config.number_of_col > 1 ? (config.number_of_col * 6) : 0);
        limitTop = config.convertViewHeight * 3;
        limitBottom = config.layout_height + config.convertViewHeight * 3;
        return limit_convertView;
    }


    function renderRoot(dataItem, position, forceRenderConvertView) {
        var meta = createMeta(position, dataItem);
        if ((position <= limit_convertView) || convertViews.size() < limit_convertView || !lock_limit_render) {
            meta.existConvertView = true;
            meta.needShow = true;
            meta.convertView = initConvertView(dataItem, position, null);
            meta.convertView.expected_move_to = position;
            convertViews.add(meta.convertView);
            flagPreventTrashCleaner(meta.rootView);
            meta.rootView = onParentRenderedItemCallback(meta.convertView, dataItem, position)
                .setMinHeight(config.convertViewHeight)
                .setWidth(config.convertViewWidth);
            meta.rootView.setPosition(app_constant.Position.ABSOLUTE)
                .setTop(config.convertViewHeight * meta.rowIndex)
                .setLeft(config.convertViewWidth * meta.colIndex);
        } else {
            meta.rootView = null;
        }
        meta.offsetTop = config.convertViewHeight * meta.rowIndex;
        return meta;
    }

    function renderAllRootView() {
        self.getDhList().foreach(function (dataItem, pos) {
            if (pos > 0) {
                renderRoot(dataItem, pos, false);
            }
        });
    }

    function initConvertView(dataItem, position, existingConvertView) {
        var temp = setViewCallBack(dataItem, position, existingConvertView);
        if (temp) {
            flagPreventTrashCleaner(temp);
        }
        return temp;
    }

    function clearAllRenderThread() {
        if (asyncRenderRoot != null) {
            asyncRenderRoot.stop();
        }

        if (thr_update != null) {
            thr_update.remove();
        }
        if (notifyBox != null) {
            notifyBox.dismiss();
            notifyBox = null;
        }
    }
    function forceRerenderUI() {
        renderWhenScroll(scrollParentView, scrollParentView.getScrollX(), scrollParentView.getScrollY(), true);
    }
    function createMeta(position, dataItem) {
        var meta = {
            rootView: null,
            convertView: null,
            position: position,
            colIndex: (position % config.number_of_col),
            rowIndex: temp_row,
            dataItem: dataItem,
            existConvertView: false,
            offsetTop: 0,
            needShow: false,
            isShowSubPanel: false,
            hasShownRemoveBox: false
        }
        if (position > config.number_of_col - 1) {
            temp_row += meta.colIndex == 0 ? 1 : 0;
            meta.rowIndex = temp_row;
        } else {
            temp_row = 0;
            meta.rowIndex = 0;
        }
        meta.offsetTop = meta.rowIndex * config.convertViewHeight;
        mListMeta.add(meta);
        return meta;
    }
    function flagPreventTrashCleaner(view) {
        if (view == null || view.info.prevent_trash_cleaner) {
            return;
        }
        if (view.info.id == -1) {
            view.events.override.onCreated(function (v) {
                if (!view.prevent_trash_cleaner) {
                    flagPreventTrashCleaner(v);
                }
            });
            return;
        }

        view.info.prevent_trash_cleaner = true;
        view.events.override.onAddView(function (parent, child) {
            if (!view.info.prevent_trash_cleaner) {
                flagPreventTrashCleaner(child);
            }
        });
    }

    function updateViewItemAtPosition(position) {
        var update_meta = mListMeta.single("position", position);
        if (update_meta != null && update_meta.rootView != null) {
            onUpdateRootViewItem(update_meta.rootView, position);
            if (update_meta.convertView != null) {
                initConvertView(update_meta.dataItem, update_meta.position, update_meta.convertView);
            }
        }
    }
    function renderWhenScroll(scrollTop, forceRender) {
        forceRender = forceRender != null ? forceRender : false;

        showing_meta_items.clear();
        if (scrollParentView._dom.offsetHeight >= scrollParentView._dom.scrollHeight || !lock_limit_render) {
            mListMeta.filter(function (item) {
                item.needShow = true;
                item.existConvertView = false
                showing_meta_items.add(item);
                return item != null;
            }).filter(arrangeMetaItem);
        } else if (scrollTop >= cache_scroll_top) {
            mListMeta.filter(function (item) {
                if (item.offsetTop > scrollTop - limitTop
                    && item.offsetTop < scrollTop + limitBottom) {
                    item.needShow = true;
                    showing_meta_items.add(item);
                } else {
                    item.needShow = false;
                }
                return item != null && !item.needShow && item.existConvertView;
            }).filter(hideMetaItem);
        } else if (scrollTop < cache_scroll_top) {
            mListMeta.filter(function (item) {
                if (item.offsetTop > scrollTop - limitTop
                    && item.offsetTop < scrollTop + limitBottom) {
                    item.needShow = true;
                    showing_meta_items.add(item);
                } else {
                    item.needShow = false;
                }
                return item != null && !item.needShow && item.existConvertView;
            }).filter(hideMetaItem);
        }

        mListMeta
            .filter(function (item) {
                return item.needShow && (!item.existConvertView || item.rootView._dom.innerHTML.trim().length == 0);
            })
            .filter(function (item) { arrangeMetaItem(item) });
        cache_scroll_top = scrollTop;
    }

    function arrangeMetaItem(showItem, position) {
        var cvView, root_arrange;
        if (showItem.rootView == null && rootView_pool.size() > 0) {
            root_arrange = rootView_pool.shift();
            showItem.rootView = root_arrange.root;
            showItem.convertView = root_arrange.convertView;
        } else if (showItem.rootView == null) {
            root_arrange = { root: null, convertView: null };
            showItem.rootView = root_arrange.root = onParentRenderedItemCallback(null, showItem.dataItem, showItem.position)
                .Position(app_constant.Position.ABSOLUTE)
                .setMinHeight(config.convertViewHeight)
                .setWidth(config.convertViewWidth);
            rootView_pool.add(root_arrange);
            flagPreventTrashCleaner(showItem.rootView);
        } else {
            root_arrange = { root: null, convertView: null };
            root_arrange = showItem.rootView;

            showItem.rootView
                .setMinHeight(config.convertViewHeight)
                .setWidth(config.convertViewWidth);
        }
        if (showItem.convertView && showItem.convertView.info.parent == showItem.rootView.info.id && showItem.rootView.getHTML().length > 0) {
            cvView = showItem.convertView;
            try {
                initConvertView(showItem.dataItem, showItem.position, cvView);
                showItem.rootView.reload(cvView, showItem.dataItem, showItem.position);
            } catch (ex) {
                console.log("error1", ex.message);
                root_arrange.convertView = cvView = initConvertView(showItem.dataItem, showItem.position, null);
                showItem.rootView.reload(cvView, showItem.dataItem, showItem.position);
            }
        } else if (showItem.convertView && showItem.convertView.info.parent == showItem.rootView.info.id && showItem.rootView.getHTML().length == 0) {
            cvView = showItem.convertView;
            initConvertView(showItem.dataItem, showItem.position, cvView);
            showItem.rootView.reload(cvView, showItem.dataItem, showItem.position);
            showItem.rootView.control.appendChild(cvView.control);
        } else {
            cvView = convertView_pool.shift() || convertViews.find.equal("expected_move_to", -1).get(0);
            if (cvView) {
                try {
                    var cvTemp;
                    initConvertView(showItem.dataItem, showItem.position, cvView);
                    if ((cvTemp != null && cvTemp.info.id == cvView.info.id) || cvTemp == null) {
                        /* The convertView has been reused by client */
                        showItem.rootView.reload(cvView, showItem.dataItem, showItem.position);
                    } else if (cvTemp != null) {
                        /* The convertView has been created a new element by client */
                        cvView = cvTemp;
                        showItem.rootView.reload(cvView, showItem.dataItem, showItem.position);
                    }
                } catch (e) {
                    console.log("error", e.message);
                    cvView = initConvertView(showItem.dataItem, showItem.position, null);
                    showItem.rootView.reload(cvView, showItem.dataItem, showItem.position);
                }
            } else {
                cvView = initConvertView(showItem.dataItem, showItem.position, null);
                showItem.rootView.reload(cvView, showItem.dataItem, showItem.position);
            }
            root_arrange.convertView = cvView;
        }

        if (cvView) {
            showItem.convertView = cvView;
            showItem.convertView.expected_move_to = showItem.position;
            showItem.existConvertView = showItem.convertView != null;
        }
        showItem.rootView.setTop(showItem.rowIndex * config.convertViewHeight);
        showItem.rootView.setLeft(showItem.colIndex * config.convertViewWidth);
    }


    function hideMetaItem(hideItem, pos) {
        if (hideItem.convertView && hideItem.rootView) {
            rootView_pool.add({
                root: hideItem.rootView,
                convertView: hideItem.convertView
            });
            hideItem.convertView.expected_move_to = -1;
            convertView_pool.add(hideItem.convertView);
        } else if (hideItem.convertView) {
            hideItem.convertView.expected_move_to = -1;
            convertView_pool.add(hideItem.convertView);
        }
        if (hideItem.hasShownRemoveBox && hideItem.convertView != null) {
            hideItem.convertView.setTransitionAll("0");
            hideItem.convertView.setTranslateX(0);
        } else if (hideItem.hasShownRemoveBox) {
            hideItem.hasShownRemoveBox = false;
        }
        hideItem.convertView = null;
        hideItem.existConvertView = false;
        if (hideItem.rootView != null) {

            //   dhCts.remove(hideItem.rootView.info.id);
            //   parentView.getDOM().removeChild(hideItem.rootView.getDOM());
        }
        hideItem.rootView = null;
    }

    function updateParentHeight(allowAnimation) {
        if (allowAnimation != undefined && allowAnimation) {
            parentView.setTransition("min-height", ".2").postDelay(function () {
                parentView.setTransition("min-height", "0");
            }, 200);
        } else {
            parentView.setTransition("min-height", "0");
        }
        if (config.number_of_col > 1) {
            var temp = self.getCount() % config.number_of_col;
            console.log("min height", config.convertViewHeight * self.getCount());
            parentView.setMinHeight(config.convertViewHeight * ((self.getCount() - temp) / config.number_of_col) + (temp > 0 ? config.convertViewHeight : 0));
            parentView.setMinHeight(config.convertViewHeight * self.getCount());
        } else {
            console.log("min height", config.convertViewHeight * self.getCount());
            parentView.setMinHeight(config.convertViewHeight * self.getCount());
        }
    }

    function removeView(position) {
        self.getDhList().removeAt(position);
        var meta_removed = mListMeta.removeAt(position);
        if (meta_removed.existConvertView && meta_removed.convertView != null) {
            meta_removed.rootView.setTransitionAll(".2").setHeight(0).setMinHeight(0);
            meta_removed.rootView.postDelay(function (view) {
                updateParentHeight(true);
                view.destroy();
            }, 200);

        }
        temp_row = 0;
        mListMeta.foreachWithTimer(function (meta, position) {
            meta.position = position;
            meta.colIndex = (position % config.number_of_col);
            if (position > config.number_of_col - 1) {
                temp_row += meta.colIndex == 0 ? 1 : 0;
                meta.rowIndex = temp_row;
            } else {
                temp_row = 0;
                meta.rowIndex = 0;
            }
            meta.offsetTop = meta.rowIndex * config.convertViewHeight;
            console.log("row: " + meta.rowIndex + " - offset", meta.offsetTop);
            if (meta.convertView != null && meta.existConvertView) {
                console.log("update", meta.position);
                meta.rootView.setTransitionAll(".2").setTop(meta.offsetTop);
                initConvertView(meta.dataItem, meta.position, meta.convertView);
            }
        }, 2)

    }

    this.getView = function (position) {
        return mListMeta.single("position", position).convertView;
    }

    this.scrollToPosition = function (position) {
        if (scrollParentView != null) {
            if (scrollParentView.info.isScrollY) {
                scrollParentView.setScrollY(mListMeta.get(position).rootView.getDOM().offsetTop);
            } else {
                scrollParentView.setScrollX(mListMeta.get(position).rootView.getDOM().offsetLeft);
            }
        }
    }

    this.setOnUpdateRootViewItemListener = function (callback) {
        onUpdateRootViewItem = callback;
    }

    this.setItemRenderEachTime = function (number) {
        limitItemToBuild = number;
    }

    this.setItemShowAnimation = function (name) {
        itemShowAnimation = name;
    }

    this.nofityDataSetChanged = function () {
        if (parentView != null) {
            this.dataBind(onParentRenderedItemCallback, parentView.getId());
        }
    }

    this.notifyDataSetChangedAtPosition = updateViewItemAtPosition;

    this.notifyDataSetChangedAllItems = function () {
        /* rerender convert view if it existed in root */
        var notifyConvertViews = mListMeta.filter(function (i) { return i.needShow; });
        notifyConvertViews.foreach(function (metaItem, position) {
            initConvertView(metaItem.dataItem, metaItem.position, metaItem.convertView.info.isDestroy ? null : metaItem.convertView);
        });
    }

    this.notifyDataItemChanged = function (dataItem) {
        this.notifyDataSetChangedAtPosition(this.getDhList().indexOf(dataItem));
    }

    this.setOnNotifyDataSetChangedListener = function (listener) {
        onNotifyDataSetChanged = listener;
    }
    this.notifyDataSetChanged = this.nofityDataSetChanged;
    this.setOnShowLastItemListener = function (listener) {
        onShowLastItemListener = listener;
    }
    this.setOnShowFirstItemListener = function (listener) {
        onShowLastItemListener = listener;
    }
    this.clear = function () {
        this.removeAllView();
    }
    this.removeViewControl = function (viewId) {
        dhCts.remove(id);
    }
    this.removeAllView = function () {
        if (parentView == null) {
            return;
        }
        clearAllRenderThread();
        if (notifyBox != null) {
            notifyBox.dismiss();
            notifyBox = null;
        }
        dhCts.forceRemoveChilds(parentView.info.id);
       
        mListMeta = new List();
        convertViews = new List();
        parentView.removeAllView();
    }
    this.addItem = function (dataItem) {
        if (self.getCount() == 0) {
            dhList.add(dataItem);
            self.removeAllView();
            renderView();
            return;
        }
        dhList.add(dataItem);
        var newRoot = renderRoot(dataItem, self.getCount() - 1, !lock_limit_render);
        if (onRender != null) {
            onRender(this);
        }
        updateParentHeight(true);
        for (var i in listOnRenderedListener) {
            listOnRenderedListener[i](self);
        }
    }
    this.addAllItems = function (dataList) {
        if (dataList instanceof Array) {
            dataList = new List(dataList);
        }
        var isEmpty = false
        if (self.getCount() == 0) {
            isEmpty = true;
            self.setDhList(dataList);
        } else {
            dataList.foreach(function (dataItem, postion) {
                dhList.add(dataItem);
                renderRoot(dataItem, self.getCount() - 1);
            });
        }

        if (onRender != null) {
            onRender(this);
        }
        for (var i in listOnRenderedListener) {
            listOnRenderedListener[i](self);
        }
        updateParentHeight(true);

    }
    this.addOnRenderedListener = function (listener) {
        listOnRenderedListener.push(listener);
    }
    this.setEnableScrollToRender = function (flag) {
        enableScrollToRender = flag;
    }
    this.setEnableShowNotificationRendering = function (flag) {
        enableShowNotificationCountRender = flag;
    },
        this.setId = function (id) {
            this.id = id;
        }

    this.setConfirmBeforeRemoveItem = function (flag) {
        config.confirmBeforeRemove = flag;
    }
    this.destroy = function () {
        config.destroy = true;
    }
    this.removeDataAt = function (position) {
        if (position >= this.getCount()) {
            return;
        }
        removeView(position);
    }
    this.removeDataItem = function (dataItem) {
        var mta = mListMeta.indexOf(mListMeta.single("dataItem", dataItem));
        if (mta > -1) {
            this.removeDataAt(mta);
        }
    }
    this.findViewAt = function (position) {
        return mListMeta.single("position", position).convertView;
    }
    this.showRemoveConfirmationAt = function (position, onConfirmed, onCancelled) {
        var meta = mListMeta.single("position", position);
        if (meta == null || meta.hasShownRemoveBox) {
            return;
        }
        var pn_confirm = dh.IO.block(app_constant.Size.WRAP_CONTENT, app_constant.Size.FILL_PARENT).toRightParent().toTopParent().toBottomParent().setTop(2).setBottom(2).setRight(5);
        var btn_confirm = dh.IO.button("").PaddingLeft(8).PaddingRight(8).height("100%").setRight(3).radius(2);
        btn_confirm.setIcon("delete_forever");
        btn_confirm.background(ggColors.Red.g500);
        btn_confirm.getIcon().fixCenterVerInParent();
        btn_confirm.setIconColor(ggColors.White);
        var btn_cancel = dh.IO.button("").PaddingLeft(8).PaddingRight(8).height("100%").radius(2).setRight(2);
        btn_cancel.setIcon("cancel");
        btn_cancel.setIconColor(ggColors.White);
        btn_cancel.background(ggColors.Green.g500);
        btn_cancel.getIcon().fixCenterVerInParent();
        pn_confirm.setVisible(false);
        pn_confirm.addView(btn_confirm).addView(btn_cancel);

        pn_confirm.setTranslatePercentX(100);
        meta.hasShownRemoveBox = true;
        pn_confirm.events.override.onCreated(function (view) {
            meta.convertView.setTransitionAll(".2").setTranslateX(-view.getWidth());
            pn_confirm.setTransitionAll(".2").setTranslatePercentX(0);
            pn_confirm.setVisible(true);

        });

        btn_confirm.setOnClick(function (view) {
            if (onConfirmed != null) {
                onConfirmed();
            }
            meta.hasShownRemoveBox = false;
            pn_confirm.setTranslatePercentX(110);
            pn_confirm.postDelay(function (v) {
                pn_confirm.destroy();
            }, 200);

            meta.convertView.setTranslateX(0);
        });
        btn_cancel.setOnClick(function (view) {
            meta.hasShownRemoveBox = false;
            if (onCancelled != null) {
                onCancelled();
            }
            pn_confirm.setTranslatePercentX(110);
            pn_confirm.postDelay(function (v) {
                pn_confirm.destroy();
            }, 200);

            meta.convertView.setTranslateX(0);
        });
        meta.rootView.addView(pn_confirm);
        return;
    }
    this.showMoreOptionPanel = function (position, onConfirmed, onCancelled) {

    }
    this.unlockLimitRender = function (flag) {
        lock_limit_render = !flag;
        if (mListMeta.size() > 0) {
            self.nofityDataSetChanged();
        }
    }
    this.moveConvertViewTo = function (position, toView) {
        if (mListMeta.get(position).convertView != null) {
            mListMeta.get(position).rootView.setTransitionAll(".0").setMinHeight(mListMeta.get(position).convertView.control.offsetHeight);
            mListMeta.get(position).convertView.moveTo(toView);

        }
    }
    this.recoverConvertView = function (position) {
        if (mListMeta.get(position).convertView != null) {
            mListMeta.get(position).rootView.setTransitionAll(".0").setMinHeight(mListMeta.get(position).convertView.control.offsetHeight)
            mListMeta.get(position).convertView.moveTo(mListMeta.get(position).rootView);
        }
    }
    this.setEmptyDataMessage = function (message) {
        config.empty_data_text = message;
    }
    this.setColumn = function (col) {
        if (mListMeta.size() > 0 && config.number_of_col != col) {
            config.number_of_col = col;
            self.nofityDataSetChanged();
        } else {
            config.number_of_col = col;
        }

    }
    dhAdps.add(this);
}

export class Adapter extends BaseAdapter{
    constructor(list){
        super(list);
    }
}