package com.tracker.Database;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.provider.BaseColumns;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by david on 12/17/16.
 */

public final class DatabaseHandler {
    private SQLiteDatabase db;

    public DatabaseHandler(Context context) {
        DbHelper mDbHelper = new DbHelper(context);
        // Gets the data repository in write mode
        db = mDbHelper.getWritableDatabase();
    }

    public ArrayList<Track> getAllTracks() {
        db.beginTransaction();
        Cursor cursor = db.rawQuery(Entry.SELECT_TRACKS, null);
        ArrayList<Track> list = parseTracks(cursor);
        db.setTransactionSuccessful();
        db.endTransaction();
        return list;
    }

    public ArrayList<Point> getPoints(String name) {
        db.beginTransaction();
        Cursor cursor = db.rawQuery(Entry.SELECT_POINTS, new String[]{name});
        ArrayList<Point> list = parsePoints(cursor);
        db.setTransactionSuccessful();
        db.endTransaction();
        return list;
    }

    private ArrayList<Point> parsePoints(Cursor cursor) {
        Point point;
        ArrayList<Point> list = new ArrayList<>();
        cursor.moveToFirst();
        while (!cursor.isAfterLast()) {
            point = new Point();
            // Set application name
            point.setX(cursor.getDouble(cursor.getColumnIndex(Entry.X)));
            point.setY(cursor.getDouble(cursor.getColumnIndex(Entry.Y)));
            // Add app to list
            list.add(point);
            // Move to next row in result table
            cursor.moveToNext();
        }
        // IMPORTANT! Close cursor to avoid memory leak
        cursor.close();
        return list;
    }

    private ArrayList<Track> parseTracks(Cursor cursor) {
        Track track;
        ArrayList<Track> list = new ArrayList<>();
        cursor.moveToFirst();
        while (!cursor.isAfterLast()) {
            track = new Track();
            // Set application name
            track.setName(cursor.getString(cursor.getColumnIndex(Entry.NAME)));
            track.setLatitude(cursor.getDouble(cursor.getColumnIndex(Entry.LATITUDE)));
            track.setLongitude(cursor.getDouble(cursor.getColumnIndex(Entry.LONGITUDE)));
            track.setRotation(cursor.getDouble(cursor.getColumnIndex(Entry.ROTATION)));
            track.setScale(cursor.getDouble(cursor.getColumnIndex(Entry.SCALE)));
            // Add app to list
            list.add(track);
            // Move to next row in result table
            cursor.moveToNext();
        }
        // IMPORTANT! Close cursor to avoid memory leak
        cursor.close();
        return list;
    }


    public void insertTrack(String name, double latitude, double longitude) {
        db.beginTransaction();
        Object[] args = {
                name,
                latitude,
                longitude
        };
        db.execSQL(Entry.INSERT_TRACK_STATEMENT, args);
        db.setTransactionSuccessful();
        db.endTransaction();
    }

    public void insertPoints(String name, List<Point> points) {
        db.beginTransaction();
        for (Point point : points) {
            Object[] args = {
                    name,
                    point.getX(),
                    point.getY(),
            };
            db.execSQL(Entry.INSERT_POINT_STATEMENT, args);
        }
        db.setTransactionSuccessful();
        db.endTransaction();
    }

    public void updateScale(String name, double scale) {
        Object[] args = {scale, name};
        db.beginTransaction();
        db.execSQL(Entry.UPDATE_SCALE, args);
        db.setTransactionSuccessful();
        db.endTransaction();
    }

    public void updateRotation(String name, double rotation) {
        Object[] args = {rotation, name};
        db.beginTransaction();
        db.execSQL(Entry.UPDATE_ROTATION, args);
        db.setTransactionSuccessful();
        db.endTransaction();
    }

    public void updateLocation(String name, double latitude, double longitude) {
        Object[] args = {latitude, longitude, name};
        db.beginTransaction();
        db.execSQL(Entry.UPDATE_LOCATION, args);
        db.setTransactionSuccessful();
        db.endTransaction();
    }

    public void deleteTrack(String name) {
        String[] args = {name};
        db.beginTransaction();
        db.execSQL(Entry.DELETE_TRACK, args);
        db.execSQL(Entry.DELETE_POINTS, args);
        db.setTransactionSuccessful();
        db.endTransaction();
    }

    public void close() {
        if (db != null) {
            db.close();
        }
    }

