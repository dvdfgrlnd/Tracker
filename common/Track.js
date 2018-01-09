import Learning from './Learning';
import GreatCircle from './GreatCircle';

export default class Track {
    constructor(name, data, centerCoordinate, scale, rotation) {
        this.rotation = rotation || 0;
        this.scale = scale || 1;
        console.log(rotation, this.rotation, scale, this.scale);
        this.name = name;
        // Bind all outside callable methods
        this.resize = this.resize.bind(this);
        this.resizeToLength = this.resizeToLength.bind(this);
        this.rotate = this.rotate.bind(this);
        // Calculate the center point of the track, and make that point origo (0,0)
        data = Learning.sortPoints(data);
        this.data = this._center(data);
        this.centerCoordinate = centerCoordinate;

        this._generateCoordinates();
        this.trackLength = this._calculateTrackLength(this.coordinates);
    }

    rotate(angle) {
        // Convert angle to radians
        this.rotation = (angle * (Math.PI / 180));
        this._generateCoordinates();
    }

    _rotate(data, angle) {
        var angleCos = Math.cos(angle), angleSin = Math.sin(angle);
        var offset = this.getCenterPoint(data);
        return data.map((point) => {
            var rotatedPoint = {};
            rotatedPoint.x = Math.round(((point.x - offset.x) * angleCos) + ((point.y - offset.y) * angleSin)) + offset.x;
            rotatedPoint.y = Math.round(((point.y - offset.y) * angleCos) - ((point.x - offset.x) * angleSin)) + offset.y;
            return rotatedPoint;
        });

    }

    move(coordinate) {
        this.centerCoordinate = coordinate;
        this._generateCoordinates();
    }

    resizeToLength(length) {
        var scale = length / this.trackLength;
        this.resize(scale);
    }

    resize(scale) {
        this.scale *= scale;
        this._generateCoordinates();
    }

    _resize(data, scale) {
        return data.map((d) => {
            var p = {};
            p.x = d.x * scale;
            p.y = d.y * scale;
            return p;
        });
    }

    _generateCoordinates() {
        var start = (new Date()).getTime();
        var newPoints = this._rotate(this.data, this.rotation);
        newPoints = this._resize(newPoints, this.scale);
        this.coordinates = this._createPolyline(newPoints, this.scale);
        this.trackLength = this._calculateTrackLength(this.coordinates);
        console.log('track length', this.trackLength);
        console.log('time to generate coordinates:', ((new Date()).getTime() - start));
    }

    _calculateTrackLength(coordinates) {
        return coordinates.reduce((p, c, i) => i == 0 ? p : p + GreatCircle.distance(c, coordinates[i - 1]), 0);
    }

    getCenterPoint(data) {
        var center = data.reduce((p, c) => { p.x += c.x; p.y += c.y; return p; }, { x: 0, y: 0 });
        center.x /= data.length;
        center.y /= data.length;
        return center;
    }

    _center(data) {
        var center = this.getCenterPoint(data);
        return data.map((p) => ({ x: -(p.x - center.x), y: (p.y - center.y) }));
    }


    _createPolyline(list) {
        //console.log(JSON.stringify(list.filter((v) => v.a !== 0))) 
        var startCoord = this.centerCoordinate;
        var mPerDegY = 1.0 / 111111.0;
        var mPerDegY = 1.0 / (111111.0 * Math.cos(startCoord.latitude * (Math.PI / 180)));

        var mPerPix = 4;
        var coordinates = list.map((point) => {
            var target = { x: 0, y: 1 };
            var angle = Math.atan2(target.y, target.x) - Math.atan2(point.y, point.x);
            //if (point.x < 0 && point.y < 0)
            //    angle = Math.PI + Math.atan(point.y / point.x);
            //else if (point.x < 0)
            //    angle = Math.PI + (Math.atan(point.y / point.x) * (-1));
            //else if (point.y < 0)
            //    angle = Math.atan(point.y / point.x) * (-1);
            //else
            //    angle =  Math.atan(point.y / point.x);

            distance = Math.sqrt((point.x * point.x) + (point.y * point.y)) * mPerPix;
            var position = GreatCircle.destinationCoordinate(startCoord, distance, angle);
            return position;
        });
        //console.log(coordinates[0],list[0]);
        //this.state.poly = coordinates;
        //this.setState(this.state);
        return coordinates;
    }
}