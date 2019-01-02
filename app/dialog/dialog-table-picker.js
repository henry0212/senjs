import { senjs } from "../../src/index.js";
import { TableModel } from "../models/table-model.js";
import { ViewTableItem } from "../adapter-views/view-table-item.js";
import { DbUtil } from "../db-utils/database.js";
import { NumberUtil } from "../../src/util/number-util.js";


var table_data = new senjs.util.List();




export class TablePickerDialog extends senjs.dialog.BaseDialog {
    constructor() {
        super();
        this.setWidth("70%").setHeight("80%").setPadding("0.2em");
        this.listener = {
            onTablePicked: null
        }

    }

    async onCreated() {
        table_data = new senjs.util.List(await new DbUtil().allTables());
        this.adapter_table = new senjs.adapter.BaseAdapterV2(table_data)
            .setColumn(5)
            .setView(this.onRenderTableItem.bind(this));
        this.lsv_table = new senjs.widget.ListView().toFillParent();
        this.lsv_table.setAdapter(this.adapter_table);
        this.addView(this.lsv_table);
    }

    onDestroy() {
        if (this.listener.onTablePicked) {
            this.listener.onTablePicked(this.adapter_table.getList().filter(item => item.status == TableModel.STATUS.SELECTING));
        }
    }

    /**
     * 
     * @param {TableModel} tableItem 
     * @param {number} position 
     * @param {ViewTableItem } convertView 
     */
    onRenderTableItem(tableItem, position, convertView) {
        if (convertView == null) {
            convertView = new ViewTableItem();
        }
        convertView.setDataItem(tableItem, position);
        return convertView;
    }

    setOnTablePicked(listener) {
        this.listener.onTablePicked = listener;
        return this;
    }
}