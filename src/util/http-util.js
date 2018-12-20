const _config = {
    SUCCESS_STATUS: [200, 201, 204]
}

export class HttpUtil {

    static newInstance() {
        return new HttpUtil({ allowCORS: true });
    }

    constructor(options) {
        this._options = options || {};
        this._data = {
            body: null
        }
        this._listener = {
            onRequestFailed: null,
            onRequestEstablished: null,
            onRequestReceived: null,
            onRequestProcessing: null,
            onRequestFinished: null,
            onRequestSuccess: null,
            onRequestFailed: null
        }

    }

    GET(url) {
        this._httpRequest = (openHttpRequest.bind(this))("get", url);
        return this;
    }

    POST(url) {
        this._httpRequest = (openHttpRequest.bind(this))("post", url);
        return this;
    }

    PUT(url) {
        this._httpRequest = (openHttpRequest.bind(this))("put", url);
        return this;
    }

    DELETE(url) {
        this._httpRequest = (openHttpRequest.bind(this))("delete", url);
        return this;
    }



    execute() {
        if (this._data.body) {
            this._httpRequest.send(this._data.body);
        } else {
            this._httpRequest.send();
        }
        return this;
    }

    /**
     * request with other method
     * @param {string} method 
     */
    OTHER(method) {
        this._httpRequest.open(method, url, true);
    }

    setRequestBody(data) {
        this._data.body = data;
        return this;
    }

    setOnResponseSuccess(cb) {
        this._listener.onRequestSuccess = cb;
        return this;
    }

}


function openHttpRequest(method, url) {

    if (this._options.allowCORS) {
        var httpRequest = new XMLHttpRequest();
        if ("withCredentials" in httpRequest) {
            httpRequest.open(method, url, true);
        } else if (typeof XDomainRequest != "undefined") {
            httpRequest = new XDomainRequest();
            httpRequest.open(method, url);
        }
    } else {
        httpRequest = new XMLHttpRequest();
        httpRequest.open(method, url, true);
    }
    httpRequest.setRequestHeader("Content-Type", "application/json");
    httpRequest.setRequestHeader("Accept", "*/*");

    httpRequest.onreadystatechange = () => {

        if (httpRequest.readyState == 0) {
            if (this._listener.onRequestFailed != null) {
                this._listener.onRequestFailed(httpRequest);
            }
            return;
        } else if (httpRequest.readyState == 1) {
            if (this._listener.onRequestEstablished != null) {
                this._listener.onRequestEstablished(httpRequest);
            }
        }
        else if (httpRequest.readyState == 2) {
            if (this._listener.onRequestReceived != null) {
                this._listener.onRequestReceived(httpRequest);
            }
        }
        else if (httpRequest.readyState == 3) {
            if (this._listener.onRequestProcessing != null) {
                this._listener.onRequestProcessing(httpRequest);
            }
        } else if (httpRequest.readyState == 4) {
            if (this._listener.onRequestFinished != null) {
                this._listener.onRequestFinished(httpRequest);
            }

        }
        if (_config.SUCCESS_STATUS.indexOf(httpRequest.status) > -1) {
            if (httpRequest.readyState == 4) {
                if (this._listener.onRequestSuccess != null) {
                    this._listener.onRequestSuccess(httpRequest, httpRequest.responseText);
                }
            }
        } else if (httpRequest.status == 404) {
            if (this._listener.onRequestFailed != null) {
                this._listener.onRequestFailed(httpRequest);
            }
        } else {
            if (this._listener.onRequestFailed != null) {
                this._listener.onRequestFailed(httpRequest);
            }
        }
    }
    return httpRequest;
}