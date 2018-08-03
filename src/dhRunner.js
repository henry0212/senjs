
import { app, dhCts } from './core/app-context.js'
import { View } from './core/view.js';
import { Adapter } from './adapter/adapter.js';
import { List } from './util/list-util.js';
import { ListView } from './io/widget/list-view.js';
import { SliderButton } from './io/widget/slider-button.js';
import { Checkbox } from './io/widget/checkbox.js';
import { StickyLayout } from './io/layout/sticky-layout.js';
import { FrameLayout } from './io/layout/frame-layout.js';
import { LinearLayout } from './io/layout/linear-layout.js';
import { PagerLayout } from './io/layout/pager-layout.js';
import { TextView } from './io/widget/text-view.js';
import { EditText } from './io/widget/edit-text.js';
import { Button } from './io/widget/button.js';
import { StoryLayout } from './io/layout/story-layout.js';
import { IconView } from './io/widget/icon-view.js';
import { material_colors } from './res/theme.js';
import { Combobox } from './io/widget/combobox.js';
import { ImageView } from './io/widget/image-view.js';
import { TabButton } from './io/widget/tab-button.js';
import { DrawerLayout } from './io/layout/drawer-layout.js';
import { BaseDialog } from './io/dialog/base-dialog.js';
import { NumberUtil } from './util/number-util.js';
import { BaseAdapter } from './adapter/base-adapter.js';
import { RadioButton } from './io/widget/radio-button.js';
import { app_constant } from './res/constant.js';
import { app_size } from './res/dimen.js';
import { GoogleMap } from './libs/google-map.js';

const array_avatar = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsIQjuLhaAslzMJUJAV1F-Emni5SAbguoWDWlwfr9jFWSnjBpu",
    "http://taimienphi.vn/tmp/cf/aut/cZ1E-anh-avatar-dep-2.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTq60qHIEWyBPOLE-PsZtTrO7hZxUqzq77J0bnyxFaQVdNKfwownA",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoE_sAxdEJLX7WAa5CzwGev9BddrV0JlqCdMKYggP90K73o-68NA",
    "http://cucgach.mobi/wp-content/uploads/2016/04/hinh-avatar-dep-avatar-vip-nhat-se-vo-2.jpg",
    "http://thuthuatphanmem.vn/uploads/2018/04/10/avatar-doi-dep_015657057.jpg",
    "http://thuthuat123.com/uploads/2018/01/27/Avatar-dep-nhat-79_112148.jpg",
    "https://lh3.googleusercontent.com/-bFd5gQwQ0pw/WUCl1lmMD5I/AAAAAAAAAHU/PPG1RY-HKLQ2vUZNQDeEQ4MDWCZ2PgqNwCL0BGAs/w530-d-h424-p-rw/avatar-anime-dep-12.jpg",
    "https://phukiencongtrinh.com/uploads/news/14711hinh-anh-mat-troll-so-1-facebook.jpg",
    "https://s2.anh.im/2015/04/01/1a6070.png"
]

