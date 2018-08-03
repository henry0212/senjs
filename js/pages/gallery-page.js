import { senjs } from "../../src/index.js";
import { Waiter } from "../../src/core/app-context.js";

const array_avatar = [
    "https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/207171/pexels-photo-207171.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/259915/pexels-photo-259915.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/531880/pexels-photo-531880.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/1020315/pexels-photo-1020315.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/719609/pexels-photo-719609.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/810036/pexels-photo-810036.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/956999/milky-way-starry-sky-night-sky-star-956999.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/33707/flowers-meadow-wood-forest.jpg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/747964/pexels-photo-747964.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/262713/pexels-photo-262713.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/808465/pexels-photo-808465.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/707915/pexels-photo-707915.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/733036/pexels-photo-733036.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/733174/pexels-photo-733174.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/354939/pexels-photo-354939.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/693776/pexels-photo-693776.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/754898/pexels-photo-754898.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/414667/pexels-photo-414667.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/207188/pexels-photo-207188.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/459301/pexels-photo-459301.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/805448/pexels-photo-805448.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350",
    "https://images.pexels.com/photos/552766/pexels-photo-552766.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350"
]

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive';

function initClient() {

    gapi.client.init({
        apiKey: "AIzaSyAb82hh-7INW8Svl3zGcA32KzdWyWpne10",
        clientId: "835880225064-trbqa1ltv5nmrj8o63senjsk8f4r69tg0ef.apps.googleusercontent.com",
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        // gapi.auth2.getAuthInstance().signIn();

    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        listFiles();
    } else {
        gapi.auth2.getAuthInstance().signIn();
    }
}


function listFiles() {
    // gapi.client.drive.files.list({
    //     'pageSize': 10,
    //     'fields': "nextPageToken, files(*)"
    // }).then(function (response) {
    //     var files = response.result.files;
    //     if (files && files.length > 0) {
    //         for (var i = 0; i < files.length; i++) {
    //             var file = files[i];
    //             console.log(file);
    //         }
    //     } else {

    //     }
    // });
    findFolder();
}

var folder_id;

function findFolder() {
    gapi.client.drive.files.list({
        'q': "name='myDemo'",
        'fields': "nextPageToken, files(id,name)"
    }).then(function (response) {
        var files = response.result.files;
        if (files.length == 0) {
            newFolder();
        } else {
            folder_id = files[0].id;
            console.log("folder_id", folder_id);
        }

    });
}

function newFolder() {
    var body = {
        'name': "myDemo",
        'mimeType': "application/vnd.google-apps.folder"
    };

    var request = gapi.client.drive.files.create({
        'resource': body
    }).then(resp => {
        console.log('Folder ID: ' + resp.id);
    });

}


function uploadImage(src) {
    console.log(src);
    var fileMetadata = {
        'name': new Date().getTime() + '.png',
        'parents': [folder_id],
    };
    var media = {
        mimeType: 'image/png',
        body: src
    };
    var request = gapi.client.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: '*'
    });
    request.execute(function (resp) { console.log(resp); });
}


export class GalleryPage extends senjs.layout.FrameLayout {

    constructor() {
        super();
        // gapi.load('client:auth2', initClient);
        this._adapter = {
            adapter_gallery: null
        }

        this._view = {
            lsv_gallery: null,
            btn_capture: null,
            btn_gallery: null
        }

        this.toFillParent();

        this.initControl();
        this.initData();
        this.initEvent();
    }

    initControl() {
        this._view.lsv_gallery = new senjs.widget.ListView().toFillParent().setPaddingBottom(60);
        this._view.btn_capture = new senjs.widget.FloatingButton("photo_camera")
            .toBottomParent().toRightParent()
            .setBottom(10).setRight(10)
            .setBackground("#fff")
            .setIconColor(senjs.res.material_colors.Blue.g500);

        this._view.btn_gallery = new senjs.widget.FloatingButton("photo_library")
            .toBottomParent().toLeftOf(this._view.btn_capture)
            .setBottom(10).setRight(10)
            .setBackground("#fff")
            .setIconColor(senjs.res.material_colors.Blue.g500);


        this.addView(this._view.lsv_gallery)
            .addView(this._view.btn_capture)
            .addView(this._view.btn_gallery)
    }

    initData() {
        this._meta.list_image = new senjs.util.List();
        for (var i = 0; i < 500; i++) {
            this._meta.list_image.add(array_avatar[senjs.util.NumberUtil.randomNumber(0, array_avatar.length - 1)]);
        }
        this._adapter.adapter_gallery = new senjs.adapter.BaseAdapter(this._meta.list_image);
        this._adapter.adapter_gallery.setColumn(3);
        this._adapter.adapter_gallery.setView(getGalleryView.bind(this));
        this._view.lsv_gallery.setAdapter(this._adapter.adapter_gallery);
    }
    initEvent() {
        this._view.btn_capture.setOnClick(async () => {
            senjs.lib.FilePicker.onFilePicked({
                accept: 'image/*',
                capture: 'camera'
            }).then(file => {
                if (file) {
                    senjs.app.showLoading();
                    return senjs.lib.FilePicker.singleFileToBase64(file);
                }
            }).then(base64 => {
                new ImageEditor(base64).setOnImageSaved(newBase64 => {
                    this._meta.list_image.addAt(newBase64, 0);
                    this._adapter.adapter_gallery.notifyDataSetChanged();
                }).show();
                senjs.app.hideLoading();
            });
        });

        this._view.btn_gallery.setOnClick(async () => {
            senjs.lib.FilePicker.onMultifilePicked({
                accept: 'image/*'
            }).then(file => {
                if (file) {
                    senjs.app.showLoading();
                    return senjs.lib.FilePicker.multiFileToBase64(file);
                }
            }).then(list_base64 => {
                while (list_base64.length > 0) {
                    this._meta.list_image.addAt(list_base64.shift(), 0);
                }
                this._adapter.adapter_gallery.notifyDataSetChanged();
                senjs.app.hideLoading();
            });
        });
        this._view.lsv_gallery.setOnItemClicked(this.onImageItemClicked.bind(this));

        this._view.lsv_gallery.setOnItemLongClicked((view, dataItem,position) =>{
            console.log("loadingClick");
            view.setScale(0.8);
        });
        this._vi
    }

