package com.tracker.ImagePicker;

import android.util.Log;

/**
 * Created by david on 6/9/17.
 */

public class ConvolveThread implements Runnable {

    private int startIndex;
    private int endIndex;
    private Pixel[] data;
    private Pixel[] pixelData;
    private double[][] weights;
    private int width;
    private int height;

    public ConvolveThread(int startIndex, int endIndex, Pixel[] data, Pixel[] pixelData, double[][] weights, int width, int height) {
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.data = data;
        this.pixelData = pixelData;
        this.weights = weights;
        this.width = width;
        this.height = height;
    }

    private static double convolution(Pixel[] pixels, int width, double[][] weights, int x, int y) {
        double sum = 0;
        for (int yi = -1; yi < 2; yi++) {
            for (int xi = -1; xi < 2; xi++) {
                sum += get_grayscale_pixel(pixels, width, x + xi, y + yi) * weights[yi + 1][xi + 1];
            }
        }
        return sum;
    }

    private static double get_grayscale_pixel(Pixel[] pixels, int width, int x, int y) {
        Pixel p = pixels[(y * width) + x];
        double sum = p.r + p.g + p.b;
        sum /= 3.0;
        return Math.floor(sum);
    }

    @Override
    public void run() {
        int i = 0;
        for (int y = startIndex; y < endIndex; y++) {
            for (int x = 1; x < width - 1; x++) {
                double px = convolution(pixelData, width, weights, x, y);
                int ind = (y * width) + x;
                px = px < 0 ? 0 : px;
                data[ind].r = px;
                data[ind].g = px;
                data[ind].b = px;
                i += 1;
            }
        }
        Log.d("ConvolveThread", Integer.toString(i));
        synchronized (this) {
            notify();
        }
    }
}