var _app_list = new List();
app.onStart((mainFrame) => {
    var drawer_layout1 = new DrawerLayout("100%", "100%").toTopParent().toBottomParent();
    var drawer_layout2 = new DrawerLayout("70%", "100%").toTopParent().toBottomParent();
    var drawer_layout3 = new DrawerLayout("100", "30%").toRightParent().toLeftParent().setWidth("100%");
    var drawer_layout4 = new DrawerLayout("100%", "100%").toTopParent().toBottomParent();
    mainFrame.setPosition("fixed");
    for (var i = 1; i <= 60; i++) {
        _app_list.add({
            name: "data item no " + i,
            avatar: array_avatar[NumberUtil.randomNumber(0, array_avatar.length - 1)]
        });
    }
    var btn_add = new IconView("add").setPaddingLeft(10).setPaddingRight(10);
    var btn_backup = new IconView("backup").setPaddingLeft(10).setPaddingRight(10);
    var linear = new LinearLayout().toBottomParent().setLeft(0).setRight("0%");
    linear.setOrientation(app.constant.Orientation.HORIZONTAL);
    for (var i = 0; i < 3; i++) {
        linear.addView(new TextView().setText("item no: " + i));
    }
    drawer_layout1.setBackground("transparent");
    var lb_menu_title = new TextView();
    lb_menu_title.setText("Menu").setLeft(20).setTop("10%")
        .setTextSize(app_size.font.extreme)
        .setTextColor(material_colors.Grey.g200);

    var pn_menu = new LinearLayout().toFillParent().setLeft(20).setRight(20).setTop(10).setBottom("10%");
    pn_menu.setBackground("rgba(0,0,0,0.3)").setRadius(4);
    pn_menu.setOrientation(app_constant.Orientation.VERTICAL);
    drawer_layout1
        .addView(lb_menu_title)
        .addView(pn_menu);
    pn_menu.toBelowOf(lb_menu_title);

    var storyBoard = new StoryLayout();
    storyBoard.setId("story_board");
    storyBoard.setColorBackIcon(material_colors.Blue.g700);
    storyBoard.toFillParent().setBackground("#f1f1f1");
    storyBoard.setToolbarHeader("Home");

    drawer_layout1.setDirection(app_constant.Direction.LEFT);
    drawer_layout3.setDirection(2);
    drawer_layout3.setShadow("rgba(0,0,0,0.2)", 0, 0, 4);
    drawer_layout4.setDirection(3);

    mainFrame.addView(storyBoard);
    storyBoard.addView(homePage());
    // storyBoard.addView(drawer_layout3);
    // storyBoard.addView(drawer_layout4);
    // storyBoard.addView(drawer_layout2);

    mainFrame.addView(drawer_layout1);

    var btn_home = new Button("Dashboard").setTextColor(material_colors.Grey.g300).setPadding(10);
    var btn_widget = new Button("Widget").setTextColor(material_colors.Grey.g300).setPadding(10);
    pn_menu
        .addView(btn_home)
        .addView(btn_widget);

    btn_widget.setOnClick((view, data, position) => {
        storyBoard.newPage("Widget");
        storyBoard.addView(widgetPage());
        drawer_layout1.closePage();
    })
    drawer_layout1.setOnPageChanging((view, isShowing, percent) => {
        storyBoard.filterBlur((8 * percent / 100));
    })

    storyBoard.addViewToToolbar(btn_add).addViewToToolbar(btn_backup);

    btn_backup.setOnClick(() => {
        var instance = storyBoard.newInstance("New Instance");
        instance.postDelay(() =>{
            instance.addView(pagerPage());
            var btn_search = new IconView("search").setPaddingLeft(5).setPaddingRight(5);
            instance.addViewToToolbar(btn_search);
            btn_search.setOnClick(() => {
                instance.newPage("Search");
            })
        },400)
      
        // storyBoard.newPage(dataItem).addView(generateNewList());
    })

    btn_add.setOnClick(function (view) {
        storyBoard.newPage("Widget");
        storyBoard.addView(widgetPage());
    })
    storyBoard.setOnPageChanged(function (view, pageIndex, isNext) {
    })

    drawer_layout3.setOnPageChanging(function (view, isShowing, percent) {
    })

})

var homePage = function () {
    return new GoogleMap().toFillParent().renderMap();
}

