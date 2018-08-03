export class PrinterUtil {

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