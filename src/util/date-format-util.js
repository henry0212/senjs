const _MONTH_FULL = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
]

const _DAY_WEEK_FULL = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

export class DateFormatUtil {

    static millisecondToString(millisecond, pattern) {
        var d = new Date();
        d.setTime(millisecond)
        return this.dateToString(d, pattern);
    }

    static dateToString(date, pattern) {
        var day, month;
        var result = pattern;


        if (pattern.indexOf("HH") > -1) {
            var hour = date.getHours() >= 10 ? date.getHours() : `0${date.getHours()}`;
            pattern = pattern.replace("HH", hour)
        } else if (pattern.indexOf("H") > -1) {
            pattern = pattern.replace("H", date.getHours())
        }
        if (pattern.indexOf("mm") > -1) {
            var minute = date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`;
            pattern = pattern.replace("mm", minute)
        } else if (pattern.indexOf("m") > -1) {
            pattern = pattern.replace("m", date.getMinutes())
        }
        if (pattern.indexOf("dd") > -1) {
            var dayMonth = date.getDate() >= 10 ? date.getDate() : `0${date.getDate()}`;
            pattern = pattern.replace("dd", dayMonth)
        } else if (pattern.indexOf("d") > -1) {
            pattern = pattern.replace("d", date.getDate());
        }
        if (pattern.indexOf("ss") > -1) {
            var second = date.getSeconds() >= 10 ? date.getSeconds() : `0${date.getSeconds()}`;
            pattern = pattern.replace("ss", second)
        } else if (pattern.indexOf("s") > -1) {
            pattern = pattern.replace("s", date.getSeconds())
        }
        if (pattern.indexOf("MMMM") > -1) {
            month = _MONTH_FULL[date.getMonth()];
            pattern = pattern.replace("MMMM", month);
        } else if (pattern.indexOf("MMM") > -1) {
            month = _MONTH_FULL[date.getMonth()].substr(0, 3);
            pattern = pattern.replace("MMM", month);
        } else if (pattern.indexOf("MM")) {
            month = date.getMonth() >= 10 ? date.getMonth() : `0${date.getMonth()}`;
            pattern = pattern.replace("MM", month);
        }

        if (pattern.indexOf("EEEE") > -1) {
            day = _DAY_WEEK_FULL[date.getDay()];
            pattern = pattern.replace("EEEE", day);
        } else if (pattern.indexOf("EEE") > -1) {
            day = _DAY_WEEK_FULL[date.getDay()].substr(0, 3);
            pattern = pattern.replace("EEE", day);
        }

        if (pattern.indexOf("yyyy") > -1) {
            pattern = pattern.replace("yyyy", date.getFullYear());
        } else if (pattern.indexOf("yy") > -1) {
            pattern = pattern.replace("yy", date.getFullYear().toString().substr(2, 2));
        }
        return pattern;
    }
}