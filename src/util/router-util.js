import { senjs } from "../index.js";

var router_pool = {
    routings: []
}

var _meta = {
    currentRouting: null
}



window.addEventListener("load", () => {
    setTimeout(() => {
        RouterUtil.init();
    }, 200);
});

var getCurrentRouting = function () {
    var href = window.location.href.toString().replace(window.location.hostname, "");
    if (href.indexOf("?") > -1) {
        href = href.substr(0, href.indexOf("?"))
    }
    var paths = href.split("/");
    var begin = paths.indexOf("#");
    var temp;
    if (begin > -1) {
        paths = paths.splice(begin + 1);
        var path = "/" + paths.join("/");
        temp = router_pool.routings.find((item) => {
            return item.path === path;
        });
    } else {
        temp = router_pool.routings.find((item) => {
            return item.path === "" || item.path === "/";
        });

    }
    return temp ? temp : {
        path: "",
        call: () => {

        }
    };
}

var getParameter = function () {
    var result = null;
    var strParam = window.location.href.toString();
    if (strParam.indexOf("?") > -1) {
        strParam = strParam.substr(strParam.indexOf("?") + 1);
        if (strParam.length > 0) {
            var list = strParam.split("&");
            result = {};
            list.forEach(item => {
                var temp = item.split("=");
                if (temp.length == 2) {
                    result[temp[0]] = temp[1];
                }
            })
        }
    }
    return result;
}

var paramToJson = function () {

}

var jsonToParam = function (params) {
    return Object.keys(params).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
    }).join('&');
}


export class RouterUtil {
    static init() {
        var detector = () => {
            var temp = getCurrentRouting();
            if (temp && senjs.app.preventBackRoutingCallback == false) {
                temp.call();
            }
            senjs.app.preventBackRoutingCallback = false;
        }
        detector();
        window.addEventListener("popstate", (e) => {
            e.preventDefault();
            detector();
        });
    }

    static register(path, callback) {
        if (Array.isArray(path)) {
            path.forEach(p => {
                router_pool.routings.push({
                    path: p,
                    call: function () {
                        callback(getParameter());
                    }
                })
            })
        } else {
            router_pool.routings.push({
                path: path,
                call: function () {
                    callback(getParameter());
                }
            })
        }
        return this;
    }

    static updatePath(path, title) {
        var routing = getCurrentRouting();
        console.log(routing,path);
        if (routing.path === path) {
            return;
        }
        path = path.charAt(0) === "/" ? path.substring(1) : path;
        window.history.pushState(null, title, "/#/" + path);
        return this;
    }

    static updateParams(params) {
        var strParam = jsonToParam(params);
        var path = getCurrentRouting().path;
        path = path.charAt(0) === "/" ? path.substring(1) : path;
        if (strParam.length > 0) {
            window.history.pushState(null, "", "/#/" + path + "?" + strParam);
        }
        return this;
    }

    static getCurrentParameter() {
        return getParameter();
    }

    static parameterJsonToString(params) {
        return jsonToParam(params)
    }

}