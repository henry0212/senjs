import { BaseActivity } from "./base-activity.js";
import { senjs } from "../src/index.js";
import { AdapterViewMenuGuideItem } from "./adapter-views/view-menu-guide-item.js";

const data_guide_menu = [
    {
        id: 1,
        name: 'Introduction',
    },
    {
        id: 2,
        name: "Layout"
    },
    {
        id: 3,
        name: "Widget"
    },
    {
        id: 4,
        name: "Create a sample - Booking app"
    },
    {
        id: 5,
        name: "Booking app - List Product",
    },
    {
        id: 6,
        name: "Booking app - View product"
    },
    {
        id: 7,
        name: "Booking app - Add to cart"
    },
    {
        id: 8,
        name: "Booking app - Choose delivery address"
    },
    {
        id: 9,
        name: "Booking app - Finish"
    },
    {
        id: 10,
        name: "Working with Firebase Firestore"
    },
    {
        id: 11,
        name: "Create a CMS"
    }

]

export class MainApp extends BaseActivity {
    constructor() {
        super();
        this.initViews();
        this.renderDemoScreen();
    }

    initViews() {
        this.views = {
            frame_code: new senjs.layout.FrameLayout('30%', '100%'),
            frame_demo: new senjs.layout.FrameLayout("50%", "100%"),
            lsv_menu: new senjs.widget.ListView().setWidth("20%", '100%')
        }

        this.adapters = {
            adapter_guide_menu: new senjs.adapter.BaseAdapter(data_guide_menu)
                .setView(
                    (dataItem,position,convertView) =>{
                    if(convertView == null){
                        convertView = new AdapterViewMenuGuideItem();
                    }
                    convertView.setDataItem(dataItem);
                    return convertView;
                })
        }

        this.views.lsv_menu.setAdapter(this.adapters.adapter_guide_menu);

        this
            .addView(this.views.lsv_menu)
            .addView(this.views.frame_code)
            .addView(this.views.frame_demo);
    }


    renderDemoScreen() {
        this.views.frame_demo
    }

}
