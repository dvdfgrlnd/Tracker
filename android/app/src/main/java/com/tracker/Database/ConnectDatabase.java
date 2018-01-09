package com.tracker.Database;

import android.content.Context;
import android.os.AsyncTask;

/**
 * Created by david on 12/17/16.
 */

public class ConnectDatabase extends AsyncTask<Context, Integer, DatabaseHandler> {
    private IAsync callback;
    public ConnectDatabase(IAsync callback) {
        this.callback = callback;
    }

    @Override
    protected DatabaseHandler doInBackground(Context... params) {
        DatabaseHandler dbHandler = new DatabaseHandler(params[0]);
        return dbHandler;
    }

    protected void onPostExecute(DatabaseHandler handler) {
        callback.onFinished(handler);
    }
}
