module.exports.destinationCoordinate = function destinationCoordinate(startPoint, distance, bearing) {
    var R = 6371000; // m
    var lat = startPoint.latitude * (Math.PI / 180);
    var lon = startPoint.longitude * (Math.PI / 180);

    var φ2 = Math.asin(Math.sin(lat) * Math.cos(distance / R) +
        Math.cos(lat) * Math.sin(distance / R) * Math.cos(bearing));
    var λ2 = lon + Math.atan2(Math.sin(bearing) * Math.sin(distance / R) * Math.cos(lat), Math.cos(distance / R) - Math.sin(lat) * Math.sin(φ2));

    return { latitude: φ2 * (180 / Math.PI), longitude: λ2 * (180 / Math.PI) };
}

module.exports.distance = function distance(startCoordinate, endCoordinate) {
    var lat1, long1, lat2, long2;
    lat1 = startCoordinate.latitude;
    long1 = startCoordinate.longitude;
    lat2 = endCoordinate.latitude;
    long2 = endCoordinate.longitude;
    var R = 6371000; // m
    var degToRad = Math.PI / 180;
    var φ1 = lat1 * degToRad;
    var φ2 = lat2 * degToRad;
    var Δφ = (lat2 - lat1) * degToRad;
    var Δλ = (long2 - long1) * degToRad;

    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var d = R * c;
    return d
}

