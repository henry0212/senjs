import { dh } from '../../src/index.js';
import mainApp from '../main.js';
import { TextView } from '../../src/io/widget/text-view.js';
import { LinearLayout } from '../../src/io/layout/linear-layout.js';
import util from '../../src/util/index.js';

const menu = [{
    text: "Restaurant",
    ggType: "restaurant",
    icon: ""
},
{
    text: "Coffee",
    ggType: "cafe",
    icon: ""
},
{
    text: "Parking",
    ggType: "parking",
    icon: ""
},
{
    text: "Convenience",
    ggType: "convenience_store",
    icon: ""
},
{
    text: "Hotel",
    ggType: "hotel",
    icon: ""
},
{
    text: "Supermarket",
    ggType: "supermarket",
    icon: ""
},
{
    text: "Supermarket",
    ggType: "supermarket",
    icon: ""
},
{
    text: "Gas",
    ggType: "gas_station",
    icon: ""
},
{
    text: "Hospital",
    ggType: "hospital",
    icon: ""
}]



const map_menu = new dh.util.List(menu),
    REQUEST_NEAR_BY = 1,
    REQUEST_SEARCH_TEXT = 2;

const center_position = {
    lat: 10.796723,
    lng: 106.659689
}

export class MapPage extends dh.layout.FrameLayout {

    constructor() {
        super();
        this.toFillParent();

        this._view = {
            map_view: null,
            layout_menu: null,
            label_top: null,
            lsv_menu: null,
            lsv_place: null,
            drawer_places: null,
            btn_show_list: null
        };
        
        this._adapter = {
            adapter_menu: null,
            adapter_place: null
        }

        this._cache = {
            listPlaces: new dh.util.List()
        }

        this._meta.currentCategory = menu[0];
        mainApp.setToobarTitle("Map");

        this.initControl();
        this.initData();
        this.initDisplay();
        this.initEvent();
    }

    initControl() {
        this._view.map_view = new dh.lib.GoogleMap("100%", "100%")
            .toFillParent();

        this._view.layout_menu = new dh.layout.DrawerLayout("100%", "30%")
            .setDirection(dh.constant.Direction.TOP);

        this._view.btn_show_list = new dh.widget.FloatingButton("keyboard_arrow_up")
            .toBottomParent().toLeftParent().setLeft(10).setBottom(10)
            .setBackground(dh.res.material_colors.Blue.g500)
            .setIconColor("#fff");

        this._view.drawer_places = new dh.layout.DrawerLayout("100%", "100%").setDirection(dh.constant.Direction.BOTTOM);

        this._view.line_ios_task = new dh.layout.FrameLayout("50%", 4)
            .toBottomParent().setBottom(10).setRadius(5)
            .setLeft("25%")
            .setBackground("rgba(255,255,255,0.8)").setShadow("rgba(0,0,0,0.1)", 0, 0, 2);


        var pn_top_header = new dh.layout.FrameLayout()
            .toTopParent().setLeft("30%").setRight("30%")
            .setRadiusAt(0, 0, 6, 6)
            .setBackground("#fff")
            .setShadow("rgba(0,0,0,0.3)", 0, 0, 4);

        var icon_dropdown = new dh.widget.IconView("arrow_drop_down")
            .toRightParent().toTopParent().toBottomParent().setIconSize(dh.res.dimen.icon.tiny);

        this._view.label_top = new dh.widget.TextView();
        this._view.label_top
            .setPadding(5)
            .setWidth("100%")
            .setText("Parking")
            .setTextSize(dh.res.dimen.font.small)
            .setTextAlign(dh.constant.TextAlign.CENTER);

        this._view.lsv_menu = new dh.widget.ListView().toFillParent();
        this._view.lsv_place = new dh.widget.ListView().toFillParent()
            .setBackground(dh.res.material_colors.Grey.g200)
            .setPaddingTop(24).setPaddingBottom(60);

        pn_top_header
            .addView(this._view.label_top)
            .addView(icon_dropdown);

        this._view.layout_menu
            .addView(this._view.lsv_menu);

        this._view.drawer_places
            .addView(this._view.lsv_place);

        this.addView(this._view.map_view)
            .addView(this._view.line_ios_task)
            .addView(this._view.drawer_places)
            .addView(pn_top_header)
            .addView(this._view.layout_menu)
            .addView(this._view.btn_show_list);
    }

