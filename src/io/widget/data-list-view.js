import { BaseList } from "./base-list.js";
import { View } from "../../core/view.js";
import { senjs } from "../../index.js";
import { BaseAdapterV2 } from "../../adapter/s-base-apdater.js";
import { StringUtil } from "../../util/string-util.js";
import { BaseHorizontalAdapter } from "../../adapter/s-base-horz-adapter.js";
import * as fileSaver from 'file-saver';
import * as XLSX from 'xlsx';

var _text_selection = "";

const __config = {
    min_col_width_em: 12
}


export class DataListView extends BaseList {
    constructor() {
        super();
    }

    onInit() {
        super.onInit();
        this.adapter = new DataListAdapter();
        super.setAdapter(this.adapter);

        this.setColPadding('0.8em');
        this._sources = [];
        this._headers = [];
        this._filter_source = [];
        this._self_cache = {
            suggestion_keys: [],
            suggestion_values: [],
            suggestion_text_searching: [],
            suggestion_is_check_all: [],
            suggestion_selecting: [],
            no_of_colum: 0,
        }



        // Number Listview
        this.adapter_number = new senjs.adapter.BaseAdapterV2();
        this.adapter.setOnRenderFinished(() => {
            this.adapter_number.setList(this.adapter.getList());
        });
        this.adapter_number.setView((dataItem, position, convertView) => {
            var lb_no;
            if (convertView == null) {
                convertView = new senjs.layout.FrameLayout();
                lb_no = new senjs.widget.TextView().toFillParent().setGravity(senjs.constant.Gravity.CENTER_LEFT)
                    .setPadding('0.4em').setTextSize('0.7em');
                convertView.setHtml('0');
                convertView
                    .setCss({ 'line-height': '' })
                    .setPaddingTop(this.adapter.colPadding)
                    .setPaddingBottom(this.adapter.colPadding)
                    .setPaddingLeft('0.2em').setPaddingRight('0.2em');
                convertView.addView(lb_no);
            } else {
                lb_no = convertView.getViewAt(0);
            }
            lb_no.setText(position + 1).setBackground(position % 2 == 0 ? 'rgb(250,250,250)' : 'rgb(240,240,240)');
            return convertView;
        });



        this.view.listview_number
            .setAdapter(this.adapter_number);

        this.events.override.onDestroy(this._onDestroy.bind(this));
    }

    _onDestroy() {
        this._self_cache.suggestion_keys = [];
        this._self_cache.suggestion_values = [];
        this._self_cache.suggestion_selecting = [];
        this._self_cache.suggestion_text_searching = [];
        this._self_cache.suggestion_is_check_all = [];
        this._sources = [];
        this._filter_source = [];
    }

    __render_wrapper() {
        this.view = {
            frame_scroller: new View(document.createElement("div"))
                .setWidth("100%")
                .setDisplayType('initial').toFillParent().setScrollType(senjs.constant.ScrollType.VERTICAL),
            frame_header: new senjs.layout.FrameLayout('100%').toTopParent().toLeftParent().toRightParent()
                .setShadow("rgba(0,0,0,0.1)", 0, 0, 3)
                .setAbsoluteZIndex(3),
            frame_dataList: new View(document.createElement("div"))
                .setWidth("100%").setHeight('100%')
                .setDisplayType('initial').toFillParent(),
            listview_number: new senjs.widget.ListView()
                .setWidth('3em')
                .setBackground("rgb(240,240,240)")
                .toTopParent().toBottomParent().toLeftParent()
                .setShadow("rgba(0,0,0,0.2)", 0, 5, 2),
            btn_option: new senjs.widget.IconView("settings")
                .setWidth('3em')
                .setMinHeight("3.2em").setIconSize("1em").setIconColor(senjs.res.material_colors.Grey.g600)
                .toTopParent().toLeftParent().setBackground('#ffffff')
        };

        this.view.listview_number
            .setBackground("#fff")
            .setAbsoluteZIndex(8);

        this.view.frame_header
            .setAbsoluteZIndex(9);

        this.addView(this.view.frame_header)
            .addView(this.view.listview_number)
            .addView(this.view.btn_option);

        this.view.btn_option.setAbsoluteZIndex(100);

        // this.view.btn_option
        //     .toAboveOf(this.view.listview_number)
        //     .toLeftOf(this.view.frame_header);

        this.view.frame_dataList.toRightOf(this.view.listview_number);
        this.view.frame_header.toRightOf(this.view.listview_number);

        this.view.frame_scroller.toBelowOf(this.view.frame_header);
        this.view.listview_number.toBelowOf(this.view.frame_header);
        this.view.listview_number.view.frame_scroller.setScrollType(senjs.constant.ScrollType.NONE);
        this.view.btn_option.setOnClick(() => {
            this.showSettingOptions();
        });
    }

