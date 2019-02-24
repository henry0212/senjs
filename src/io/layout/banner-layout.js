import { senjs } from "../../index.js";
import { FrameLayout } from "./frame-layout.js";
import { senjsCts } from "../../core/app-context.js";



export class BannerLayout extends FrameLayout {
    constructor(width, height) {
        super(width, height);
        this._views = {
            imv_banner: new senjs.widget.ImageView()
                .setMinWidth("100%")
                .setAbsoluteZIndex(1)
                .setScaleType(senjs.constant.ImageScale.COVER)
                .toTopParent().toBottomParent(),
            root: new senjs.layout.FrameLayout().toFillParent()
                .setScrollType(senjs.constant.ScrollType.VERTICAL)
                .setRight(-10)
                .setAbsoluteZIndex(5),
            wrapper_banner: new senjs.layout.FrameLayout()
                .toTopParent().toLeftParent()
                .setAbsoluteZIndex(2),
            wrapper_toolbar: new senjs.layout.FrameLayout("100%")
                .setBackground("#fff")
                .setOpacity(1)
                .setShadow("rgba(0,0,0,0.2)", 0, 0, 3)
                .setTransition("opacity", ".1"),
            wrapper_content: new senjs.layout.FrameLayout("auto", "100%")
                .setBackground(senjs.res.material_colors.White)
                .toLeftParent()
                .setScrollType(senjs.constant.ScrollType.VERTICAL)
                .setClassName('force_prevent_scroll')
        }
        this.setBackground(senjs.res.material_colors.Grey.g100);

        this._views.root._dom.style.overflowY = "scroll";
        var hasPreventScroll = true;

        this._views.root.events.override.onMeasured((view, width, height) => {
            console.log(this._views.root._dom.offsetWidth, this._views.root._dom.clientWidth);
            var m_right = this._views.root._dom.offsetWidth - this._views.root._dom.clientWidth + 10;
            this._views.root.setRight(-m_right);
            this._views.wrapper_toolbar.setRight(10);
            this._views.wrapper_banner.setRight(10);
            this._views.wrapper_content.setRight(10);

        });
        this._views.wrapper_banner.events.override.onMeasured((view, width, height) => {
            this._views.wrapper_content.setTop(height);
            this._views.wrapper_toolbar.setTop(height + this._views.wrapper_toolbar.getHeight() * 4);
            // this._views.wrapper_toolbar.setTop(height);
            var h_percent = 100 - this._views.wrapper_toolbar.getHeight() * 100 / this._views.wrapper_content.getHeight();
            this._views.wrapper_content.setHeight(this._dom.offsetHeight - this._views.wrapper_toolbar.getHeight());
            this._views.imv_banner.setMinHeight(height);
        });

        this._views.root.events.override.onScrolled((view, arg) => {
            var trans = arg.scrollY * 0.2;
            var percent = view._dom.scrollHeight - view._dom.offsetHeight;
            var banner_translate = (arg.scroll_y * (150) / percent) * this._views.wrapper_toolbar.getHeight() / 100;
            percent = arg.scroll_y * (500) / percent;

            this._views.imv_banner.setTranslateY(trans > 0 ? -trans : 0);
            this._views.wrapper_toolbar.setTranslatePercentY(-percent)
            this._views.wrapper_banner.setTranslateY(banner_translate);
            if (view.getHeight() + arg.scrollY >= view._dom.scrollHeight - 1) {
                this._views.wrapper_toolbar.setTranslatePercentY(-500);

            } else {
            }
            if (view.getHeight() + arg.scrollY >= view._dom.scrollHeight && hasPreventScroll) {
                hasPreventScroll = false;
                senjsCts.allRootChilds(this._views.root.info.id).filter(child => {
                    return child.info.ScrollType != senjs.constant.ScrollType.NONE;
                }).foreach(item => {
                    item.removeClassName("force_prevent_scroll")
                });
                this._views.wrapper_content.removeClassName('force_prevent_scroll');

            } else if (!hasPreventScroll && view.getHeight() + arg.scrollY < view._dom.scrollHeight) {
                hasPreventScroll = true;
                senjsCts.allRootChilds(this._views.root.info.id).filter(child => {
                    return child.info.ScrollType != senjs.constant.ScrollType.NONE;
                }).foreach(item => {
                    item.setClassName("force_prevent_scroll")
                });
                this._views.wrapper_content.setClassName('force_prevent_scroll');
            }
        });

        var onAddView = (view, child) => {
            if (hasPreventScroll) {
                child.setClassName("force_prevent_scroll");
            }
            child.events.override.onAddView(onAddView);
        }

        this._views.root.events.override.onAddView(onAddView)


        this._views.root
            .addView(this._views.wrapper_banner)
            .addView(this._views.wrapper_toolbar)
            .addView(this._views.wrapper_content);

        super.addView(this._views.root);
        super.addView(this._views.imv_banner)
        // this._views.root.setScrollType(senjs.constant.ScrollType.VERTICAL);

    }

    addViewToBanner(view) {
        this._views.wrapper_banner.addView(view);
        return this;
    }

    addViewToContent(view) {
        this._views.wrapper_content.addView(view);
        return this;
    }

    addViewToToolbar(view) {
        this._views.wrapper_toolbar.addView(view);
        return this;
    }

    setBannerImage(src) {
        this._views.imv_banner.setImage(src);
        return this;
    }

    setBannerImageBlur(px) {
        var margin = Math.floor(-px * 1.5);
        this._views.imv_banner
            .setLeft(margin)
            .setRight(margin)
            .setTop(margin)
            .setBottom(margin)
            .filterBlur(px);
        return this;
    }

    getToobarView() {
        return this._views.wrapper_toolbar;
    }

    getContentView() {
        return this._views.wrapper_content;
    }

    addView() {
        throw new Error("Cannot addView to here, use addViewToBanner(view) or addViewToContent(view) instead");
    }

    addViewToRoot(view) {
        super.addView(view);
        return this;
    }

}