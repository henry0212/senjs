export class FormatUtil{



    static formatBytes(bytes) {
        if (bytes < 1024) return bytes + " bytes";
        else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KiB";
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MiB";
        else return (bytes / 1073741824).toFixed(3) + " GiB";
    }
    
    static formatDate(dd, MM, yyyy, format) {
        var day = dd < 10 ? "0" + dd : dd;
        var month = (MM) < 9 ? "0" + (MM) : (MM);
        return format.replace("dd", day).replace("MM", month).replace("yyyy", yyyy);
    }

    static formatCurrency(amount) {
        if (!isNaN(amount)) {
            var out = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return out;
        }
        return "0";
    }
}