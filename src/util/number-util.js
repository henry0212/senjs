

export class NumberUtil {


    static randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    static formatNumber(number) {
        var self = Number(number).toFixed(2);
        if (self.indexOf(".00") != -1) {
            return parseFloat(self.replace(".00", ""));
        }
        return parseFloat(self);
    }

    static fixedNumber(value, fractionDigits) {
        if (value - parseInt(value) == 0) {
            return value;
        }
        else {
            value = value.toFixed(fractionDigits);
            var val2 = value.toString();
            while (val2.charAt(val2.length - 1) == "0") {
                val2 = val2.substr(0, val2.length - 2);
            }
            return parseFloat(val2);
        }
    }

}