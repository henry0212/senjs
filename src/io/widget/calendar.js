import { FrameLayout } from "../layout/frame-layout.js";
import { senjs } from "../../index.js";
import { BaseAdapterV2 } from "../../adapter/s-base-apdater.js";


export class Calendar extends FrameLayout {
    constructor() {
        super();
    }

    onInit() {
        super.onInit();
        this._views = {
            wrapper: new senjs.layout.FrameLayout(),
            lsv_date: new senjs.widget.ListView(),
        }

        this._adapter = {
            adapter_date: new CalendarAdapter()
        }

        this._views.lsv_date.setAdapter(this._adapter.adapter_date);
    }

    _initEvent() {

    }

}

class CalendarAdapter extends BaseAdapterV2 {
    constructor(list) {
        super(list)
    }

    getView(dataItem, position, convertView) {
        if (convertView) {
            convertView = new ViewDayItem();
        }
        convertView._setDataItem(dataItem);
        return convertView;
    }
}


class ViewDayItem extends FrameLayout {
    constructor() {
        super();
    }

    _initView() {

    }

    _setDataItem(dataItem) {

    }
}