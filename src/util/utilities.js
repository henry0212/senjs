

export class Utilities {
    constructor() {

    }

    static colorWithLuminance(color, luminosity) {
        if (color == undefined) {
            return dhStyleValue.colors.white;
        }
        else if (color.indexOf('rgb') != -1) {
            return color;
        }
        else if (color.length == 0) {
            return "transparent";
        }
        try {
            color = color.replace("#", '');
            // validate hex string color = new String(color).replace(/[^0-9a-f]/gi, '');
            if (color.length < 6) {
                color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
            }
            luminosity = luminosity || 0;
            // convert to decimal and change luminosity var newColor = "#", c, i, black = 0, white = 255;
            for (i = 0;
                i < 3;
                i++) {
                c = parseInt(color.substr(i * 2, 2), 16);
                c = Math.round(Math.min(Math.max(black, c + (luminosity * white)), white)).toString(16);
                newColor += ("00" + c).substr(c.length);
            }
            return newColor;
        }
        catch (ex) {
            return color;
        }
    }


    static oppositeTextColor(control, backgroundColor) {
        control.TextColor(dh.Util.getBrightness(backgroundColor) < 150 ? dhStyleValue.colors.white : "#000");
    }


    

    static isDarkColor(color) {
        if (color == null || color == "") {
            return false;
        }
        var c = color.substring(1);
        var rgb = parseInt(c, 16);
        var r = (rgb >> 16) & 0xff;
        var g = (rgb >> 8) & 0xff;
        var b = (rgb >> 0) & 0xff;
        var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luma < 40 ? true : false;
    }


    static invertColor(hexTripletColor) {
        var color = hexTripletColor;
        color = color.substring(1);
        color = parseInt(color, 16);
        color = 0xFFFFFF ^ color;
        color = color.toString(16);
        color = ("000000" + color).slice(-6);
        color = "#" + color;
        return color;
    }


    static decimalToHex(decimal) {
        var hex = decimal.toString(16);
        if (hex.length == 1) hex = '0' + hex;
        return hex;
    }


    static hexToRgbA(hex, alpha) {
        var c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ' )';
        }
        throw new Error('Bad Hex');
    }


    static hexToDecimal(hex) {
        hex = hex.replace("#", "");
        return parseInt(hex, 16);
    }


    static randomHexColor() {
        return Math.floor(Math.random() * 16777215).toString(16);
    }


    static getAutoBrightnessTextColor(color) {
        var lumi = dh.Util.getBrightness(color);
        var bright = 0;
        if (lumi <= 8) {
            bright = 1;
        }
        else if (lumi <= 15 && lumi > 8) {
            bright = 0.9;
        }
        else if (lumi <= 35 && lumi > 15) {
            bright = 0.8;
        }
        else if (lumi <= 66 && lumi > 35) {
            bright = 0.7;
        }
        else if (lumi <= 97 && lumi > 66) {
            bright = 0.6;
        }
        else if (lumi <= 128 && lumi > 97) {
            bright = 0.5;
        }
        else if (lumi > 128 && lumi < 149) {
            bright = -0.35;
        }
        else if (lumi >= 149 && lumi < 180) {
            bright = -0.4;
        }
        else if (lumi >= 180 && lumi < 211) {
            bright = -0.5;
        }
        else if (lumi >= 211 && lumi < 242) {
            bright = -0.6;
        }
        else if (lumi >= 242 && lumi < 250) {
            bright = -0.7;
        }
        else {
            bright = -0.8;
        }
        var textColor = dh.Util.colorWithLuminance(color, bright);
        return textColor;
    }


    static getAutoBrightnessBorderColor(color) {
        var lumi = dh.Util.getBrightness(color);
        var bright = 0;
        if (lumi <= 8) {
            bright = 0.45;
        }
        else if (lumi <= 15 && lumi > 8) {
            bright = 0.35;
        }
        else if (lumi <= 35 && lumi > 15) {
            bright = 0.3;
        }
        else if (lumi <= 66 && lumi > 35) {
            bright = 0.25;
        }
        else if (lumi <= 97 && lumi > 66) {
            bright = 0.2;
        }
        else if (lumi <= 128 && lumi > 97) {
            bright = 0.25;
        }
        else if (lumi > 128 && lumi < 149) {
            bright = -0.2;
        }
        else if (lumi >= 149 && lumi < 180) {
            bright = -0.25;
        }
        else if (lumi >= 180 && lumi < 211) {
            bright = -0.3;
        }
        else if (lumi >= 211 && lumi < 242) {
            bright = -0.35;
        }
        else if (lumi >= 242 && lumi < 250) {
            bright = -0.4;
        }
        else {
            bright = -0.45;
        }
        var textColor = dh.Util.colorWithLuminance(color, bright);
        return textColor;
    }


    static oppositeColor(colour) {
        colour = colour.replace("#", "");
        return "#" + dh.Util.decimalToHex(255 - dh.Util.hexToDecimal(colour.substr(0, 2))) + dh.Util.decimalToHex(255 - dh.Util.hexToDecimal(colour.substr(2, 2))) + dh.Util.decimalToHex(255 - dh.Util.hexToDecimal(colour.substr(4, 2)));
    }


    static getBrightness(color) {
        if (color == null || color == "") {
            return 255;
        }
        var c = color.substring(1);
        var rgb = parseInt(c, 16);
        var r = (rgb >> 16) & 0xff;
        var g = (rgb >> 8) & 0xff;
        var b = (rgb >> 0) & 0xff;
        var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luma;
    }
}