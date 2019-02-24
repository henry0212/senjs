import { FrameLayout } from "../io/layout/frame-layout.js";
import { List } from "../util/list-util.js";

var _apiKey = null;



export function initial(apiKey) {
    if (apiKey === _apiKey) {
        return;
    }
    _apiKey = apiKey;
    var script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + apiKey;
    script.defer = "defer";
    script.async = "async";
    document.head.appendChild(script);
    return script;
}


export class GoogleMap extends FrameLayout {
    constructor(width, height) {
        super(width, height);
        // if(_apiKey == null){
        //     throw new Error("Google map was not initial");
        // }
        this._pool = {
            ia_markers: new List()
        }
        this._meta._google_map = null;
        this._meta._map_service = null;
        this.renderMap();
    }

    renderMap(lat, lng, zoom) {
        lat = lat || 10.771637;
        lng = lng || 106.693502;
        this._meta._google_map = new google.maps.Map(this._dom, {
            zoom: zoom || 11,
            center: { lat: lat, lng: lng },
            streetViewControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [{
                featureType: "poi",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            },
            {
                featureType: "administrative.locality",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            }],
            disableDefaultUI: true
        })
        this._meta._map_service = new google.maps.places.PlacesService(this._meta._google_map);
        return this;
    }

    static init(apiKey) {
        init(apiKey);
    }

    addMarker(options) {
        var ia_marker = new IaGoogleMarker(options, this._meta._google_map);
        this._pool.ia_markers.add(ia_marker);
        return ia_marker.marker;
    }

    setMapCenter(lat, lng) {
        this._meta._google_map.setCenter({ lat: lat, lng: lng });
        return this
    }

    getMapCenter() {
        return this._meta._google_map.getCenter();
    }

    setMapZoom(value) {
        this._meta._google_map.setZoom(value);
        return this
    }

    getMapZoom() {
        return this._meta._google_map.getZoom();
    }

    findMarkerById(id) {
        return this._pool.ia_markers.single("id", id);
    }

    removeMarkerById(id) {
        var marker = this._pool.ia_markers.single("id", id);
        if (marker) {
            marker.remove();
        }
        return this;
    }

    findNearByPlaces(request) {
        return new Promise((next, reject) => {
            this.getGoogleMapService().nearbySearch(request, (results, status) => {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    next(results)
                } else {
                    reject(results);
                }
            });
        })

    }

    findPlacesByText(request) {
        return new Promise((next, reject) => {
            var rs = [];
            this.getGoogleMapService().textSearch(request, (results, status, pagination) => {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    // rs = rs.concat(results);
                    // if (pagination.hasNextPage) {
                    //     pagination.nextPage();
                    // } else {
                    //     next(rs);
                    // }
                    next(results);
                } else {
                    reject(results);
                }
            });
        })
    }

    searchPlaceByKey(request) {
        return new Promise((next, reject) => {
            this.getGoogleMapService().textSearch(request, (results, status, pagination) => {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    next(results);
                } else {
                    reject(results);
                }
            });
        })
    }

    findPlaceDetail(placeId, fields) {
        var request;
        if (fields) {
            request = {
                placeId: placeId,
                fields: fields
            };
        } else {
            request = {
                placeId: placeId,
            };
        }
        return new Promise((next, reject) => {
            this.getGoogleMapService().getDetails(request, (result, status) => {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    next(result)
                } else {
                    reject(result);
                }
            });
        })
    }

    getGoogleMapService() {
        return this._meta._map_service;
    }

    removeAllMarkers() {
        this._pool.ia_markers.foreach(ia_marker => {
            ia_marker.marker.remove();
        })
        this._pool.ia_markers.clear();
    }

    getGoogleMap() {
        return this._meta._google_map;
    }
}


let _id = 0;
class IaGoogleMarker {
    constructor(options, googleMap) {

        // Rewrite image icon - scale image
        if (options.icon) {
            options.icon = {
                url: options.icon,
                // This marker is 20 pixels wide by 32 pixels high.
                scaledSize: new google.maps.Size(24, 24),
                // The origin for this image is (0, 0).
                //origin: new google.maps.Point(0, 0),
                // The anchor for this image is the base of the flagpole at (0, 32).
                //anchor: new google.maps.Point(0, 0)
            };
        }

        var marker = new google.maps.Marker(options);
        marker.setMap(googleMap);
        _id++;
        this.id = _id;
        this.marker = marker;
        this.tag = null;
        marker.setTag = (value) => {
            this.tag = value;
            return marker;
        }
        marker.getTag = () => {
            return this.tag;
        }
        marker.remove = () => {
            marker.setMap(null);
        }
        marker.setId = (id) => {
            this.id = id;
            return marker;
        }
        marker.setOnClick = function (onMarkerClicked) {
            marker.addListener('click', function () {
                onMarkerClicked(this);
            });
            return marker;
        }
    }
}