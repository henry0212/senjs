import { senjs } from "../src/index.js";
import { lang_en, array_en } from "./resources/lang-en.js";
import { LoginActivity } from "./activities/activity-login.js";
import { ProductActivity } from "./activities/activity-product.js";
import { SaleActivity } from "./activities/activity-sale.js";
import { Button } from "../src/io/widget/button.js";



var firebase_config = {
    apiKey: "AIzaSyALcClSZQiAt6KiDD0rqOGB9jf30V5T1aM",
    authDomain: "senpos-220706.firebaseapp.com",
    databaseURL: "https://senpos-220706.firebaseio.com",
    projectId: "senpos-220706",
    storageBucket: "senpos-220706.appspot.com",
    messagingSenderId: "386131387515"
};
firebase.initializeApp(firebase_config);

export const my_context = {
    strings: lang_en,
    arrays: array_en,
    mUser: null
};

export const static_view = {
    main_frame: null,
    pageOpening: null,
}

senjs.app.onStart(mainFrame => {
    static_view.main_frame = mainFrame;
    // var loginPage = new LoginActivity();
    // var productPage = new ProductActivity();
    // var sale_page = static_view.pageOpening = new SaleActivity();
    // static_view.main_frame.addView(sale_page);
    initMenu();
    initRouter();
});

function initRouter() {
    senjs.util
        .RouterUtil
        .register(["", "/", "/activity/sale"], (params) => {
            if (static_view.pageOpening) {
                static_view.pageOpening.destroy();
            }
            var sale_page = static_view.pageOpening = new SaleActivity();
            static_view.main_frame.addView(sale_page);
            console.log(params);
        })
        .register("/activity/product", (params) => {
            if (static_view.pageOpening) {
                static_view.pageOpening.destroy();
            }
            var productPage = static_view.pageOpening = new ProductActivity();
            static_view.main_frame.addView(productPage);
        });
}

function switchView() {

}

function initMenu() {
    var btn_menu = new senjs.widget.FloatingButton("dashboard").setAbsoluteZIndex(1000).setTransitionAll('.2');
    btn_menu.toBottomParent().toLeftParent().setLeft(10).setBottom(10).setBackgroundColor(senjs.res.material_colors.Blue.g500);
    static_view.main_frame.addView(btn_menu);
    btn_menu.setOnClick(view => {
        var stickyMenu = new senjs.layout.StickyLayout(view).setWidth("15%").setPadding(10);
        var btn_sale_page = new Button("Sale").setWidth("100%").setPadding(10);
        var btn_product_page = new Button("Product Management").setWidth("100%").setPadding(10);
        stickyMenu
            .addView(btn_sale_page)
            .addView(btn_product_page);
        stickyMenu.show();
        btn_sale_page.setOnClick(view => {
            if (static_view.pageOpening) {
                static_view.pageOpening.destroy();
            }
            static_view.pageOpening = new SaleActivity();
            static_view.main_frame.addView(static_view.pageOpening);
            stickyMenu.destroy();
        });
        btn_product_page.setOnClick(view => {
            if (static_view.pageOpening) {
                static_view.pageOpening.destroy();
            }
            static_view.pageOpening = new ProductActivity();
            static_view.main_frame.addView(static_view.pageOpening);
            stickyMenu.destroy();
        });
        // btn_product_page.setOnClick(view => {
        //     var sticky = new senjs.dialog.BaseDialog();
        //     sticky.setWidth("70%").setHeight("90%");
        //     sticky.show();
        //     sticky.addView(new ProductActivity());
        //     stickyMenu.destroy();
        // })


    })
}
