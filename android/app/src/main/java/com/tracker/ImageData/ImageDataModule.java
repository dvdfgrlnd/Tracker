package com.tracker.ImageData;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.os.Build;
import android.widget.ImageView;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by david on 12/23/16.
 */

public class ImageDataModule extends ReactContextBaseJavaModule {
    public ImageDataModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ImageData";
    }

    @ReactMethod
    public void getImageData(String imagePath, Callback c) {
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inPreferredConfig = Bitmap.Config.ARGB_8888;
        Bitmap bitmap = BitmapFactory.decodeFile(imagePath, options);
        List<int[]> list = new ArrayList<>();
        for (int y = 0; y < bitmap.getHeight(); y++) {
            for (int x = 0; x < bitmap.getHeight(); x++) {
                int pixel = bitmap.getPixel(x, y);
                list.add(new int[]{x, y});
            }
        }
        c.invoke("hello");
    }
}