    initData() {
        this._adapter.adapter_menu = new dh.adapter.BaseAdapter(map_menu);
        this._adapter.adapter_menu.setColumn(3);
        this._adapter.adapter_menu.setView((dataItem, position, convertView) => {
            return new dh.widget.TextView()
                .setWidth("94%")
                .setLeft("3%")
                .setTop(5)
                .setTextGravity(dh.constant.Gravity.CENTER)
                .setText(dataItem.text)
                .setPadding(10)
                .setRadius(3)
                .setBackground("rgba(0,0,0,0.02)")
                .setTextSize(dh.res.dimen.font.small);
        });

        this._adapter.adapter_place = new dh.adapter.InfinityAdapter(new dh.util.List());
        this._adapter.adapter_place.setView((dataItem, position, convertView) => {
            var lb_name, lb_address, imv_thum,
                line_name, line_address;
            if (convertView == null) {
                convertView = new dh.layout.LinearLayout("92%")
                    .setTop(15)
                    .setOrientation(dh.constant.Orientation.VERTICAL)
                    .setLeft("4%").setBackground("#fff").setRadius(4).setPadding(10);
                imv_thum = new dh.widget.ImageView().setWidth("100%").setHeight(240);
                imv_thum.setBackground(dh.res.material_colors.Grey.g300).setScaleType(dh.constant.ImageScale.COVER)
                line_name = new dh.layout.LinearLayout("100%").setTop(10);
                line_address = new dh.layout.LinearLayout("100%").setTop(6);
                lb_name = new dh.widget.TextView().setTextSize(dh.res.dimen.font.larger).bold()
                    .setTextColor(dh.res.material_colors.Grey.g700);
                lb_address = new dh.widget.TextView().setTextSize(dh.res.dimen.font.normal)
                    .setTextColor(dh.res.material_colors.Grey.g700);

                line_name
                    .addView(new dh.widget.IconView("store").setIconSize(dh.res.dimen.icon.tiny).setRight(6))
                    .addView(lb_name)

                line_address
                    .addView(new dh.widget.IconView("location_on").setIconSize(dh.res.dimen.icon.tiny).setRight(6))
                    .addView(lb_address)

                convertView
                    .addView(imv_thum)
                    .addView(line_name)
                    .addView(line_address);
            } else {
                imv_thum = convertView.getViewAt(0);
                lb_name = convertView.getViewAt(1).getViewAt(1);
                lb_address = convertView.getViewAt(2).getViewAt(1);
            }
            if (dataItem.photos && dataItem.photos.length > 0) {
                imv_thum.setImage(dataItem.photos[0].getUrl({
                    maxWidth: 640,
                    maxHeight: 240
                }))
            } else {
                imv_thum.setImage(null);
            }
            lb_name.setText(dataItem.name);
            lb_address.setText(dataItem.vicinity);
            return convertView;
        });

        this._view.lsv_menu.setAdapter(this._adapter.adapter_menu);
        this._view.lsv_place.setAdapter(this._adapter.adapter_place);
        this.getPlace();
    }

    initDisplay() {

    }

    initEvent() {
        this._view.label_top.setOnClick(this.onClicked.bind(this));
        this._view.btn_show_list.setOnClick(this.onClicked.bind(this));
        this._view.lsv_menu.setOnItemClicked(this.onMenuItemClicked.bind(this));
        this._view.lsv_place.setOnItemClicked((view, dataItem, position) => {
            this.showPlaceDetail(position);
        });

        this._view.drawer_places.setOnPageChanged((drawer, isOpening) => {
            this._view.btn_show_list.updateIcon(isOpening ? "keyboard_arrow_down" : "keyboard_arrow_up");
        })
    }


    async sendRequestPlace(request_case, requestQuery) {
        switch (request_case) {
            case REQUEST_NEAR_BY:
                var result = await this._view.map_view.findNearByPlaces(requestQuery);
                this.onResponsePlaceSuccess(request_case, result);
                break;
            case REQUEST_SEARCH_TEXT:

                break;
        }
    }

    onResponsePlaceSuccess(request_case, result) {
        switch (request_case) {
            case REQUEST_NEAR_BY:
                this._view.map_view.removeAllMarkers();
                this._cache.listPlaces = new dh.util.List(result);
                this._cache.listPlaces.foreach((place, position) => {
                    this._view.map_view.addMarker({
                        position: {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        }
                    }).setTag(position)
                        .setOnClick(this.onMarkerClicked.bind(this));
                })
                var list = new dh.util.List();
                list.addAll(result);
                list.addAll(list);
                list.addAll(list);
                list.addAll(list);
                list.addAll(list);
                this._adapter.adapter_place.setList(list);
                break;
            case REQUEST_SEARCH_TEXT:
                break;
        }
    }

    onClicked(view) {
        switch (view) {
            case this._view.label_top:
                this._view.layout_menu.openPage();
                break;
            case this._view.btn_show_list:
                if (this._view.drawer_places.isOpening()) {
                    this._view.drawer_places.closePage();
                } else {
                    this._view.drawer_places.openPage();
                }
                break

        }
    }

