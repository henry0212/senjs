import { senjs } from "../../src/index.js";
import { IconView } from "../../src/io/widget/icon-view.js";
import { TextView } from "../../src/io/widget/text-view.js";
import { TableModel } from "../models/table-model.js";


export class ViewTableItem extends senjs.layout.FrameLayout {
    constructor() {
        super("100%");

        this.setPadding("1em");
        this.root = new senjs.layout.LinearLayout("100%", "10em")
            .setOrientation(senjs.constant.Orientation.VERTICAL)
            .setGravity(senjs.constant.Gravity.CENTER)
            .setBackground(senjs.res.material_colors.Blue.g500);

        this.lb_table_no = new TextView().setPadding("0.5em")
            .toTopParent().toLeftParent().toRightParent()
            .setTextColor("#fff")
            .setTextSize("1.5em")
            .setTextAlign("center");

        this.ic_status = new IconView("radio_button_unchecked").setIconSize("3em")
            .setIconColor("#fff");

        this.root
            .addView(this.lb_table_no)
            .addView(this.ic_status);

        this.addView(this.root);
        this.setOnClick(this.onClicked.bind(this));
    }



    /**
     * 
     * @param {TableModel} tableModel 
     * @param {number} position 
     */
    setDataItem(tableModel, position) {
        this.tableModel = tableModel;
        this.position = position;
        this.lb_table_no.setText(tableModel.tableNo + "");
        switch (this.tableModel.status) {
            case TableModel.STATUS.PENDING:
                this.root.setBackground('#fff')
                    .setBorder(1, senjs.res.material_colors.Grey.g400);
                this.lb_table_no.setTextColor(senjs.res.material_colors.Grey.g600);
                this.ic_status
                    .setIcon("radio_button_unchecked")
                    .setTextColor(senjs.res.material_colors.Grey.g600);
                this.lb_table_no.setTextColor(senjs.res.material_colors.Grey.g600);
                break;
            case TableModel.STATUS.BOOKED:
                this.root.setBackground(senjs.res.material_colors.Grey.g400)
                    .setBorder(1, senjs.res.material_colors.Grey.g500);
                this.lb_table_no.setTextColor("#fff")
                this.ic_status
                    .setIcon("block")
                    .setTextColor("#fff");
                break;
            case TableModel.STATUS.SELECTING:
                this.lb_table_no.setTextColor("#fff")
                this.root.setBackground(senjs.res.material_colors.Blue.g500)
                    .setBorder(1, '#fff');
                this.ic_status
                    .setIcon("check_circle")
                    .setTextColor("#fff");
                break;
        }

        return this;
    }

    onClicked(view) {
        switch (view) {
            case this:
                if (this.tableModel.status != TableModel.STATUS.BOOKED) {
                    this.tableModel.status = (this.tableModel.status == TableModel.STATUS.PENDING) ? TableModel.STATUS.SELECTING : TableModel.STATUS.PENDING;
                }
                this.tableModel.isSelecting = true;
                this.setDataItem(this.tableModel, this.position);
                break;
        }
    }

}