    /**
     * 
     * @param {[string]} values 
     */
    setHeaders(values) {
        this._headers = values;
        this.view.frame_header.removeAllView();
        var w = (100 / values.length) + "%";
        values.forEach((value, i) => {
            var col_head = new senjs.layout.LinearLayout(w).setGravity(senjs.constant.Gravity.CENTER_LEFT);
            var lb_head = new senjs.widget.TextView(value).ellipsis().setPadding("1em").setPaddingRight(0)
                .setFloat("left");
            var icon_filter = new senjs.widget.AwesomeIcon("fas fa-filter").setIconSize("1em").setPadding('0.2em')
                .setIconColor(senjs.res.material_colors.Grey.g300).setLeft(4);
            col_head.setOnClick((view) => {
                if (this.listener.onHeaderClicked) {
                    this.listener.onHeaderClicked(view, i);
                } else if (true) {
                    this.renderSuggestion(view, i)
                }
            });
            col_head
                .addView(lb_head)
                .addView(icon_filter);
            this.view.frame_header.addView(col_head);

        });
        this.adapter.setNumberCol(values.length)
        return this;
    }

    setEnableLazyLoading() {
        throw "Cannot. Lazyload turn off by default";
    }

    /**
     * 
     * @param {View} header_view 
     * @param {number} col_index 
     */
    renderSuggestion(header_view, col_index) {
        let isChanged = false, is_a_z_sort = true;
        var sticky = new senjs.layout.StickyLayout(header_view, senjs.layout.StickyLayout.DIRECTION.BOTTOM
        ).setMinWidth("15em").setHeight('20em').setMaxWidth('15%')
            .setAnimation("")
            .setShadow("rgba(0,0,0,0.2)", 0, 0, 3).setRadius(0);
        var lsv_suggestion = new senjs.widget.ListView().toFillParent().setLeft(5).setRight(5).setBackground("#fdfdfd").setShadow("rgba(0,0,0,0.2)", 0, 0, 2, true);

        var pn_search = new senjs.layout.FrameLayout().toTopParent().toLeftParent().toRightParent().setLeft(5).setTop(5).setRight(5);
        var ic_search = new senjs.widget.IconView("search").setIconSize("0.9em").toLeftParent().toTopParent().toBottomParent().setLeft('0.4em');
        var txt_search = new senjs.widget.EditText().setText(this._self_cache.suggestion_text_searching[col_index]).setBorder(0, 'transparent').setWidth("100%").setPadding('0.2em').setTextSize("0.8em").setPaddingLeft('2em');
        txt_search.setBackground("#f9f9f9").setRadius(20).setShadow("rgba(0,0,0,0.2)", 0, 0, 2, true);

        var btn_sort_1_9 = new senjs.widget.AwesomeIcon('fas fa-sort-numeric-down')
            .setIconSize("1.2em")
            .setPaddingLeft("0.2em").setPaddingRight('0.2em').setRight('0.2em')
            .setIconColor(senjs.res.material_colors.Grey.g700)
            .setFloat("left");

        var btn_sort_9_1 = new senjs.widget.AwesomeIcon('fas fa-sort-numeric-up')
            .setIconSize("1.2em")
            .setPaddingLeft("0.2em").setPaddingRight('0.2em')
            .setIconColor(senjs.res.material_colors.Grey.g700)
            .setFloat("left");

        var btn_sort_a_z = new senjs.widget.AwesomeIcon('fas fa-sort-alpha-down')
            .setIconSize("1.2em")
            .setPaddingLeft("0.2em").setPaddingRight('0.2em').setRight('0.2em')
            .setIconColor(senjs.res.material_colors.Grey.g700)
            .setFloat("right");

        var btn_sort_z_a = new senjs.widget.AwesomeIcon('fas fa-sort-alpha-up')
            .setIconSize("1.2em")
            .setPaddingLeft("0.2em").setPaddingRight('0.2em')
            .setIconColor(senjs.res.material_colors.Grey.g700)
            .setFloat("right");

        var btn_apply = new senjs.widget.IconView("check").setIconSize("1.1em")
            .setPadding("0.2em").setPaddingLeft("1em").setPaddingRight("1em").setIconColor("#fff")
            .setBackground(senjs.res.material_colors.Green.g500);


        // var btn_check_all = new senjs.widget.IconView("check_box_outline_blank").setIconSize("1.1em")
        // .setPadding("0.2em").setPaddingLeft("1em").setPaddingRight("1em").setIconColor("#fff")
        // .setBackground(senjs.res.material_colors.Green.g500);

        var btn_check_all = new senjs.widget.IconView(this._self_cache.suggestion_is_check_all[col_index] ? "check_box" : "check_box_outline_blank").setIconSize("1.2em")
            .setTag(false).setPadding("0.2em").setPaddingLeft("0.15em").setPaddingRight("0.2em").setIconColor(senjs.res.material_colors.Grey.g800);

        var btn_clear_check = new senjs.widget.IconView('delete_forever').setIconSize("1.2em")
            .setTag(false).setPadding("0.2em").setPaddingLeft("0.1em").setPaddingRight("0.1em").setIconColor(
                this._self_cache.suggestion_selecting[col_index].length > 0
                    ? senjs.res.material_colors.Grey.g800
                    : senjs.res.material_colors.Grey.g300);

        btn_check_all.toBottomParent()
            .toLeftParent().setLeft(5).setBottom(5);

        btn_clear_check.toRightOf(btn_check_all)
            .setLeft(2).setBottom(5);

        btn_apply.toBottomParent()
            .toRightParent().setRight(5).setBottom(5);

        pn_search
            .addView(txt_search)
            .addView(ic_search);

        pn_search.toBelowOf(btn_sort_a_z);

        lsv_suggestion.toAboveOf(btn_check_all)
            .toBelowOf(pn_search).setTop(5).setBottom(5);

        sticky
            .addView(btn_sort_1_9)
            .addView(btn_sort_9_1)
            .addView(btn_sort_a_z)
            .addView(btn_sort_z_a)
            .addView(pn_search)
            .addView(lsv_suggestion)
            .addView(btn_check_all)
            .addView(btn_clear_check)
            .addView(btn_apply);

        let adapter = new senjs.adapter.BaseAdapterV2().setView((suggestionItem, position, convertView) => {
            let ic_check, lb_title;
            if (convertView == null) {
                convertView = new senjs.layout.LinearLayout().setPadding("0.1em").setGravity(senjs.constant.Gravity.CENTER_LEFT).setWidth('100%');
                convertView.setBorderBottom(1, 'rgba(0,0,0,0.05)');
                ic_check = new senjs.widget.IconView("check_box_outline_blank").setRight(3).setPadding("0.1em");
                lb_title = new senjs.widget.TextView().ellipsis().setTextSize("0.8em").setWidth('100%');
                convertView
                    .addView(ic_check)
                    .addView(lb_title);

            } else {
                ic_check = convertView.getViewAt(0);
                lb_title = convertView.getViewAt(1);
            }
            ic_check.setIcon(this._self_cache.suggestion_selecting[col_index].indexOf(
                this._self_cache.suggestion_keys[col_index].indexOf(suggestionItem)
            ) == -1 ?
                "check_box_outline_blank" : "check_box");
            lb_title.setText(`(<b>${suggestionItem.rows_index.length}</b>)&nbsp${suggestionItem.text}`).setTitle(suggestionItem.text);
            return convertView;
        });
        lsv_suggestion.setAdapter(adapter);
        /* Event */
        lsv_suggestion.setOnItemClicked((convertView, dataItem, index) => {
            var find_key_index = this._self_cache.suggestion_keys[col_index].indexOf(dataItem);
            var idx = this._self_cache.suggestion_selecting[col_index].indexOf(find_key_index);
            if (idx == -1) {
                this._self_cache.suggestion_selecting[col_index].push(find_key_index);
                convertView.getViewAt(0).setIcon("check_box");
            } else {
                this._self_cache.suggestion_selecting[col_index].splice(idx, 1);
                convertView.getViewAt(0).setIcon("check_box_outline_blank");
            }
            if (this._self_cache.suggestion_selecting[col_index].length > 0) {
                btn_clear_check.setIconColor(senjs.res.material_colors.Grey.g800);
            } else {
                btn_clear_check.setIconColor(senjs.res.material_colors.Grey.g300);
            }
            isChanged = true;
        });

        let renderSuggestionSearchList = (search_text) => {
            var list_or = search_text.split("||");

            var new_list = [];
            list_or.forEach(text => {
                new_list = new_list.concat(this._self_cache.suggestion_keys[col_index].filter(item => {
                    // return new RegExp(text, 'i').test(item.text.toString());
                    return item.text.toString().toLowerCase().indexOf(text) > -1;
                }));
            })

            waiter = null;
            adapter.setList(new_list);
        }

        var waiter = null;
        txt_search.setOnTextChanged((view, text) => {
            if (waiter) {
                waiter.remove();
            }
            if (text.length == 0) {
                adapter.setList(this._self_cache.suggestion_keys[col_index]);
                return;
            }
            this._self_cache.suggestion_text_searching[col_index] = text;
            waiter = view.postDelay(() => {
                text = text.toLowerCase();
                renderSuggestionSearchList(text);
            }, 150);
        });

        btn_sort_a_z.setOnClick(() => {
            var sources = this.adapter.getList().clone().src_array;
            sources = sources.sort((a, b) => {
                if (!isNaN(a[col_index]) && !isNaN(b[col_index])) {
                    return Number(a[col_index]) - Number(b[col_index]);
                } else if (typeof a[col_index] == "string" && typeof b[col_index] == "string") {
                    return a[col_index].localeCompare(b[col_index]);
                } else {
                    return -1;
                }
            });
            this.adapter.setList(sources);
        });


        btn_sort_z_a.setOnClick(() => {
            var sources = this.adapter.getList().clone().src_array;
            sources = sources.sort((a, b) => {
                if (!isNaN(a[col_index]) && !isNaN(b[col_index])) {
                    return Number(b[col_index]) - Number(a[col_index]);
                } else if (typeof a[col_index] == "string" && typeof b[col_index] == "string") {
                    return b[col_index].localeCompare(a[col_index]);
                } else {
                    return -1;
                }
            });
            this.adapter.setList(sources);
        });

        btn_sort_1_9.setOnClick(() => {
            var list = adapter.getList().toArray().sort((a, b) => {
                return a.rows_index.length - b.rows_index.length;
            });
            adapter.setList(list);
        });

        btn_sort_9_1.setOnClick(() => {
            var list = adapter.getList().toArray().sort((a, b) => {
                return b.rows_index.length - a.rows_index.length;
            });
            adapter.setList(list);
        });

        btn_check_all.setOnClick((view) => {
            isChanged = true;
            this._self_cache.suggestion_is_check_all[col_index] = !this._self_cache.suggestion_is_check_all[col_index];
            if (this._self_cache.suggestion_is_check_all[col_index] == true) {
                btn_clear_check.setIconColor(senjs.res.material_colors.Grey.g800);
                view.setIcon("check_box");
                this._self_cache.suggestion_selecting[col_index] = adapter.getList().toArray().map((dataItem, index) => {
                    return this._self_cache.suggestion_keys[col_index].indexOf(dataItem);
                });
            } else {
                btn_clear_check.setIconColor(senjs.res.material_colors.Grey.g300);
                view.setIcon("check_box_outline_blank");
                this._self_cache.suggestion_selecting[col_index] = [];
            }
            adapter.notifyDataSetChanged();
            //  _executeFilter();
        })

        btn_clear_check.setOnClick((view) => {
            if (this._self_cache.suggestion_selecting[col_index].length == 0) {
                return;
            }
            this._self_cache.suggestion_selecting[col_index] = [];
            this._self_cache.suggestion_is_check_all[col_index] = false;
            btn_check_all.setIcon("check_box_outline_blank");
            btn_clear_check.setIconColor(senjs.res.material_colors.Grey.g300);
            isChanged = true;
            adapter.notifyDataSetChanged();
        })

        btn_apply.setOnClick(() => {
            isChanged = true;
            _executeFilter();
            sticky.destroy();
        });

        var _executeFilter = () => {
            if (isChanged == false) {
                return;
            }
            //   this.showLoadMoreProgress();
            //setTimeout(() => {
            isChanged = false;
            if (this._self_cache.suggestion_selecting[col_index].length > 0 && header_view) {
                header_view.getViewAt(1).setIconColor(senjs.res.material_colors.Blue.g500);
                header_view.getViewAt(0).setFontWeight('bold');
            } else if (header_view) {
                header_view.getViewAt(1).setIconColor(senjs.res.material_colors.Grey.g300);
                header_view.getViewAt(0).setFontWeight('normal');
            }
            var exist = this._self_cache.suggestion_selecting.filter(item => {
                return item.length > 0;
            }).length > 0;

            if (exist) {
                var search_length = 0;
                this._filter_source = this._self_cache.suggestion_selecting.reduce((array, vals, index) => {
                    search_length = vals.length > 0 ? (search_length + 1) : search_length;
                    array = array.concat(vals.reduce((arr2, idx) => {
                        arr2 = arr2.concat(this._self_cache.suggestion_keys[index][idx].rows_index);
                        return arr2;
                    }, []));
                    return array;
                }, []);
                this._filter_source = Object.values(this._filter_source.reduce((result, indx) => {
                    var k = "k_" + indx;
                    if (result[k] == undefined) {
                        result[k] = {
                            id: indx,
                            count: 1
                        }
                    } else {
                        result[k].count++;
                    }
                    return result;
                }, {})).filter(item => { return item.count == search_length })
                    .reduce((arr, item) => {
                        arr.push(this._sources[item.id]);
                        return arr;
                    }, []);
                this.adapter.setList(this._filter_source);
            } else {
                this.adapter.setList(this._sources);
                this._filter_source = [];
            }
            // this.hideLoadMoreProgress();
            //}, 1);
        }

        /* Bind Data */
        if (this._self_cache.suggestion_keys.length > 0 && this._self_cache.suggestion_values[col_index].length == 0) {
            lsv_suggestion.showLoadMoreProgress();
            console.log(this._sources, "col_index", col_index);
            setTimeout(() => {
                var temp = this._sources.reduce((output, row, index) => {
                    if (typeof row[col_index] == "undefined" || row[col_index] == null || typeof row[col_index] == "") {
                        return output;
                    }
                    var temp = row[col_index].toString();
                    var k = (typeof (temp) === 'string') ? temp.toLowerCase() : "";
                    k = String(k).replaceAll(" ", "_", temp)
                    if (k.length > 0 && output.keys[col_index][k] == undefined) {
                        output.keys[col_index][k] = {
                            text: temp,
                            rows_index: [index]
                        };
                        output.values[col_index].push(temp);
                    } else if (output.keys[col_index][k] != undefined) {
                        output.keys[col_index][k].rows_index.push(index);
                    }
                    return output;
                }, {
                    keys: this._self_cache.suggestion_keys,
                    values: this._self_cache.suggestion_values
                });
                this._self_cache.suggestion_keys = temp.keys.reduce((array, item) => {
                    array.push(Object.values(item))
                    return array;
                }, []);
                this._self_cache.suggestion_values = temp.values;
                lsv_suggestion.hideLoadMoreProgress();
                adapter.setList(this._self_cache.suggestion_keys[col_index]);
            }, 2);
        } else {
            adapter.setList(this._self_cache.suggestion_keys[col_index]);
        }

        if (this._self_cache.suggestion_text_searching[col_index].length > 0) {
            renderSuggestionSearchList(this._self_cache.suggestion_text_searching[col_index].toLowerCase());
        }

        sticky.events.override.onDestroy(() => {
            this._self_cache.suggestion_text_searching[col_index] = txt_search.getText();
            _executeFilter();
        });

    }

