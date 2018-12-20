
import { View } from '../../core/view.js'
import { app_constant } from '../../res/constant.js'
import { senjsCts } from '../../core/app-context.js';


export class ImageView extends View {
    constructor(src) {
        super(document.createElement("div"));
        this._cache.imageSrc = src;
        this._meta = {
            scaleType: app_constant.ImageScale.AUTO
        }
        this._view = {
            pn_thum: null,
            view_image: null
        }
        this._view.view_image = new Image();
        this._view.view_image.src = src;
        this._view.pn_thum = new View(document.createElement("span"))
            .setOpacity(0)
            .toFillParent();


        this._listener = {
            onImageLoaded: null,
            onImageFailed: null
        }

        this.addView(this._view.pn_thum);
        this.setImage(this._cache.imageSrc);

        this._view.view_image.onload = () => {
            this.setScaleType(this._meta.scaleType);
        }

    }

    override_onResume() {
        // let delay = senjsCts.allParents(this.info.id).reduce((a, item) => {
        //     return a < item.getAnimationDuration() ? item.getAnimationDuration() : a;
        // }, 0);
        // if (delay > 0) {
        //     this.postDelay(() => {
        //         this.setImage(this._cache.imageSrc);
        //     }, delay + 50);
        // } else {
        //     this.setImage(this._cache.imageSrc);
        // }
        // this.setImage(this._cache.imageSrc);

    }

    setImage(src) {
        this._cache.imageSrc = src;
        if (src == null || src.length == 0) {
            this._view.pn_thum.setBackground("transparent");
            return;
        } else if (this._meta.scaleType != app_constant.ImageScale.AUTO) {
            this._view.pn_thum
                .setBackground("url('" + this._cache.imageSrc + "')")
                .setBackgroundPosition("center", "center")
                .setBackgroundRepeat(false)
                .setOpacity(1);
            this.setScaleType(this._meta.scaleType);
        } else {
            this._view.pn_thum
                .setBackground("url('" + this._cache.imageSrc + "')")
                .setBackgroundPosition("center", "center")
                .setBackgroundRepeat(false)
                .setOpacity(1)
            this.setScaleType(this._meta.scaleType);
        }
        return this;
    }

    getImage() {
        return this._cache.imageSrc;
    }

    setScaleType(scaleType) {
        this._meta.scaleType = scaleType;
        switch (scaleType) {
            case app_constant.ImageScale.AUTO:
                this._view.pn_thum.setTransition("opacity", ".2");
                this._view.pn_thum.setOpacity(1);

                var ratio_width_image = this._view.view_image.naturalWidth / this._view.view_image.naturalHeight;
                var ratio_height_image = this._view.view_image.naturalHeight / this._view.view_image.naturalWidth;

                var ratio_width = this.getWidth() / this.getHeight();
                var ratio_height = this.getHeight() / this.getWidth();

                var circuit_image = (this._view.view_image.offsetWidth + this._view.view_image.offsetHeight) * 2;
                var circuit_self = (this.getWidth() + this.getHeight()) * 2;

                // if (ratio_width_image > ratio_height_image && ratio_height > ratio_width) {
                //     this._view.pn_thum.setBackgroundSize("100%", "auto");
                // } else if (ratio_width_image > ratio_height_image) {
                //     this._view.pn_thum.setBackgroundSize("auto", "100%");
                // } else if (ratio_height_image > ratio_width_image && ratio_width <= ratio_height) {
                //     this._view.pn_thum.setBackgroundSize("100%", "auto");
                // } else if (ratio_height_image > ratio_width_image) {
                //     this._view.pn_thum.setBackgroundSize("100%", "auto");
                // }
                this._view.pn_thum._dom.style.backgroundSize = "contain";

                break;
            case app_constant.ImageScale.FILL_WIDTH:
                this._view.pn_thum.setBackgroundSize("100%", "auto");
                break;
            case app_constant.ImageScale.FILL_HEIGHT:
                this._view.pn_thum.setBackgroundSize("auto", "100%");
                break;
            case app_constant.ImageScale.FILL_BOTH:
                this._view.pn_thum.setBackgroundSize("100%", "100%");
                break
            case app_constant.ImageScale.COVER:
                this._view.pn_thum._dom.style.backgroundSize = "cover";
                break;
        }
        return this;
    }
}