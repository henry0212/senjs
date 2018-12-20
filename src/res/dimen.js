import { app, isMobile } from "../core/app-context.js"
import { ScreenUtil } from '../util/screen-util.js'

export const app_size = {
    font: {
        x_tiny: 0,
        tiny: 0,
        smaller: 0,
        small: 0,
        normal: 0,
        large: 0,
        larger: 0,
        extreme: 0,
        x_extreme: 0
    },
    icon: {
        x_tiny: 0,
        tiny: 0,
        smaller: 0,
        small: 0,
        normal: 0,
        large: 0,
        larger: 0,
        extreme: 0,
        x_extreme: 0,
        big: 0,
        x2: 0,
        x3: 0,
        x4: 0,
        x5: 0,
        x6: 0,
        x7: 0,
        x8: 0,
        x9: 0,
        s24: 24,
        s32: 32,
        s48: 48,
        s56: 56,
        s64: 64
    },
    init: init
}


function init() {
    document.body.style.fontSize = isMobile.any() ? "5pt" : "11pt";
    var ratio_size = (isMobile.any() || app.info.display.SCREEN_WIDTH < app.info.display.SCREEN_HEIGHT) ? 3 : 1.8;


    app_size.font.normal = "100%";
    app_size.font.x_tiny = "40%";
    app_size.font.tiny = "50%";
    app_size.font.smaller = "60%";
    app_size.font.small = "85%";
    app_size.font.large = "120%";
    app_size.font.larger = "140%";
    app_size.font.extreme = "160%";
    app_size.font.x_extreme = "180%";


    app_size.icon.normal = "120%";
    app_size.icon.x_tiny = "60%";
    app_size.icon.tiny = "70%";
    app_size.icon.smaller = "95%";
    app_size.icon.small = "110%";
    app_size.icon.large = "140%";
    app_size.icon.larger = "160%";
    app_size.icon.extreme = "180%";
    app_size.icon.x_extreme = "200%";

    app_size.icon.big = "150%";
    app_size.icon.x2 = "200%";
    app_size.icon.x3 = "300%";
    app_size.icon.x4 = "400%";
    app_size.icon.x5 = "500%";
    app_size.icon.x6 = "600%";
    app_size.icon.x7 = "700%";
    app_size.icon.x8 = "800%";
    app_size.icon.x9 = "900%";
}

// function init() {
//     var ratio_size = (isMobile.any() || app.info.display.SCREEN_WIDTH < app.info.display.SCREEN_HEIGHT) ? 3: 1.8;

//     app_size.font.normal = Math.round(((app.info.display.SCREEN_WIDTH + app.info.display.SCREEN_HEIGHT) / 2 * ratio_size) / 100);
//     app_size.font.x_tiny = app_size.font.normal - 8;
//     app_size.font.tiny = app_size.font.normal - 6;
//     app_size.font.smaller = app_size.font.normal - 4;
//     app_size.font.small = app_size.font.normal - 2;
//     app_size.font.large = app_size.font.normal + 2;
//     app_size.font.larger = app_size.font.normal + 4;
//     app_size.font.extreme = app_size.font.normal + 6;
//     app_size.font.x_extreme = app_size.font.normal + 8;


//     app_size.icon.normal =   app_size.font.normal + 4;
//     app_size.icon.x_tiny = app_size.icon.normal - 6;
//     app_size.icon.tiny = app_size.icon.normal - 4;
//     app_size.icon.smaller = app_size.icon.normal - 2;
//     app_size.icon.small = app_size.icon.normal - 1;
//     app_size.icon.large = app_size.icon.normal + 2;
//     app_size.icon.larger = app_size.icon.normal + 4;
//     app_size.icon.extreme = app_size.icon.normal + 6;
//     app_size.icon.x_extreme = app_size.icon.normal + 8;

//     app_size.icon.big = app_size.icon.normal * 1.5;
//     app_size.icon.x2 = app_size.icon.normal * 2;
//     app_size.icon.x3 = app_size.icon.normal * 3;
//     app_size.icon.x4 = app_size.icon.normal * 4;
//     app_size.icon.x5 = app_size.icon.normal * 5;
//     app_size.icon.x6 = app_size.icon.normal * 6;
//     app_size.icon.x7 = app_size.icon.normal * 7;
//     app_size.icon.x8 = app_size.icon.normal * 8;
//     app_size.icon.x9 = app_size.icon.normal * 9;
// }
