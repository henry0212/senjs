import { senjs } from "../../src/index.js";
import { BaseActivity } from "./base-activity.js";
import { Button } from "../custom-widgets/button.js";
import { TextView } from "../../src/io/widget/text-view.js";
import { my_context, static_view } from "../main-app.js";
import { FirstLoginDialog } from "../dialog/dialog-first-login.js";
import { ProductActivity } from "./activity-product.js";


var provider = new firebase.auth.GoogleAuthProvider();


export class LoginActivity extends BaseActivity {
    constructor() {
        super();
        this.toFillParent();
        this.setGravity(senjs.constant.Gravity.CENTER);

    }


    onCreated(self) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                my_context.mUser = user;
                this.moveToPage(new ProductActivity());
            } else {
                this.initView();
                this.initEvent();
            }
        });
    }

    initView() {
        this.views = {
            panel_container: new senjs.layout.LinearLayout()
                .setPadding("2em")
                .setOrientation(senjs.constant.Orientation.VERTICAL)
                .setGravity(senjs.constant.Gravity.CENTER)
                .setBackground("#fff")
                .setShadow("rgba(0,0,0,0.1)", 0, 0, 5)
                .setRadius(5),
            lb_main_message: new TextView()
                .setTextAlign(senjs.constant.TextAlign.CENTER),
            lb_pick_message: new TextView()
                .setTop("1em"),
            panel_signin_method: new senjs.layout.LinearLayout("")
                .setOrientation(senjs.constant.Orientation.HORIZONTAL)
                .setTop("1em"),
            btn_google: new senjs.widget.ImageView("../images/ic_google.png")
                .setWidth(48)
                .setHeight(48)
                .setCursor("pointer")
                .setRight("2em"),
            btn_facebook: new senjs.widget.ImageView("../images/ic_facebook.png")
                .setWidth(48)
                .setCursor("pointer")
                .setHeight(48)
        }

        this.views.lb_main_message.setText(my_context.strings.label_signin_mess);
        this.views.lb_pick_message.setText(my_context.strings.label_signin_type);

        this.views.panel_signin_method
            .addView(this.views.btn_google)
            .addView(this.views.btn_facebook);

        this.views.panel_container
            .addView(this.views.lb_main_message)
            .addView(this.views.lb_pick_message)
            .addView(this.views.panel_signin_method);

        this.addView(this.views.panel_container);
    }

    initEvent() {
        this.views.btn_google.setOnClick(this.onClicked.bind(this));
        this.views.btn_facebook.setOnClick(this.onClicked.bind(this));
    }

    onClicked(view) {
        switch (view) {
            case this.views.btn_google:
                this.signInWithGoogle()
                break;
            case this.views.btn_facebook:
                this.signInWithFacebook();
                break;
        }
    }

    signInWithGoogle() {
        firebase.auth().signInWithPopup(provider).then((result) => {
            var token = result.credential.accessToken;
            var user = result.user;
            my_context.mUser = result.user;
            this.openFirstTimeDialog();
        }).catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;
            console.error(error);
        });
    }

    signInWithFacebook() {

    }

    openFirstTimeDialog() {
        var dialog = new FirstLoginDialog();
        dialog.setOnConfirmed(() => {
            this.moveToPage(new ProductActivity());
        }).setOnCancelled(() => {

        }).show();

    }

    moveToPage(page) {
        static_view.main_frame.addView(page);
        this.destroy();
    }
}

