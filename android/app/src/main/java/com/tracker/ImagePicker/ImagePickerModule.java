package com.tracker.ImagePicker;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileDescriptor;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by david on 12/23/16.
 */

public class ImagePickerModule extends ReactContextBaseJavaModule {

    private static final int IMAGE_PICKER_REQUEST = 467081;
    private static final String E_ACTIVITY_DOES_NOT_EXIST = "E_ACTIVITY_DOES_NOT_EXIST";
    private static final String E_PICKER_CANCELLED = "E_PICKER_CANCELLED";
    private static final String E_FAILED_TO_SHOW_PICKER = "E_FAILED_TO_SHOW_PICKER";
    private static final String E_NO_IMAGE_DATA_FOUND = "E_NO_IMAGE_DATA_FOUND";

    private Promise mPickerPromise;
    private ReactContext mReactContext;

    public static int calculateInSampleSize(
            BitmapFactory.Options options, int reqWidth, int reqHeight) {
        // Raw height and width of image
        final int height = options.outHeight;
        final int width = options.outWidth;
        int inSampleSize = 1;

        if (height > reqHeight || width > reqWidth) {

            final int halfHeight = height / 2;
            final int halfWidth = width / 2;

            // Calculate the largest inSampleSize value that is a power of 2 and keeps both
            // height and width larger than the requested height and width.
            while ((halfHeight / inSampleSize) >= reqHeight
                    && (halfWidth / inSampleSize) >= reqWidth) {
                inSampleSize *= 2;
            }
        }

        return inSampleSize;
    }

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {

        @Override
        public void onActivityResult(final Activity activity, int requestCode, int resultCode, final Intent data) {
            if (requestCode == IMAGE_PICKER_REQUEST) {
                if (mPickerPromise != null) {
                    if (resultCode == Activity.RESULT_CANCELED) {
                        mPickerPromise.reject(E_PICKER_CANCELLED, "Image picker was cancelled");
                    } else if (resultCode == Activity.RESULT_OK) {
                        final Promise mPromise = mPickerPromise;
                        new Thread(new Runnable() {
                            public void run() {
                                Uri uri = data.getData();
                                InputStream is = null;
                                try {
                                    is = activity.getContentResolver().openInputStream(uri);
                                    long start = System.currentTimeMillis();
                                    // First decode with inJustDecodeBounds=true to check dimensions
                                    final BitmapFactory.Options options = new BitmapFactory.Options();
                                    options.inJustDecodeBounds = true;
                                    BitmapFactory.decodeStream(is, null, options);

                                    // Require the width or height to be at least 200 pixels
                                    int reqWidth = 150, reqHeight = reqWidth;
                                    // Calculate inSampleSize
                                    options.inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight);
                                    // Decode bitmap with inSampleSize set
                                    options.inJustDecodeBounds = false;
                                    is = activity.getContentResolver().openInputStream(uri);
                                    Bitmap bitmap = BitmapFactory.decodeStream(is, null, options);
                                    //options.inPreferredConfig = Bitmap.Config.ARGB_8888;
                                    WritableArray array = new WritableNativeArray();
                                    int width = bitmap.getWidth();
                                    int height = bitmap.getHeight();
                                    int[] pixels = new int[width * height];
                                    bitmap.getPixels(pixels, 0, width, 0, 0, width, height);
                                    Pixel[] pixelArray = new Pixel[pixels.length];
                                    for (int i = 0; i < pixels.length; i++) {
                                        int px = pixels[i];
                                        Pixel pixel = new Pixel();
                                        pixel.r = Color.red(px);
                                        pixel.g = Color.green(px);
                                        pixel.b = Color.blue(px);
                                        pixel.a = Color.alpha(px);
                                        pixel.x = i % width;
                                        pixel.y = i / width;
                                        pixelArray[i] = pixel;
                                    }
                                    is.close();
                                    WritableMap result = edgeDetection(pixelArray);
                                    long end = System.currentTimeMillis();
                                    Log.d("PickImage", Long.toString(end - start));
                                    mPromise.resolve(result);
                                } catch (FileNotFoundException e) {
                                    mPromise.reject(E_NO_IMAGE_DATA_FOUND, "No image data found");
                                    e.printStackTrace();
                                } catch (IOException e) {
                                    mPromise.reject(E_NO_IMAGE_DATA_FOUND, "No image data found");
                                    e.printStackTrace();
                                }
                            }
                        }).start();
                    }

                    mPickerPromise = null;
                }
            }
        }
    };

    public ImagePickerModule(ReactApplicationContext reactContext) {
        super(reactContext);

        // Add the listener for `onActivityResult`
        reactContext.addActivityEventListener(mActivityEventListener);
        mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return "ImagePicker";
    }

    public WritableMap edgeDetection(Pixel[] pixels) {
        // Do the computations in another thread
        int width = pixels[pixels.length - 1].x + 1;
        int height = pixels[pixels.length - 1].y + 1;
        long start = System.currentTimeMillis();
        Result detection_result = EdgeDetection.compute(pixels, width, height);
        long end = System.currentTimeMillis();
        Log.d("EdgeDetection", Long.toString(end - start));
        Pixel[] edges = detection_result.edges;
        Pixel[] boosted = detection_result.boosted;
        // Create bitmap
        Bitmap bitmap = EdgeDetection.createBitmap(boosted, width, height);
        // Convert the bitmap to a base64 string
        ByteArrayOutputStream byteOutputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteOutputStream);
        byte[] byteArray = byteOutputStream.toByteArray();
        String imageBase64 = Base64.encodeToString(byteArray, Base64.DEFAULT);
        WritableArray outArray = new WritableNativeArray();
        for (int i = 0; i < edges.length; i++) {
            Pixel px = edges[i];
            if (px.r > 0 && px.g > 0 && px.b > 0) {
                WritableMap map = new WritableNativeMap();
                map.putInt("x", px.x);
                map.putInt("y", px.y);
                map.putInt("a", (int) px.a);
                map.putInt("r", (int) px.r);
                map.putInt("g", (int) px.g);
                map.putInt("b", (int) px.b);
                outArray.pushMap(map);
            }
        }
        WritableMap result = new WritableNativeMap();
        result.putString("imageBase64", imageBase64);
        result.putArray("edges", outArray);
        return result;
    }

    @ReactMethod
    public void edgeDetection(final Promise promise) {
        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            promise.reject(E_ACTIVITY_DOES_NOT_EXIST, "Activity doesn't exist");
            return;
        }

        // Store the promise to resolve/reject when picker returns data
        mPickerPromise = promise;

        try {
            final Intent galleryIntent = new Intent(Intent.ACTION_PICK);

            galleryIntent.setType("image/*");

            final Intent chooserIntent = Intent.createChooser(galleryIntent, "Pick an image");

            currentActivity.startActivityForResult(chooserIntent, IMAGE_PICKER_REQUEST);
        } catch (Exception e) {
            mPickerPromise.reject(E_FAILED_TO_SHOW_PICKER, e);
            mPickerPromise = null;
        }
    }
}
//                       String[] columns = {MediaStore.Images.ImageColumns.DATA, MediaStore.Images.ImageColumns.ORIENTATION};

//                       Cursor cursor = activity.getContentResolver().query(uri, columns, null, null, null);
//                       cursor.moveToFirst();

//                       int columnIndex = cursor.getColumnIndex(columns[0]);
//                       String filePath = cursor.getString(columnIndex);
//                       File file = new File(activity.getFilesDir(), filePath);
//                       String absolute = file.getAbsolutePath();
//                       cursor.close();
//                               mInputPFD = getContentResolver().openFileDescriptor(returnUri, "r");
//WritableArray outArray=new WritableNativeArray();
//for (int i = 0; i < edges.length; i++) {
//        Pixel px=edges[i];
//        WritableMap map=new WritableNativeMap();
//        map.putInt("x",px.x);
//        map.putInt("y",px.y);
//        map.putDouble("a",px.a);
//        map.putDouble("r",px.r);
//        map.putDouble("b",px.b);
//        map.putDouble("g",px.g);
//        outArray.pushMap(map);
//
//        }
