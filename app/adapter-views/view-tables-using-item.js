import { senjs } from "../../src/index.js";
import { IconView } from "../../src/io/widget/icon-view.js";
import { TextView } from "../../src/io/widget/text-view.js";
import { TableOrderModel } from "../models/table-order-model.js";


export class ViewTablesUtingItem extends senjs.layout.FrameLayout {
    constructor() {
        super("100%");

        this.setPadding("1em");
        this.root = new senjs.layout.LinearLayout("100%", "8em")
            .setOrientation(senjs.constant.Orientation.VERTICAL)
            .setGravity(senjs.constant.Gravity.CENTER)
            .setBackground(senjs.res.material_colors.Blue.g500);

        this.lb_table_no = new TextView().setPadding("0.5em")
            .setTextColor("#fff")
            .setTextSize("1.5em")
            .setBackground(senjs.res.material_colors.Green.g500)
            .setTextAlign("center");


        this.root
            .addView(this.lb_table_no);

        this.addView(this.root);
        this.setOnClick(this.onClicked.bind(this));
    }



    /**
     * 
     * @param {TableOrderModel} tableOrderModel 
     * @param {number} position 
     */
    setDataItem(tableOrderModel, position) {
        this.tableOrderModel = tableOrderModel;
        this.position = position;
        this.lb_table_no.setText(tableOrderModel.tableNo + "");
        this.root.setBackground('#fff');
         this.lb_table_no.setText(tableOrderModel.tables.reduce((merger, currentItem) => {
            return merger + "," + currentItem.tableNo;
        }, ""));
        if (this.lb_table_no.getText().length > 0) {
            this.lb_table_no.setText(this.lb_table_no.getText().substr(1));
        }
        return this;
    }

    onClicked(view) {
        switch (view) {
            case this:
                if (this.tableOrderModel.status != tableOrderModel.STATUS.BOOKED) {
                    this.tableOrderModel.status = (this.tableOrderModel.status == tableOrderModel.STATUS.PENDING) ? tableOrderModel.STATUS.SELECTING : tableOrderModel.STATUS.PENDING;
                }
                this.tableOrderModel.isSelecting = true;
                this.setDataItem(this.tableOrderModel, this.position);
                break;
        }
    }

}