

export class ImageRefactor {
    constructor(imageSrc) {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        this._meta = {
            translate: {
                x: 0,
                y: 0
            },
            rotate: 0,
            image: "",
            imageWidth: 0,
            imageHeight: 0
        }

        this._listener = {
            onImageChanged: null
        }

         if (imageSrc) {
            this.drawImage(imageSrc);
        }
    }

    drawImage(src) {
        var image = new Image();
        image.src = src;
        image.crossOrigin = "anonymous";
        this._meta.image = image;
        image.onload = () => {
            this._meta.imageWidth = image.width;
            this._meta.imageHeight = image.height;
            var canvasSize = this._meta.imageWidth > this._meta.imageHeight ? this._meta.imageWidth : this._meta.imageHeight;
            this.canvas.width = canvasSize;
            this.canvas.height = canvasSize;
            this.ctx.drawImage(this._meta.image, 0, 0);
        }
        image.src = src;
    }

    rotate(degrees) {
        this._meta.rotate = this.rotate;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.translate(this.canvas.width / 2, this.canvas.height / 2);

        this.ctx.rotate(degrees * Math.PI / 180);

        this.ctx.drawImage(this._meta.image, -this._meta.imageWidth / 2, -this._meta.imageHeight / 2);


        this.ctx.restore();
        if (this._listener.onImageChanged) {
            var newImage = this.toBase64();
            this._listener.onImageChanged(newImage);
        }
        return this;
    }

    translate(x, y) {
        this._meta.translate.x = x || this._meta.translate.x;
        this._meta.translate.y = y || this._meta.translate.y;
        this.ctx.translate(x, y);
    }

    crop(x, y, width, height) {

    }

    setOnImageChanged(cb) {
        this._listener.onImageChanged = cb;
        return this;
    }

    /**
     * 
     * @param {number} quality  - the percent quality of image , default 100%
     */
    toBase64(quality) {
        // trimCanvas(this.canvas);
        return trimCanvas(this.canvas).toDataURL(null, quality / 100 || 1);
    }

    close() {
        this.canvas.remove();
    }

}


function trimCanvas(c) {
    var ctx = c.getContext('2d'),
        copy = document.createElement('canvas').getContext('2d'),
        pixels = ctx.getImageData(0, 0, c.width, c.height),
        l = pixels.data.length,
        i,
        bound = {
            top: null,
            left: null,
            right: null,
            bottom: null
        },
        x, y;

    // Iterate over every pixel to find the highest
    // and where it ends on every axis ()
    for (i = 0; i < l; i += 4) {
        if (pixels.data[i + 3] !== 0) {
            x = (i / 4) % c.width;
            y = ~~((i / 4) / c.width);

            if (bound.top === null) {
                bound.top = y;
            }

            if (bound.left === null) {
                bound.left = x;
            } else if (x < bound.left) {
                bound.left = x;
            }

            if (bound.right === null) {
                bound.right = x;
            } else if (bound.right < x) {
                bound.right = x;
            }

            if (bound.bottom === null) {
                bound.bottom = y;
            } else if (bound.bottom < y) {
                bound.bottom = y;
            }
        }
    }

    // Calculate the height and width of the content
    var trimHeight = bound.bottom - bound.top,
        trimWidth = bound.right - bound.left,
        trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);

    copy.canvas.width = trimWidth;
    copy.canvas.height = trimHeight;
    copy.putImageData(trimmed, 0, 0);

    // Return trimmed canvas
    return copy.canvas;
}