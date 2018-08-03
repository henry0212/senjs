
import { app } from '../core/app-context.js'

export class ScreenUtil {
    static convertScreenSize(value) {
        return value;
    }

    static launchIntoFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    static caculateWidthSize(ratio) {
        return Math.floor(app.info.display.SCREEN_WIDTH * ratio / 100);
    }

    static calculateHeightSize(ratio) {
        return Math.floor(ratio * app.info.display.SCREEN_HEIGHT / 100);
    }
}