    onMarkerClicked(marker) {
        this.showPlaceDetail(marker.getTag());
    }

    onMenuItemClicked(view, dataItem, position) {
        this._meta.currentCategory = dataItem;
        this.getPlace();
        this._view.layout_menu.closePage();
    }

    getPlace() {
        this._view.label_top.setText(this._meta.currentCategory.text);
        var request = {
            location: new google.maps.LatLng(center_position.lat, center_position.lng),
            radius: '1000',
            type: [this._meta.currentCategory.ggType]
        };
        this.sendRequestPlace(REQUEST_NEAR_BY, request);
    }

    async showPlaceDetail(place_index) {
        var place_selecting = this._cache.listPlaces.get(place_index);
        var place_detail = await this._view.map_view.findPlaceDetail(place_selecting.place_id);
        var new_page = mainApp.registerNewPage(place_selecting.name);
        var page_place_detail = new PlaceDetailPage(place_detail);
        new_page.addView(page_place_detail);

    }
}


class PlaceDetailPage extends dh.layout.FrameLayout {

    constructor(placeDetail) {
           super();
        this.toFillParent();
        this._meta.placeDetail = placeDetail;
        this._view = {
            pager_photo: null,
            imv_banner: null,
            lb_address: null,
            lb_phone: null,
            lb_email: null,
            lb_rating: null,
            btn_review: null,
            linear_paging: null
        }

        this._adapter = {
            adapter_photo: null,
            adapter_photo_paging: null
        }

        this.initControl();
        this.initData();
        this.initDisplay();
        this.initEvent();

    }

    initDisplay() {
        this._view.lb_address.setText(this._meta.placeDetail.vicinity);
        this._view.lb_phone.setText(this._meta.placeDetail.formatted_phone_number);
        this._view.lb_email.setText(this._meta.placeDetail.website || "");
        this._view.lb_rating.setText(this._meta.placeDetail.rating || "_");
    }

    initData() {
        this._adapter.adapter_photo = new dh.adapter.BaseAdapter(new dh.util.List(this._meta.placeDetail.photos))


        this._adapter.adapter_photo.setView((photo, position, convertView) => {
            return new dh.widget.ImageView(photo.getUrl({
                maxWidth: 640,
                maxHeight: 640
            })).setScaleType(dh.constant.ImageScale.COVER).toFillParent();
        });

    }

    override_onResume() {
        this.postDelay(() => {
            this._view.pager_photo.setAdapter(this._adapter.adapter_photo);
        }, 600)
    }

    initControl() {

        var panel_banner = new dh.layout.FrameLayout("100%", 240);

        this._view.pager_photo = new dh.layout.PagerLayout().setWidth("100%").setHeight("100%").setBackground(dh.res.material_colors.Grey.g300);

        this._view.linear_paging = new dh.layout.LinearLayout("100%", 30);
        this._view.linear_paging.setOrientation(dh.constant.Orientation.HORIZONTAL);

        this._view.lb_address = new dh.widget.TextView().setTextSize(dh.res.dimen.font.small).setWidth("100%");
        this._view.lb_phone = new dh.widget.TextView().setTextSize(dh.res.dimen.font.small).setWidth("100%");
        this._view.lb_email = new dh.widget.TextView().setTextSize(dh.res.dimen.font.small).setWidth("100%");
        this._view.lb_rating = new dh.widget.TextView().setPadding(5)
            .bold()
            .setTextSize(dh.res.dimen.font.x_extreme)
            .setTextGravity(dh.constant.Gravity.CENTER);

        this._view.btn_review = new dh.widget.Button((this._meta.placeDetail.reviews ? this._meta.placeDetail.reviews.length : 0) + " reviews")
            .setWidth("94%").setTop(15).setLeft("3%").setBackground(dh.res.material_colors.Grey.g100)
            .setRadius(4).setPadding(10);

        var linear_info = new dh.layout.LinearLayout().setWidth("78%").setTop(5).setLeft("2%");
        linear_info.setOrientation(dh.constant.Orientation.VERTICAL);

        var line1 = new dh.layout.LinearLayout().setWidth("100%");

        var line_address = new dh.layout.LinearLayout().setPadding(5);
        var line_phone = new dh.layout.LinearLayout().setPadding(5);
        var line_email = new dh.layout.LinearLayout().setPadding(5);
        var line_rating = new dh.layout.LinearLayout().setWidth("20%").setPadding(5).setTop(10).setBottom(10).setBorderLeft(1, dh.res.material_colors.Grey.g200);

        var icon_address = new dh.widget.IconView("location_on").setIconSize(dh.res.dimen.icon.tiny).setRight(8);
        var icon_phone = new dh.widget.IconView("phone").setIconSize(dh.res.dimen.icon.tiny).setRight(8);
        var icon_email = new dh.widget.IconView("link").setIconSize(dh.res.dimen.icon.tiny).setRight(8);
        var icon_rating = new dh.widget.IconView("star_rate")
            .setWidth("38%")
            .setIconSize(dh.res.dimen.icon.normal).setRight(2);

        // render paging
        if (this._meta.placeDetail.photos && this._meta.placeDetail.photos.length > 0) {
            for (let i = 0; i < this._meta.placeDetail.photos.length; i++) {
                var ic_pager = new dh.widget.IconView("fiber_manual_record")
                    .setIconSize(dh.res.dimen.icon.x_tiny).setIconColor(i == 0 ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)").setPadding(2);
                this._view.linear_paging.setTag(0);
                ic_pager.setOnClick(v => {
                    this._view.linear_paging.getViewAt(this._view.linear_paging.getTag()).setIconColor("rgba(0,0,0,0.6)");
                    this._view.linear_paging.getViewAt(i).setIconColor("rgba(255,255,255,0.8)")
                    this._view.linear_paging.setTag(i);
                    this._view.pager_photo.setCurrentPage(i);
                    console.log("page", i);
                });

                this._view.linear_paging.addView(ic_pager);
            }
        }

        line_address
            .addView(icon_address)
            .addView(this._view.lb_address)

        line_phone
            .addView(icon_phone)
            .addView(this._view.lb_phone)

        line_email
            .addView(icon_email)
            .addView(this._view.lb_email)

        linear_info
            .addView(line_address)
            .addView(line_phone)
            .addView(line_email);


        line_rating
            .addView(icon_rating)
            .addView(this._view.lb_rating);

        line1
            .addView(linear_info)
            .addView(line_rating);

        this._view.linear_paging.toBottomParent().toLeftParent();
        this._view.linear_paging.setGravity(dh.constant.Gravity.TOP_CENTER);


        panel_banner
            .addView(this._view.pager_photo)
            .addView(this._view.linear_paging);

        this
            .addView(panel_banner)
            .addView(line1)
            .addView(this._view.btn_review);
    }

