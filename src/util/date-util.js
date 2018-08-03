

export class DateUtil{

    static dateToString(date, format) {
        var day = (date.getDate < 10 ? +"0" + (date.getDate()) : date.getDate());
        var month = ((date.getMonth() + 1) < 10) ? "0" + (date.getMonth() + 1) : date.getMonth();
        var hour = (date.getHours() < 10 ? ("0" + (date.getHours())) : date.getHours());
        var min = (date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes());
        return format.replace("dd", day).replace("MM", month).replace("yyyy", date.getFullYear()).replace("HH", hour).replace("mm", min);
    }

    static getCurrentDate() {
        return new Date();
    }

    static getDateAsString(format) {
        var date = new Date();
        var day = (date.getDate < 10 ? +"0" + (date.getDate()) : date.getDate());
        var month = ((date.getMonth() + 1) < 10) ? "0" + (date.getMonth() + 1) : date.getMonth();
        return format.replace("dd", day).replace("MM", month).replace("yyyy", date.getFullYear());
    }

    static getDate(day, month, year) {
        var date = this.getCurrentDate();
        date.setDate(day), date.setMonth(month - 1);
        date.setFullYear(year);
        return date;
    }


    static print(content, width, height, modifiedCss) {
        width = width || info.SCREEN_WIDTH;
        height = height || info.SCREEN_HEIGHT;
        var printWindow = window.open("", "", "width= " + width + " height=" + height);
        var styles = document.getElementsByTagName("link");
        var css = "";
        dh.List(styles).foreach(function (item, count) {
            if (item.getAttribute("rel") == "stylesheet") {
                css = document.createElement("link");
                css.rel = "stylesheet";
                if (item.getAttribute("href").indexOf("http") == -1) {
                    css.href = location.protocol + "//" + location.host + "/" + item.getAttribute("href");
                } else {
                    css.href = item.getAttribute("href");
                }
                printWindow.document.head.appendChild(css);
                css = document.createElement("style");
                css.type = "text/css";
                //css.innerHTML = "." + dhIcons.iconClassKey + "{ display:none !important } *{ background-color: transparent !important }";
                printWindow.document.head.appendChild(css);
            }
        });
        css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = location.protocol + "//" + location.host + "/css/printer.css";
        if (modifiedCss != undefined) {
            css = document.createElement("link");
            css.rel = "stylesheet";
            css.href = location.protocol + "//" + location.host + "/css/printer.css";
        }
        printWindow.document.head.appendChild(css);
        printWindow.document.body.innerHTML = content;
        printWindow.document.body.style.backgroundColor = info.manualBackground || "#FFFFFF";
        //printWindow.document.body.getElementsByTagName("table")[0].border = 0;
        //printWindow.document.body.getElementsByTagName("table")[0].cellPadding = 5;
        dh.Waiter.create(function () {
            printWindow.print();
            printWindow.close();
        }, 1000);
    }

}