    showLoadMoreProgress() {
        // this.view.icon_loadmore
        //     .setBackground("#ffffff")
        //     .setRadius('50%').setshadow("rgba(0,0,0,0.2)", 0, 0, 5);
        this.view.panel_loadmore.toFillParent().toBelowOf(this.view.frame_header)
            .setBackground('rgba(255,255,255,0.4)')
            .setPaddingTop(20)
            .setGravity(senjs.constant.Gravity.TOP_CENTER);
        super.showLoadMoreProgress();
        return this;
    }

    setOnHeaderColumnClicked(listener) {
        this.listener.onHeaderClicked = listener;
        return this;
    }

    setAdapter(adapter) {
        this.adapter = adapter;
        var coutn = 0;
        /**
         * 
         * @param {ViewRowDataItem} rowView 
         * @param {*} dataItem 
         * @param {*} index 
         */
        var onRenderDataView = (rowView, dataItem, index) => {

            rowView.setOnColClicked((column_view, row_data, row_index, col_index) => {
                var un_prevent = true;
                if (this.listener.onColumnClicked) {
                    un_prevent = this.listener.onColumnClicked(column_view, row_data, row_index, col_index);
                } else if (this.listener.onRowClicked) {
                    un_prevent = this.listener.onRowClicked(column_view.getParentView(), row_data, row_index);
                }
                if (un_prevent) {
                    showFullText(column_view, row_data[col_index]);
                }
            });

            rowView.setOnColDoubleClicked((column_view, row_data, row_index, col_index) => {
                showFullText(column_view, row_data[col_index]);
            });

            this.view.frame_dataList.addView(rowView);
            return rowView;
        }
        if (this.info.isCreated) {
            this.adapter._bind(onRenderDataView, this.info.id);
        } else {
            this.view.frame_dataList.events.override.onCreated(() => {
                this.setAdapter(adapter);
            })
        }
        return this;
    }

