package com.tracker.TrackHandler;

import android.telecom.Call;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.tracker.Database.ConnectDatabase;
import com.tracker.Database.DatabaseHandler;
import com.tracker.Database.IAsync;
import com.tracker.Database.Point;
import com.tracker.Database.Track;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by david on 12/30/16.
 */

public class TrackHandlerModule extends ReactContextBaseJavaModule implements IAsync, LifecycleEventListener {
    private Callback mResultCallback;
    private DatabaseHandler db;

    public TrackHandlerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addLifecycleEventListener(this);
        new ConnectDatabase(this).execute(getReactApplicationContext());
    }

    @Override
    public String getName() {
        return "TrackHandler";
    }

    @ReactMethod
    public void getPoints(String name, Callback c) {
        List<Point> list = db.getPoints(name);
        WritableArray array = new WritableNativeArray();
        for (Point point : list) {
            WritableMap map = new WritableNativeMap();
            map.putDouble("x", point.getX());
            map.putDouble("y", point.getY());
            array.pushMap(map);
        }
        c.invoke(array);
    }

    @ReactMethod
    public void getTracks(Callback c) {
        List<Track> list = db.getAllTracks();
        WritableArray array = new WritableNativeArray();
        for (Track track : list) {
            WritableMap map = new WritableNativeMap();
            map.putDouble("latitude", track.getLatitude());
            map.putDouble("longitude", track.getLongitude());
            map.putDouble("rotation", track.getRotation());
            map.putDouble("scale", track.getScale());
            map.putString("name", track.getName());
            array.pushMap(map);
        }
        c.invoke(array);
    }

    @ReactMethod
    public void createTrack(ReadableMap obj, Callback callback) {
        mResultCallback = callback;
        List<Point> points = new ArrayList<>();
        String name = obj.getString("name");
        double latitude = obj.getDouble("latitude");
        double longitude = obj.getDouble("longitude");
        ReadableArray array = obj.getArray("points");
        for (int i = 0; i < array.size(); i++) {
            ReadableMap map = array.getMap(i);
            double x = map.getDouble("x");
            double y = map.getDouble("y");
            points.add(new Point(x, y));
        }
        db.insertTrack(name, latitude, longitude);
        db.insertPoints(name, points);
        callback.invoke();
    }

    @ReactMethod
    public void updateLocation(String name, double latitude, double longitude) {
        db.updateLocation(name, latitude, longitude);
    }

    @ReactMethod
    public void updateRotation(String name, double rotation) {
        db.updateRotation(name, rotation);
    }

    @ReactMethod
    public void updateScale(String name, double scale) {
        db.updateScale(name, scale);
    }

    @ReactMethod
    public void removeTrack(String name, Callback c) {
        db.deleteTrack(name);
        c.invoke();
    }

    @Override
    public void onHostResume() {
        if (db == null) {
            new ConnectDatabase(this).execute(getReactApplicationContext());
        }
    }

    @Override
    public void onHostPause() {
        if (db != null) {
            db.close();
            db = null;
        }
    }

    @Override
    public void onHostDestroy() {
        if (db != null) {
            db.close();
            db = null;
        }
    }

    @Override
    public void onFinished(Object obj) {
        db = (DatabaseHandler) obj;
    }
}