    onImageItemClicked(view, dataItem, position) {
        new ImageEditor(dataItem).setOnImageSaved((newImage) => {
            this._adapter.adapter_gallery.getList().set(position, newImage);
            this._adapter.adapter_gallery.notifyDataSetChangedAt(position);
        }).show();
    }
}

function getGalleryView(dataItem, position, convertView) {
    if (convertView == null) {
        convertView = new senjs.widget.ImageView()
            .setScaleType(senjs.constant.ImageScale.COVER)
            .setWidth(window.innerWidth / 3)
            .setHeight(window.innerWidth / 3);
        convertView.setBorder(1, "#fff");
    }
    convertView.setImage(dataItem);
    return convertView;
}


/***--------------- Image editor dialog ---------------------*/

class ImageEditor extends senjs.dialog.BaseDialog {
    constructor(imageSrc) {
        super();
        this._instance = {
            imageRefactor: new senjs.lib.ImageRefactor(imageSrc)
        }

        this._listener = {
            onImageSaved: null
        }

        this._meta.rotate_degree = 0;

        this._view = {
            imageView: new senjs.widget.ImageView(imageSrc).toFillParent().setBottom(60).setTop(60),

            btn_rotate_right: new senjs.widget.IconView("rotate_right").setRadiusAt(0, 40, 0, 40)
                .setBackground("#fff").setWidth(60).setTextGravity(senjs.constant.Gravity.CENTER)
                .setPadding(8).setIconColor(senjs.res.material_colors.Grey.g800).setIconSize(senjs.res.dimen.icon.s24),

            btn_rotate_left: new senjs.widget.IconView("rotate_left").setRadiusAt(40, 0, 40, 0)
                .setBackground("#fff").setRight(1).setWidth(60).setTextGravity(senjs.constant.Gravity.CENTER)
                .setPadding(8).setIconColor(senjs.res.material_colors.Grey.g800).setIconSize(senjs.res.dimen.icon.s24),

            btn_save: new senjs.widget.IconView("save")
                .setPadding(10).setIconColor("#fff").setIconSize(senjs.res.dimen.icon.s24).toTopParent().toRightParent(),

            btn_back: new senjs.widget.IconView("arrow_back_ios")
                .setPadding(10).setIconColor("#fff").setIconSize(senjs.res.dimen.icon.s24).toTopParent().toLeftParent(),

        }
        this.setHeight("100%").setWidth("100%").setBackground(senjs.res.material_colors.Grey.g900);
        this._meta.imageSrc = imageSrc;

        var linear_action = new senjs.layout.LinearLayout("100%")
            .setBottom(10)
            .setGravity(senjs.constant.Gravity.TOP_CENTER).toBottomParent();

        linear_action
            .addView(this._view.btn_rotate_left)
            .addView(this._view.btn_rotate_right);


        this.addView(this._view.imageView)
            .addView(linear_action)
            .addView(this._view.btn_save)
            .addView(this._view.btn_back);

        this.initEvent();
    }

    initEvent() {
        this._view.btn_rotate_left.setOnClick(this.onClicked.bind(this));
        this._view.btn_rotate_right.setOnClick(this.onClicked.bind(this));
        this._view.btn_save.setOnClick(this.onClicked.bind(this));
        this._view.btn_back.setOnClick(this.onClicked.bind(this));
    }

    onClicked(view) {
        switch (view) {
            case this._view.btn_rotate_right:
                this._instance.imageRefactor.rotate(this._meta.rotate_degree += 90)
                this._view.imageView.setRotate(this._meta.rotate_degree);
                break;
            case this._view.btn_rotate_left:
                this._instance.imageRefactor.rotate(this._meta.rotate_degree -= 90)
                this._view.imageView.setRotate(this._meta.rotate_degree);
                break;
            case this._view.btn_save:
                senjs.app.showLoading();
                view.postDelay(() => {
                    if (this._listener.onImageSaved) {
                        this._listener.onImageSaved(this._instance.imageRefactor.toBase64(20));
                    }
                    this.dismiss();
                    senjs.app.hideLoading();
                }, 200);
                break;
            case this._view.btn_back:
                this.dismiss();
                break;
        }
    }

    override_onDestroy() {
        this._instance.imageRefactor.close();
    }

    setOnImageSaved(cb) {
        this._listener.onImageSaved = cb;
        return this;
    }
}