    setOnRowClicked(listener) {
        this.listener.onRowClicked = listener;
        return this;
    }

    setOnColumnClicked(listener) {
        this.listener.onColumnClicked = listener;
        return this;
    }

    setColPadding(value) {
        this.adapter.colPadding = value;
        this.adapter.notifyDataSetChanged();
        return this;
    }

    /**
     * 
     * @param {[[string|number]]} list 
     */
    setList(list) {
        // list = list.filter(row => {
        //     return row.length > 0 && row[0] != undefined;
        // })
        this._self_cache.suggestion_keys = [];
        this._self_cache.suggestion_values = [];
        this._self_cache.suggestion_selecting = [];
        if (list.length > 0) {
            var no_col = list[0].length;
            for (var i = 0; i < no_col; i++) {
                this._self_cache.suggestion_keys.push({});
                this._self_cache.suggestion_values.push([]);
                this._self_cache.suggestion_selecting.push([]);
                this._self_cache.suggestion_text_searching.push("");
                this._self_cache.suggestion_is_check_all.push(false);
            }
        }
        this.adapter._meta.force_render_again = this._self_cache.no_of_colum != this._self_cache.suggestion_keys.length;
        this._self_cache.no_of_colum = this._self_cache.suggestion_keys.length;
        this._sources = list;
        this.view.frame_scroller.toBelowOf(this.view.frame_header);
        this.view.listview_number.toBelowOf(this.view.frame_header);
        this.adapter.setList(list);
        return this;
    }