    initEvent() {
        this._view.btn_review.setOnClick(this.onClicked.bind(this));
        this._view.pager_photo.setOnPageChanged((pager, pageIndex) => {
            this._view.linear_paging.getViewAt(this._view.linear_paging.getTag()).setIconColor("rgba(0,0,0,0.6)");
            this._view.linear_paging.getViewAt(pageIndex).setIconColor("rgba(255,255,255,0.8)")
            this._view.linear_paging.setTag(pageIndex);
        })
    }

    onClicked(view) {
        switch (view) {
            case this._view.btn_review:
                this.showReview();
                break;
        }
    }

    showReview() {
        var reviewInstance = mainApp.registerNewInstance("Review");
        reviewInstance.getPageOpening().setBackground(dh.res.material_colors.Grey.g200);
        var linear_comment = new dh.layout.LinearLayout("100%");
        linear_comment.setOrientation(dh.constant.Orientation.VERTICAL);
        var render_comment_view = (dataItem, position) => {
            var convertView = new dh.layout.LinearLayout("100%").setPadding(10);
            var pn_content = new dh.layout.LinearLayout().setLeft(15);
            var imv_avatar, lb_author, lb_comment, lb_time;

            convertView.setBackground("transparent");
            imv_avatar = new dh.widget.ImageView()
                .setWidth(48)
                .setHeight(48)
                .setRadius(24);

            pn_content.setWidth("calc(100% - 48px");
            pn_content.setOrientation(dh.constant.Orientation.VERTICAL);

            lb_author = new dh.widget.TextView()
                .setWidth("100%")
                .setTextSize(dh.res.dimen.font.smaller);

            lb_comment = new dh.widget.TextView().setWidth("100%")
                .setTop(10)
                .setBottom(10);
            lb_time = new dh.widget.TextView()
                .setWidth("100%")
                .setTextSize(dh.res.dimen.font.smaller);

            pn_content.setRadius(4).setBackground("#fff");
            lb_time.setTextAlign(dh.constant.TextAlign.RIGHT);
            pn_content.setPadding(8)
                .addView(lb_author)
                .addView(lb_comment)
                .addView(lb_time);

            convertView
                .addView(imv_avatar)
                .addView(pn_content);

            imv_avatar.setImage(dataItem.profile_photo_url);
            lb_author.setText(dataItem.author_name);
            lb_comment.setText(dataItem.text);
            lb_time.setText(dataItem.relative_time_description);
            return convertView;
        };

        new dh.util.List(this._meta.placeDetail.reviews).foreach((item, position) => {
            linear_comment.addView(render_comment_view(item, position))
        })

        reviewInstance.addView(linear_comment);
    }
}