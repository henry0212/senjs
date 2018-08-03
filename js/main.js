import { dh } from '../src/index.js'
import { View } from '../src/core/view.js';
import { MapPage } from './pages/map-page.js';
import { GalleryPage } from './pages/gallery-page.js';

const list_menu = new dh.util.List(["Widget", "Dialog", "Sample Google Map", "Sample Gallery"]);

var ia_context = {
    mainPage: null,
    frame_dashboard: null,
    main_story_layout: null,
    left_menu_layout: null
}

dh.app.onStart((mainPage) => {
    ia_context.mainPage = mainPage;
    mainPage
        .addView(initMainPage())
        .addView(ia_context.left_menu_layout = initLeftMenu())
})


function registerNewPage(title) {
    return ia_context.main_story_layout.newPage(title);
}


function registerNewInstance(title) {
    return ia_context.main_story_layout.newInstance(title);
}

function setToobarTitle(title) {
    return ia_context.main_story_layout.setToolbarHeader(title);
}



function initMainPage() {
    ia_context.main_story_layout = new dh.layout.StoryLayout().toFillParent();
    ia_context.main_story_layout.setToolbarHeader("Dh Framework");
    ia_context.frame_dashboard = ia_context.main_story_layout.getPageOpening();
    ia_context.main_story_layout.setToolbarLeftIcon("dashboard");

    ia_context.main_story_layout.setOnToolbarLeftIconClicked((view, currentPage) => {
        if (currentPage == 0) {
            console.log("clicked");
            ia_context.left_menu_layout.openPage();
            return true;
        }
        return false;
    })

    return ia_context.main_story_layout;
}


function initLeftMenu() {
    var drawerLeftMenu = new dh.layout.DrawerLayout("70%", "100%");
    drawerLeftMenu.setDirection(dh.constant.Direction.LEFT);

    var listView = new dh.widget.ListView().toFillParent();
    var adapter_menu = new dh.adapter.BaseAdapter(list_menu);
    adapter_menu.setView(function (dataItem, position, convertView) {
        return new dh.widget.TextView().setText(dataItem).setLeft("10%").setPadding(10);
    })

    listView.setAdapter(adapter_menu);
    drawerLeftMenu.addView(listView);

    listView.setOnItemClicked((view, dataItem, position) => {
        var page;
        drawerLeftMenu.closePage();
        console.log(position);
        switch (position) {
            case 2:
                page = new MapPage();
                break;
            case 3:
                page = new GalleryPage();
                break;
        }
        if (page) {
            ia_context.frame_dashboard.removeAllView();
            ia_context.frame_dashboard.addView(page);
        }
    });

    return drawerLeftMenu;
}


export default {
    registerNewPage,
    setToobarTitle,
    registerNewInstance
}