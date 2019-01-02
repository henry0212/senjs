

var _storgate = null;


const config = {
    path_gallery: "galleries"
}


export class StorageUtil {
    static newInstance() {
        return _storgate = new StorageUtil();
    }

    static getInstance() {
        if (_storgate == null) {
        }
        _storgate = new StorageUtil();
        return _storgate;
    }

    constructor() {
        this.storage = firebase.storage();
    }


    storeBase64ToGallery(base64) {
        var storageRef = this.storage.ref();
        var mineType = base64MimeType(base64);
        var pathRef = storageRef.child(`${config.path_gallery}/${Date.now()}.` + detectExtension(mineType));
        return new Promise((next, rejected) => {
            pathRef.putString(base64, 'data_url').then(function (snapshot) {
                snapshot.ref.getDownloadURL().then(function (downloadURL) {
                    next(downloadURL);
                });
            }).catch(error => {
                rejected(error);
            });
        });
    }
}


function base64MimeType(encoded) {
    var result = null;
    if (typeof encoded !== 'string') {
        return result;
    }
    var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    if (mime && mime.length) {
        result = mime[1];
    }
    return result;
}

function detectExtension(mimeType) {
    switch (mimeType.toLowerCase()) {
        case 'image/jpeg':
            return "jpg";
        case 'image/png':
            return "png";
        case 'image/gif':
            return "gif";
        default:
            return "jpg";
    }
}
