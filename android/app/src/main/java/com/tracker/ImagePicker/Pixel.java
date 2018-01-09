package com.tracker.ImagePicker;

/**
 * Created by david on 6/4/17.
 */

public class Pixel {
    public double r;
    public double g;
    public double b;
    public double a;
    public int x;
    public int y;

    public Pixel() {
    }

    public Pixel(Pixel pixel) {
        this.a = pixel.a;
        this.r = pixel.r;
        this.g = pixel.g;
        this.b = pixel.b;
        this.x = pixel.x;
        this.y = pixel.y;
    }
}
