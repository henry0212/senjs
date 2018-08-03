export class AnimationUtil {


    static changeTextAnimation(textview, text) {
        if (textview.changeTextAnimationTimeout != null) {
            textview.changeTextAnimationTimeout.remove();
        }
        textview.setAnimation("launchPadHide");
        textview.changeTextAnimationTimeout = dh.Waiter.create(function () {
            textview.setText(text);
            textview.setAnimation(dhKey.anims.OPEN_WINDOW);
            textview.changeTextAnimationTimeout = null;
        }, 300);
    }

    static changeTextwithCustomAnimation(textview, text, anim) {
        if (textview.changeTextAnimationTimeout != null) {
            textview.changeTextAnimationTimeout.remove();
        }
        textview.setAnimation("");
        textview.setText(text);
        dh.Waiter.create(function () {
            textview.setAnimation(anim);
            textview.changeTextAnimationTimeout = dh.Waiter.create(function () {
                textview.changeTextAnimationTimeout = null;
            }, 300);
        }, 20);
    }

    static setRefreshAnimation(control, hideAnim, showAnim) {
        if (control.refreshTimeout != null) {
            control.refreshTimeout.remove();
        }
        control.setAnimation(hideAnim);
        control.refreshTimeout = dh.Waiter.create(function () {
            control.setAnimation(showAnim);
            control.refreshTimeout = null;
            dh.Waiter.create(function () {
                control.setAnimation("");
            }, 600);
        }, 400);
    }

    static addLongClickAnim(control, e) {
        animationUtil.addLongClickAnim(control, e);
    }


    static addClickAnim(control, e) {
        animationUtil.addClickAnim(control, e);
    }


    static blink_shadowAnimation(control) {
        animationUtil.blink_shadowAnimation(control);
    }
   
}