var widgetPage = function (storyBoard) {
    var container = new LinearLayout("100%");
    container.setPadding(10);
    container.setGravity(app.constant.Orientation.VERTICAL);
    var btn_slider = new SliderButton().setTop(10);
    var check_box = new Checkbox().setTop(10);
    var txt_value1 = new EditText()
    txt_value1.setWidth("100%").setTop(10);



    var combobox = new Combobox().setTop(10);
    combobox.setView((dataItem, position, convertView) => {
        return new TextView()
            .setPadding(5)
            .setText(dataItem);
    });

    combobox.setPickerData(["item 1", "item 2", "item 3", "item 4"]);

    var btn1 = new Button().setWidth("100%");
    btn1.setText("Show Dialog").setPadding(10).setRadius(4).setBackground(material_colors.Grey.g200);
    btn1.setTop(10);

    var tab_button = new TabButton().setWidth("100%").setHeight(40);
    tab_button.addButton({ icon: 'store', text: 'tab 1' });
    tab_button.addButton({ icon: 'store', text: 'tab 2' });
    tab_button.addButton({ icon: 'store', text: 'tab 3' });

    var radioButton1 = new RadioButton().setText("Radio 1").setGroupId(1).setPaddingTop(5).setPaddingBottom(5),
        radioButton2 = new RadioButton().setText("Radio 2").setGroupId(1).setPaddingTop(5).setPaddingBottom(5),
        radioButton3 = new RadioButton().setText("Radio 3").setGroupId(1).setPaddingTop(5).setPaddingBottom(5),
        radioButton4 = new RadioButton().setText("Radio 4").setGroupId(1).setPaddingTop(5).setPaddingBottom(5);

    var panel_radio = new LinearLayout("100%").setTop(10);
    panel_radio.setOrientation(app_constant.Orientation.VERTICAL);
    panel_radio
        .addView(radioButton1)
        .addView(radioButton2)
        .addView(radioButton3)
        .addView(radioButton4);



    var radioButton11 = new RadioButton().setText("Radio 11").setGroupId(2).setPaddingTop(5).setPaddingBottom(5),
        radioButton12 = new RadioButton().setText("Radio 12").setGroupId(2).setPaddingTop(5).setPaddingBottom(5),
        radioButton13 = new RadioButton().setText("Radio 13").setGroupId(2).setPaddingTop(5).setPaddingBottom(5),
        radioButton14 = new RadioButton().setText("Radio 14").setGroupId(2).setPaddingTop(5).setPaddingBottom(5);

    var panel_radio2 = new LinearLayout("100%").setTop(10);
    panel_radio2.setOrientation(app_constant.Orientation.VERTICAL);
    panel_radio2
        .addView(radioButton11)
        .addView(radioButton12)
        .addView(radioButton13)
        .addView(radioButton14);


    txt_value1.setOnKeyUp(function (view, keycode, e) {
        view.setError("error", keycode);
    })

    check_box.setOnCheckedChange(function (view, isChecked) {
        btn_slider.setStateEnable(isChecked)
    })
    btn_slider.setOnStateChanged(function (view, isEnable) {
        check_box.setChecked(isEnable);
    })

    combobox.setOnSelected(function (view, dataItem, position) {
        console.log(dataItem, position);
    })
    combobox.setSelectedIndex(0);

    btn1.setOnClick(() => {
        var dialog = new BaseDialog();
        dialog.setWidth("90%");
        dialog.setHeight("80%");
        dialog.show();
        var storyboard2 = new StoryLayout().toFillParent();
        storyboard2.setToolbarHeader("Dialog");
        generateNewList(storyboard2);
        dialog.addView(storyboard2);
    })
    container
        .addView(btn_slider)
        .addView(check_box)
        .addView(txt_value1)
        .addView(btn1)
        .addView(combobox)
        .addView(panel_radio)
        .addView(panel_radio2)
        .addView(tab_button);

    return container;
}



function generateNewList(storyBoard) {
    var listView = new ListView();
    listView.toFillParent();
    var adapter = new BaseAdapter(_app_list);
    adapter.setView(function (dataItem, position, convertView) {
        var txtView, imageView;
        if (convertView == null) {
            convertView = new LinearLayout("100%").setPadding(10);
            txtView = new TextView().setLeft(10);
            imageView = new ImageView();
            imageView.setRadius("50%");
            imageView.setWidth(64).setHeight(64);
            convertView
                .addView(imageView)
                .addView(txtView);
        } else {
            imageView = convertView.getViewAt(0);
            txtView = convertView.getViewAt(1);
        }

        if (position % 2 == 0) {
            convertView.setBackground("rgba(0,0,0,0)");
        } else {
            convertView.setBackground("rgba(0,0,0,0.05)");
        }
        imageView.setImage(dataItem.avatar);
        txtView.setText(dataItem.name);
        return convertView;
    });
    listView.setAdapter(adapter);

    listView.setOnItemClicked(function (view, dataItem, position) {
        storyBoard.newPage(dataItem.name);
        generateNewList(storyBoard);
    });
    storyBoard.addView(listView)
    return listView;
}

function pagerPage() {
    var list = new List(["1", "2", "3"]);

    var adapter = new BaseAdapter(list);
    adapter.setView((data, position, convertView) => {
        convertView = new FrameLayout().toFillParent();
        generateNewList(convertView)
        return convertView;
    })
    var pager = new PagerLayout().toFillParent();
    pager.setAdapter(adapter);
    return pager;
}