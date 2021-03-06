var L = require('leaflet');
var when = require('when');
var geolib = require('geolib');
var config = require('../config');
var Stop = require('./Stop');
var requests = require('../requests');

var StopCollection = {
    fetch: function(route, direction) {
        var deferred = when.defer();

        requests.get('data/stops_' + route + '_' + direction + '.json')
            .then(function(data) {
                var stops = data.map(function(stopData) {
                    return new Stop(stopData);
                });

                deferred.resolve(stops);
            })
            .catch(function(err) {
                console.error("Problem fetching stop", err);
                deferred.reject(err);
            });

        return deferred.promise;
    },
    draw: function(stops, layer) {
        stops.forEach(function(stop) {
            stop.marker.addTo(layer);
        });
    },
    closest: function(stops, latlng) {
        if (!stops.length) return;

        var points = stops.map(function(s) { return { latitude: s.lat(), longitude: s.lon()}; }),
            _latlng = {latitude: latlng.lat, longitude: latlng.lng },
            nearestPoint,
            stop;

        nearestPoint = geolib.findNearest(_latlng, points, 0, 1);
        stop = stops[parseInt(nearestPoint.key)];

        stop.closest(true);
        stop.toggleTrips();

        return stop;
    }
};

module.exports = StopCollection;