    showFullText(colum_view, text) {
        showFullText(colum_view, text);
        return this;
    }

    getDataAsTable() {
        var items = this.adapter.getList();
        var plain_text = items.reduce((output_tr, row) => {
            // return output_tr + "<tr>" + row.reduce((output_td, col) => {
            //     return `${output_td}<td>${col}</td>`;
            // }, "") + "</tr>";
            return output_tr + "<tr><td>" + row.join("</td><td>") + "</td></tr>";
        }, "");
        plain_text = "<table border='1' cellpading='0' cellspacing='0'><th><td>" + this._headers.join("</td><td>") + "</td></th>" + plain_text + "</table>";
        return plain_text;
    }

    copyToClipboard() {
        try {
            senjs.app.showLoading();
            setTimeout(() => {
                var html = this.getDataAsTable();
                var txt_area = document.createElement("textarea");
                senjs.app.mainFrame.getDOM().appendChild(txt_area);
                txt_area.style.position = "fixed";
                txt_area.style.zIndex = -1;
                txt_area.style.visibility = "visible";
                txt_area.style.opacity = "0";
                txt_area.value = html;
                setTimeout(() => {
                    txt_area.select();
                    document.execCommand("copy");
                    senjs.app.mainFrame.getDOM().removeChild(txt_area);
                    senjs.app.hideLoading();
                }, 1000);
            }, 10);
            // setTimeout(() => {
            // }, 10000);
            return true;
        } catch (e) {
            return false;
        }
    }

