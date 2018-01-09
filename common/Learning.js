function _sortPoints(points, index, prev, newPoints) {
    var closest = 0;
    var list = [];
    while (true) {
        var found = false;
        var minDist = 100000;
        for (var i = 1; i < points.length; i++) {
            if (!newPoints[i]) {
                found = true;
                var dist = distance(points[prev], points[i]);
                if (minDist > dist) {
                    closest = i;
                    minDist = dist;
                }
            }
        }
        newPoints[closest] = points[closest];
        if (!found) { break }
        index = index + 1;
        prev = closest;
        list.push(points[closest]);
    }
    return list;
}

module.exports.sortPoints = function (data) {
    var d = { 0: 0 };
    return _sortPoints(data, 1, 0, d);
}

function distance(p1, p2) {
    return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
}

module.exports.knearest = function (points, num) {
    var estimate = [];
    // Create initial estimates. Place them on equal space between points
    for (var i = 0; i < num; i++) {
        //var index = Math.floor(Math.random() * points.length);
        var index = Math.floor(i * points.length / num);
        estimate.push({ index, point: JSON.parse(JSON.stringify(points[index])) });
    }
    for (i = 0; i < 10; i++) {
        // Reset cluster
        estimate.forEach((c) => c.elem = []);
        // Calculate and add nearest cluster
        points.forEach((m) => {
            min = 1000000;
            minInd = 0;
            estimate.forEach((c, i) => {
                dist = distance(c.point, m);
                if (dist < min) {
                    min = dist;
                    minInd = i;
                }
            });
            estimate[minInd].elem.push(m);
        });
        // Calculate center
        estimate.forEach((c) => {
            var sum = c.elem.reduce((p, e) => {
                p.x += e.x;
                p.y += e.y;
                return p;
            }, { x: 0, y: 0 });
            sum.x /= c.elem.length;
            sum.y /= c.elem.length;
            c.point = sum;
        });
        //console.log(JSON.stringify(clusters));
    }
    return estimate;
}