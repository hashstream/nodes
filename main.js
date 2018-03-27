import 'ol/ol.css';
import ol from 'ol';
import proj from 'ol/proj';
import extent from 'ol/extent';
import Map from 'ol/map';
import View from 'ol/view';
import Vector from 'ol/source/vector';
import Heatmap from 'ol/layer/heatmap';
import Tile from 'ol/layer/tile';
import XYZ from 'ol/source/xyz';
import GeoJSON from 'ol/format/geojson';
import loadingstrategy from 'ol/loadingstrategy';
import OSM from 'ol/source/osm';

var vs = new Vector({
    format: new GeoJSON(),
    loader: function(ext, resolution, projection) {
        var pt = proj.transform(extent.getCenter(ext), projection.getCode(), 'EPSG:4326');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api.php?long=' + pt[0] + '&lat=' + pt[1] + '&range=' + (extent.getWidth(ext) / proj.METERS_PER_UNIT.m / 1000) / 2);
        var onError = function() {
            vs.removeLoadedExtent(ext);
        }
        xhr.onerror = onError;
        xhr.onload = function() {
            if (xhr.status == 200) {
                vs.clear();
                vs.addFeatures(vs.getFormat().readFeatures(xhr.responseText, {
                    dataProjection: "EPSG:4326",
                    featureProjection: projection.getCode()
                }));
            } else {
                onError();
            }
        }
        xhr.send();
    },
    strategy: loadingstrategy.bbox
});

window.map = new Map({
    target: 'heatmap',
    layers: [
        new Tile({
            source: new OSM()
        }),
        new Heatmap({
            weight: "1",
            source: vs,
            zIndex: 1
        })
    ],
    view: new View({
        center: [0, 0],
        zoom: 2
    })
});

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
}

function showPosition(position) {
    var vw = map.getView();
    var pt = proj.transform([position.coords.longitude, position.coords.latitude], 'EPSG:4326', vw.getProjection().getCode());
    vw.setCenter(pt);
    vw.setZoom(8);
}