    saveAsExcel(fileName) {
        if (typeof fileSaver == "undefined") {
            throw "FileSave.js plugin not existed. Please add it first";
        }
        fileName = fileName || Date.now() + ".xlsx";
        senjs.app.showLoading();
        let array_rows = [];
        array_rows.push(this._headers);
        array_rows = array_rows.concat(this.adapter.getList().toArray());
        setTimeout(() => {
            let work_book = XLSX.utils.book_new();
            work_book.SheetNames.push("Sheet 1");

            let work_sheet = XLSX.utils.aoa_to_sheet(array_rows);
            work_book.Sheets["Sheet 1"] = work_sheet;

            let exporter_xlsx = XLSX.write(work_book, { bookType: 'xlsx', type: 'binary' });
            fileSaver.saveAs(new Blob([s2ab(exporter_xlsx)], { type: "application/octet-stream" }), fileName);
            senjs.app.hideLoading();
        }, 10);
    }

    saveAsCSV(fileName, delimiter) {
        if (typeof fileSaver == "undefined") {
            throw "FileSave.js plugin not existed. Please add it first";
        }
        fileName = fileName || Date.now() + ".csv";
        senjs.app.showLoading();
        let array_rows = [];
        array_rows.push(this._headers);
        array_rows = array_rows.concat(this.adapter.getList().toArray());
        setTimeout(() => {
            let work_book = XLSX.utils.book_new();
            work_book.SheetNames.push("Sheet 1");

            let work_sheet = XLSX.utils.aoa_to_sheet(array_rows);
            work_book.Sheets["Sheet 1"] = work_sheet;

            let exporter_csv = XLSX.write(work_book, { bookType: 'csv', type: 'binary', FS: delimiter || "|" });
            fileSaver.saveAs(new Blob([s2ab(exporter_csv)], { type: "application/octet-stream" }), fileName);
            senjs.app.hideLoading();
        }, 10);
    }

