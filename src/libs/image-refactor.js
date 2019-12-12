

export class ImageRefactor {
    constructor(imageSrc) {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        this.canvas.style.position = 'fixed';
        this.canvas.style.visibility = 'hidden';
        this.canvas.style.zIndex = -1;
        this.ctx = this.canvas.getContext("2d");
        this._meta = {
            translate: {
                x: 0,
                y: 0
            },
            rotate: 0,
            resize: {
                max_width: -1,
                max_height: -1
            },
            scale: {
                x: 1,
                y: 1
            },
            image: null,
            isLoaded: false,
            get imageWidth() {
                return this.image ? this.image.naturalWidth : 0
            },
            get imageHeight() {
                return this.image ? this.image.naturalHeight : 0
            }
        }

        this._listener = {
            onImageChanged: null
        }
        this.init(imageSrc);
    }

    init(imageSrc) {
        if (imageSrc) {
            this.drawImage(imageSrc);
        }
    }

    drawImage(src) {
        var image = new Image();
        this._meta.isLoaded = false;
        image.crossOrigin = "anonymous";
        this._meta.image = image;
        image.onload = () => {
            var canvasSize = this._meta.imageWidth > this._meta.imageHeight ? this._meta.imageWidth : this._meta.imageHeight;
            this.canvas.width = canvasSize;
            this.canvas.height = canvasSize;
            this.ctx.drawImage(this._meta.image, 0, 0);
            this._meta.isLoaded = true;
        }
        image.src = src;
        var canvasSize = this._meta.imageWidth > this._meta.imageHeight ? this._meta.imageWidth : this._meta.imageHeight;
        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;
    }

    begin() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        return this;
    }

    rotate(degrees) {
        this._meta.rotate = degrees;
        return this;
    }

    crop(x, y, width, height) {

    }

    resize(max_width, max_height) {
        this._meta.resize.max_width = max_width;
        this._meta.resize.max_height = max_height;
        return this;
    }

    done() {
        return new Promise((next) => {
            var itv = setInterval(() => {
                if (this._meta.isLoaded) {
                    clearInterval(itv);
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.save();
                    var translatex = 0, translatey = 0;
                    /** Rotation */
                    if (this._meta.rotate != 0) {
                        this.ctx.translate(translatex = this._meta.imageWidth / 2, translatey = this._meta.imageHeight / 2);
                        this.ctx.rotate(this._meta.rotate * Math.PI / 180);
                    }
                    /** Resize */
                    if ((this._meta.resize.max_height > -1 && this._meta.resize.max_height < this._meta.imageHeight)
                        || (this._meta.resize.max_width > -1 && this._meta.resize.max_width < this._meta.imageWidth)) {
                        var scale_w = this._meta.resize.max_width / this._meta.imageWidth,
                            scale_h = this._meta.resize.max_height / this._meta.imageHeight,
                            scale = this._meta.scale_w * this._meta.imageHeight > this._meta.resize.max_width ? scale_w : scale_h;
                        this._meta.scale.x = scale, this._meta.scale.y = scale;
                        translatex = translatex * scale;
                        translatey = translatey * scale;
                        this.ctx.scale(scale, scale);
                    }
                    this.ctx.drawImage(this._meta.image, translatex, translatey);
                    this.ctx.restore();
                    if (this._listener.onImageChanged) {
                        var newImage = this.toBase64();
                        this._listener.onImageChanged(newImage);
                    }
                    next(this);
                }
            }, 100);
        })
    }

    setOnImageChanged(cb) {
        this._listener.onImageChanged = cb;
        return this;
    }

    /**
     * 
     * @param {number} quality  - the percent quality of image , default 100%
     */
    toBase64(quality, mineType) {
        var self = this;
        return new Promise(function (next) {
            var tv = setInterval(function () {
                if (self._meta.isLoaded) {
                    if (mineType) {
                        next(trimCanvas(self.canvas).toDataURL(mineType, quality / 100 || 1));
                    } else {
                        next(trimCanvas(self.canvas).toDataURL("image/jpeg", quality / 100 || 1));
                    }
                    clearInterval(tv);
                }
            }, 100);
        });
    }

    close() {
        this.canvas.remove();
    }
}

function trimCanvas(c) {
    if (c.width == 0) {
        return c;
    }
    try {
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
        return copy.canvas;
        // Return trimmed canvas
    } catch (ex) {
        console.log(ex);
        return c;
    }
}

