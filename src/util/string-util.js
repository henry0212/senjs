
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

export class StringUtil {


    static highLightText(text, key, highLightColor, textColor) {
        var temp = removeVietnameseCharacter(text);
        key = removeVietnameseCharacter(key);
        var start = temp.indexOf(key);
        if (start == -1) {
            if (key.indexOf("y") != -1) {
                key = key.replace("y", "i");
                start = temp.indexOf(key);
            }
            else if (key.indexOf("i") != -1) {
                key = key.replace("i", "y");
                start = temp.indexOf(key);
            }
        }
        var key2 = text.substring(start, key.length + start);
        return text.replace(key2, "" + key2 + "");
    }

    static randomString(len, charSet) {
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var randomString = '';
        for (var i = 0;
            i < len;
            i++) {
            var randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }
        return randomString;
    }

    static replaceAll(find, replace, str) {
        return str.replace(new RegExp(find, 'g'), replace);
    }

    static removeVietnameseCharacter(str) {
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        return str;
    }

    static keyCodeToChar(keyCode) {
        console.log(keyCode);
        var chars = "0123456789";
        if (keyCode >= 48 && keyCode <= 57) {
            return chars.charAt(keyCode - 48);
        }
        else if (keyCode >= 65 && keyCode <= 90) {
            var chars = "abcdefghijklmnopqrstuvwxyz";
            return chars.charAt(keyCode - 65);
        }
        else {
            return "";
        }
    }

    static uint8ToString(buf) {
        var i, length, out = '';
        for (i = 0, length = buf.length;
            i < length;
            i += 1) {
            out += String.fromCharCode(buf[i]);
        }
        return out;
    }

}