    saveAsPlainTextWithDelimiter(fileName, delimiter) {
        if (typeof fileSaver == "undefined") {
            throw "FileSave.js plugin not existed. Please add it first";
        }
        fileName = fileName || Date.now() + ".txt";
        senjs.app.showLoading();
        let array_rows = [];
        array_rows.push(this._headers);
        array_rows = array_rows.concat(this.adapter.getList().toArray());
        setTimeout(() => {
            let work_book = XLSX.utils.book_new();
            work_book.SheetNames.push("Sheet 1");

            let work_sheet = XLSX.utils.aoa_to_sheet(array_rows);
            work_book.Sheets["Sheet 1"] = work_sheet;

            // let exporter_csv = XLSX.write(work_book, { bookType: 'txt', type: 'binary', });
            // let exporter_csv = XLSX.write(work_book, { bookType: 'txt', type: 'binary', FS: delimiter || "|" });

            let str_csv = XLSX.utils.sheet_to_csv(work_sheet, { FS: "|", RS: "\n" });

            fileSaver.saveAs(new Blob([s2ab(str_csv)], { type: "text/plain" }), fileName);
            senjs.app.hideLoading();
        }, 10);
    }

    getDataAsText(delimiter) {
        let array_rows = [];
        array_rows = array_rows.concat(this.adapter.getList().toArray());


        let work_sheet = XLSX.utils.aoa_to_sheet(array_rows);

        // let exporter_csv = XLSX.write(work_book, { bookType: 'txt', type: 'binary', });
        // let exporter_csv = XLSX.write(work_book, { bookType: 'txt', type: 'binary', FS: delimiter || "|" });

        let str_csv = XLSX.utils.sheet_to_csv(work_sheet, { FS: delimiter, RS: "\r\n" });
        return str_csv;
    }

    showSettingOptions() {
        showSettingOptions.call(this);
    }

    // setAdapter() {
    //     throw new Error("Cannot set adapter for DataListView. Use setList() method instead");
    // }
}

function showSettingOptions() {
    var sticky = new senjs.layout.StickyLayout(this.view.btn_option, senjs.layout.StickyLayout.DIRECTION.BOTTOM);
    sticky.setWidth("200px").setRadius(4).setShadow("rgba(0,0,0,0.3)", 0, 0, 6);
    var options = [
        "<i class='material-icons'>file_copy</i>&nbsp Copy to clipboard",
        "<i class='material-icons'>save</i>&nbsp Save as Excel",
        "<i class='material-icons'>save</i>&nbsp Save as CSV",
        "<i class='material-icons'>save</i>&nbsp Save as Text",
    ];

    var onClicked = (view) => {
        switch (view.getTag()) {
            case 0:
                if (this.copyToClipboard()) {
                }
                sticky.destroyWithAnimate();
                break;
            case 1:
                this.saveAsExcel();
                sticky.destroyWithAnimate();
                break;
            case 2:
                this.saveAsCSV(null, "|");
                sticky.destroyWithAnimate();
                break;
            case 3:
                this.saveAsPlainTextWithDelimiter(null, "|");
                sticky.destroyWithAnimate();
                break;
        }
    }

    for (var i = 0; i < options.length; i++) {
        var btn_option = new senjs.widget.TextView(options[i]);
        btn_option.setTag(i).setWidth("100%")
            .setTextSize('0.8em')
            .setPadding("0.5em")
            .setTextGravity(senjs.constant.Gravity.CENTER_LEFT)
            .setOnClick(onClicked.bind(this))
            .addToParent(sticky);
    }
    sticky.show();
    return sticky;
}

function showFullText(colum_view, text) {
    var sticky = new senjs.layout.StickyLayout(colum_view)
        .setWidth("auto")
        .setMaxWidth(senjs.app.info.display.SCREEN_WIDTH - colum_view.getRelativeLeft() - 10)
        .setBorder(1, senjs.res.material_colors.Blue.g500)
        .setMinWidth(colum_view.getWidth())
        .setAnimation("")
        .setShadow('rgba(0,0,0,0.2)', 0, 0, 6);
    sticky.setPadding("0.8em").setHtml(text);
    sticky._dom.style.userSelect = 'text';
    sticky.setContentEditable(true);
    return sticky;
}

class DataListAdapter extends BaseAdapterV2 {
    constructor(list) {
        super(list);
        this.colPadding = 5;
        this.number_of_col = 0;
        // this._adapterUtil.onScrolling = this.onScrolling.bind(this._adapterUtil);
        // this._adapterUtil.checkScrollCondition = this.checkScrollCondition.bind(this._adapterUtil);
    }

    getCount() {
        return super.getCount();
    }

    setNumberCol(number) {
        this.number_of_col = number;
    }

    /**
     * 
     * @param {[[string|number|View]]} rowItems 
     * @param {number} position 
     * @param {ViewRowDataItem} convertView 
     */
    getView(rowItems, position, convertView) {
        if (convertView == null) {
            convertView = new ViewRowDataItem((this.number_of_col > rowItems.length) ? this.number_of_col : rowItems.length);
            convertView.setColPadding(this.colPadding);
        }
        convertView.setBackground(position % 2 == 0 ? '#fff' : '#f9f9f9');
        requestAnimationFrame(() => {
            convertView.setRowData(rowItems, position);
        })
        return convertView;
    }

