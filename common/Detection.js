function convolution(get_pixel, weights, x, y) {
    var sum = 0;
    for (var yi = -1; yi < 2; yi++) {
        for (var xi = -1; xi < 2; xi++) {
            sum += get_pixel(x + xi, y + yi) * weights[yi + 1][xi + 1];
        }
    }
    return sum;
}
function get_grayscale_pixel(pixels, width, x, y) {
    var p = pixels[(y * width) + x];
    var sum = p.r + p.g + p.b;
    sum /= 3;
    return Math.round(sum);
}

function convolve(data, get_pixel, weights, width, height) {
    for (var y = 1; y < height - 1; y++) {
        for (var x = 1; x < width - 1; x++) {
            var px = convolution(get_pixel, weights, x, y);
            var ind = (y * width) + x;
            // console.log('pix', data[ind]);
            data[ind].r = px;
            data[ind].g = px;
            data[ind].b = px;
        }
    }
}

function edge_detection(data, width, height) {
    // Pixel information for the input image ('data')
    var get_pixel = (x, y) => get_grayscale_pixel(data, width, x, y);
    // Array to put the smoothed and edge detection results in
    var edge_data = JSON.parse(JSON.stringify(data));
    // Smoothing weights
    var d = 1.0 / 9;
    var smooth_weights = [[d, d, d], [d, d, d], [d, d, d]];
    convolve(edge_data, get_pixel, smooth_weights, width, height);
    // Edge detection weights
    var weights = [[0, 1, 0], [1, -4, 1], [0, 1, 0]];
    // Pixel information for the smoothed image. Difference is that this uses 'edge_data' which will be filled from the smoothing operation (which used the input image data)
    get_pixel = (x, y) => get_grayscale_pixel(edge_data, width, x, y);
    console.log('edge');
    convolve(edge_data, get_pixel, weights, width, height);
    console.log('width', width);
    // Return the pixels with the image edges
    return edge_data;
}

export default edge_detection