    /* Inner class that defines the table contents */
    public static abstract class Entry implements BaseColumns {
        static final String NAME = "name";
        static final String LATITUDE = "latitude";
        static final String LONGITUDE = "longitude";
        static final String SCALE = "scale";
        static final String ROTATION = "rotation";
        static final String X = "x";
        static final String Y = "y";


        public static final String INSERT_TRACK_STATEMENT = "INSERT INTO " + DbHelper.TRACK_TABLE_NAME + " (" + NAME + "," + LATITUDE + "," + LONGITUDE + ") VALUES (?, ?, ?)";

        public static final String INSERT_POINT_STATEMENT = "INSERT INTO " + DbHelper.POINT_TABLE_NAME + " (" + NAME + "," + X + "," + Y + ") VALUES (?, ?, ?)";

        public static final String UPDATE_SCALE = "UPDATE " + DbHelper.TRACK_TABLE_NAME + " SET " + SCALE + "=? WHERE " + NAME + "=?";

        public static final String UPDATE_ROTATION = "UPDATE " + DbHelper.TRACK_TABLE_NAME + " SET " + ROTATION + "=? WHERE " + NAME + "=?";

        public static final String UPDATE_LOCATION = "UPDATE " + DbHelper.TRACK_TABLE_NAME + " SET " + LATITUDE + "=?," + LONGITUDE + "=? WHERE " + NAME + "=?";

        public static final String SELECT_POINTS = "SELECT " + X + "," + Y + " FROM " + DbHelper.POINT_TABLE_NAME + " WHERE " + Entry.NAME + "=?";

        public static final String SELECT_TRACKS = "SELECT * FROM " + DbHelper.TRACK_TABLE_NAME;

        public static final String DELETE_TRACK = "DELETE FROM " + DbHelper.TRACK_TABLE_NAME + " WHERE " + Entry.NAME + "=?";
        public static final String DELETE_POINTS = "DELETE FROM " + DbHelper.POINT_TABLE_NAME + " WHERE " + Entry.NAME + "=?";

    }

    public class DbHelper extends SQLiteOpenHelper {
        // If you change the database schema, you must increment the database version.
        public static final int DATABASE_VERSION = 3;
        public static final String DATABASE_NAME = "FeedReader.db";
        public static final String POINT_TABLE_NAME = "points";
        public static final String TRACK_TABLE_NAME = "tracks";
        private static final String TEXT_TYPE = " TEXT";
        private static final String REAL_TYPE = " REAL";
        private static final String SQL_CREATE_TRACK_TABLE =
                "CREATE TABLE " + TRACK_TABLE_NAME + " (" +
                        Entry.NAME + TEXT_TYPE + "," +
                        Entry.LATITUDE + REAL_TYPE + "," +
                        Entry.LONGITUDE + REAL_TYPE + "," +
                        Entry.SCALE + REAL_TYPE + "," +
                        Entry.ROTATION + REAL_TYPE + "," +
                        "PRIMARY KEY (" + Entry.NAME + "))";
        private static final String SQL_CREATE_POINT_TABLE =
                "CREATE TABLE " + POINT_TABLE_NAME + " (" +
                        Entry.NAME + TEXT_TYPE + "," +
                        Entry.X + REAL_TYPE + "," +
                        Entry.Y + REAL_TYPE + ")";

        private static final String SQL_DELETE_TRACK_ENTRIES = "DROP TABLE IF EXISTS " + TRACK_TABLE_NAME;
        private static final String SQL_DELETE_POINT_ENTRIES = "DROP TABLE IF EXISTS " + POINT_TABLE_NAME;

        public DbHelper(Context context) {
            super(context, DATABASE_NAME, null, DATABASE_VERSION);
        }

        public void onCreate(SQLiteDatabase db) {
            db.beginTransaction();
            db.execSQL(SQL_CREATE_POINT_TABLE);
            db.execSQL(SQL_CREATE_TRACK_TABLE);
            db.setTransactionSuccessful();
            db.endTransaction();
        }

        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
            // This database is only a cache for online data, so its upgrade policy is
            // to simply to discard the data and start over
            db.beginTransaction();
            db.execSQL(SQL_DELETE_POINT_ENTRIES);
            db.execSQL(SQL_DELETE_TRACK_ENTRIES);
            onCreate(db);
            db.setTransactionSuccessful();
            db.endTransaction();
        }

        public void onDowngrade(SQLiteDatabase db, int oldVersion, int newVersion) {
            onUpgrade(db, oldVersion, newVersion);
        }
    }

}