    onBeginRender() {
        this.view_scroller.setScrollType(senjs.constant.ScrollType.BOTH);
        this.view_container.setMinWidth((__config.min_col_width_em * this.getItem(0).length) + 'em');
        this.view_listview.view.frame_header.setMinWidth((__config.min_col_width_em * this.getItem(0).length) + 'em');

        if (this._meta.has_bind_scroll == true) {
            return;
        }
        this._meta.has_bind_scroll = true;
        var waiter = null, waiter_is_scrolling = null, last_scroll = 0;
        this.view_scroller._dom.addEventListener('scroll', (e) => {
            var scroll_x = this.view_scroller.getScrollX(), scroll_y = this.view_scroller.getScrollY();
            this.view_listview.view.frame_header.setTranslateX(-scroll_x);
            this.view_listview.view.listview_number.setBorderRight(scroll_x > 0 ? 1 : 0, "#dddddd");
            this.view_listview.view.frame_header.setBorderBottom(scroll_y > 0 ? 1 : 0, "#dddddd");

            // clearTimeout(waiter_is_scrolling);
            // waiter_is_scrolling = setTimeout(() => {
            //     this.view_listview.view.listview_number.setScrollY(scroll_y);
            // }, 66);

            requestAnimationFrame(() => {
                this.view_listview.view.listview_number.setScrollY(scroll_y);
            })

            if (scroll_y % this._adapterDirector._meta.est_view_height > 5) {
                return;
            }
            // clearTimeout(waiter);
            // waiter = setTimeout(() => {
            //     this.view_listview.view.listview_number.setScrollY(scroll_y);
            //     waiter = null
            // }, 50);
            requestAnimationFrame(() => {
                this.view_listview.view.listview_number.setScrollY(scroll_y);
            })

        })
        return this;
    }

    getColumn() {
        return 1;
    }

}

class ViewRowDataItem extends View {
    constructor(numberOfCol) {
        super(document.createElement("div"));
        this.setDisplayType('');
        numberOfCol = numberOfCol ? numberOfCol : 0;
        this.array_col = [];
        this.listener = {
            onColClicked: null,
            onColDoubleClicked: null
        }
        // numberOfCol += 1;
        var w = (100 / numberOfCol) + "%";
        for (var i = 0; i < numberOfCol; i++) {
            var td = new View(document.createElement("span"));
            td.setTag(i);
            td._meta.col_index = i;
            td.setDisplayType('inline-block').setWidth(w).setFloat("left");
            td.setCss({
                'min-width': __config.min_col_width_em + 'em',
                'white-space': 'nowrap',
                'text-overflow': 'ellipsis',
                'overflow': 'hidden'
            });
            td.setOnClick(this.onClicked.bind(this));
            td.setOnDoubleClick(this.onDblClicked.bind(this));
            this.array_col.push(td);
            this.addView(td);
        }

    }

    onClicked(view) {
        if (this.listener.onColClicked) {
            this.listener.onColClicked(view, this.row_data, this.row_index, view._meta.col_index);
            return true;
        }
        return false;
    }

    onDblClicked(view) {
        if (this.listener.onColDoubleClicked) {
            this.listener.onColDoubleClicked(view, this.row_data, this.row_index, view._meta.col_index);
            return true;
        }
        return false;

    }

    setColPadding(value) {
        for (var i = 0; i < this.array_col.length; i++) {
            this.array_col[i].setPadding(value);
        }
        return this;
    }

    /**
     * 
     * @param {[string|number|View]} row 
     */
    setRowData(row, position) {
        this.row_data = row;
        this.row_index = position;
        // this.setPaddingBottom(position);
        // this.array_col.map((item, idx) => {
        //     var text = row[idx];
        //     item.setHtml(text + "").setTitle(text);
        // })
        var i = row.length;
        while (i--) {
            var text = row[i];
            if (this.array_col[i]) {
                this.array_col[i].setHtml(text + "").setTitle(text);
            } else {
                console.warn('DataListview', 'The length of row is not same headers')
            }
        }
        return this;
    }

    setOnColClicked(listener) {
        this.listener.onColClicked = listener;
        return this;
    }

    setOnColDoubleClicked(listener) {
        this.listener.onColDoubleClicked = listener;
        return this;
    }

    getRowData() {
        return this.row_data;
    }

    getRowIndex() {
        return this.row_index;
    }

    reload(view, row, position) {
        this.setRowData(row, position);
        return this;
    }
}

function s2ab(s) {
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf);  //create uint8array as viewer
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;
}