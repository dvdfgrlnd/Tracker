package com.tracker.ImagePicker;

import android.graphics.Bitmap;
import android.graphics.Color;

import java.nio.IntBuffer;

/**
 * Created by david on 6/4/17.
 */
public class EdgeDetection {

    private static final int NUM_THREADS = 4;

    private static void convolve(Pixel[] data, Pixel[] pixelData, double[][] weights, int width, int height) {
        // Run the computations in parallel
        Thread[] runningThreads = new Thread[NUM_THREADS];
        int step = height / NUM_THREADS;
        int remain = height - (step * NUM_THREADS);
        int[] start = new int[NUM_THREADS];
        int[] end = new int[NUM_THREADS];
        int prev = 0;
        for (int p = 0; p < NUM_THREADS; p++) {
            int s = prev;
            int e = prev + step;
            if (p == 0) {
                s += 1;
            }
            if (p == NUM_THREADS - 1) {
                e -= 1;
            }
            if (p < remain) {
                e += 1;
            }
            start[p] = s;
            end[p] = e;

            prev = e;
        }
        // Start the threads
        for (int p = 0; p < NUM_THREADS; p++) {
            Thread thread = new Thread(new ConvolveThread(start[p], end[p], data, pixelData, weights, width, height));
            runningThreads[p] = thread;
            thread.start();
        }
        // Wait for all threads to finish
        for (int p = 0; p < NUM_THREADS; p++) {
            try {
                synchronized (runningThreads[p]) {
                    runningThreads[p].join();
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    private static void setBorder(Pixel[] data, int width, int height) {
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                if (x == 0 || y == 0 || x == width - 1 || y == height - 1) {
                    int ind = (y * width) + x;
                    data[ind].r = 0;
                    data[ind].g = 0;
                    data[ind].b = 0;
                }
            }
        }
    }

    private static Pixel[] clone(Pixel[] pixels) {
        Pixel[] newArray = new Pixel[pixels.length];
        for (int i = 0; i < newArray.length; i++) {
            newArray[i] = new Pixel(pixels[i]);
        }
        return newArray;
    }

    private static int[] convertFromPixels(Pixel[] pixels) {
        int[] vector = new int[pixels.length];
        // Convert to bytes
        for (int i = 0; i < vector.length; i++) {
            Pixel px = pixels[i];
            vector[i] = Color.argb((int) px.a, (int) px.r, (int) px.g, (int) px.b);
        }
        return vector;
    }

    private static Pixel[] convertToPixels(int[] pixels, int width) {
        Pixel[] vector = new Pixel[pixels.length];
        // Convert to bytes
        for (int i = 0; i < vector.length; i++) {
            Pixel px = new Pixel();
            px.a = Color.alpha(pixels[i]);
            px.r = Color.red(pixels[i]);
            px.g = Color.green(pixels[i]);
            px.b = Color.blue(pixels[i]);
            px.x = i % width;
            px.y = i / width;
            vector[i] = px;
        }
        return vector;
    }

    private static Pixel[] scalePixels(Pixel[] pixels, int width, int height, int newWidth) {
        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        int[] vector = convertFromPixels(pixels);
        // vector is your int[] of ARGB
        bitmap.setPixels(vector, 0, width, 0, 0, width, height);
        bitmap = Bitmap.createScaledBitmap(bitmap, newWidth, newWidth, false);
        int[] scaledVector = new int[newWidth * newWidth];
        bitmap.getPixels(scaledVector, 0, newWidth, 0, 0, newWidth, newWidth);
        return convertToPixels(scaledVector, newWidth);
    }

    public static Bitmap createBitmap(Pixel[] pixels, int width, int height) {
        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        int[] vector = convertFromPixels(pixels);
        // vector is your int[] of ARGB
        bitmap.setPixels(vector, 0, width, 0, 0, width, height);
        return bitmap;
    }

    public static Result compute(Pixel[] data, int width, int height) {
//        data = scalePixels(data, width, height, height);
        Pixel[] edge_data = clone(data);
        // Smoothing weights
        double d = 1.0 / 9.0;
        double[][] smooth_weights = {{d, d, d}, {d, d, d}, {d, d, d}};
        convolve(edge_data, data, smooth_weights, width, height);
        // Edge detection weights
        double[][] weights = {{0, 0.7, 0}, {0.7, -4, 0.7}, {0, 0.7, 0}};
        // Pixel information for the smoothed image. Difference is that this uses 'edge_data' which will be filled from the smoothing operation (which used the input image data)
        Pixel[] pixelData = clone(edge_data);
        convolve(edge_data, pixelData, weights, width, height);
        // Smooth again to remove some outliers
        setBorder(edge_data, width, height);
        pixelData = clone(edge_data);
        convolve(edge_data, pixelData, weights, width, height);
        // Boost the outline
        Pixel[] boosted = clone(edge_data);
        Pixel[] boosted_data = clone(edge_data);
        double[][] boost_weights = {{1, 1, 1}, {1, 1, 1}, {1, 1, 1}};
        convolve(boosted, boosted_data, boost_weights, width, height);
        // Return the pixels with the image edges
        Result result = new Result();
        result.edges = edge_data;
        result.boosted = boosted;
//        result.boosted = edge_data;
        return result;
    }
}
