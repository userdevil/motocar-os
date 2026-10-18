/*
 * Copyright (C) 2026 The Android Open Source Project
 * MotoCar OS Automotive Shell & Dedicated Head Unit Activity (Bike & Car)
 * Reference: https://source.android.com/docs/automotive
 */

package com.autodroid.motocar;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.Surface;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class MainActivity extends Activity implements SurfaceHolder.Callback {

    private SurfaceView surfaceView;
    private View waitingOverlay;
    private Button btnOrientationMode;
    private TextView txtPhoneBattery;

    private enum OrientationLock {
        AUTO_SENSOR,
        LOCKED_PORTRAIT,
        LOCKED_LANDSCAPE
    }

    private OrientationLock currentOrientationLock = OrientationLock.AUTO_SENSOR;
    private static boolean isNativeLoaded = false;

    static {
        try {
            System.loadLibrary("motocar_projection_jni");
            isNativeLoaded = true;
        } catch (Throwable e) {
            isNativeLoaded = false;
        }
    }

    public static native void nativeSetSurface(Surface surface);
    public static native void nativeInjectTouch(int x, int y, int action);
    public static native void nativeUpdateDimensions(int width, int height, boolean isLandscape);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        surfaceView = findViewById(R.id.projection_surface);
        waitingOverlay = findViewById(R.id.waiting_overlay);
        btnOrientationMode = findViewById(R.id.btn_orientation_mode);
        txtPhoneBattery = findViewById(R.id.txt_phone_battery);

        surfaceView.getHolder().addCallback(this);
        enableImmersiveMode();
        setupOrientationToggle();
        updateOrientationMode(getResources().getConfiguration().orientation);
    }

    @Override
    protected void onResume() {
        super.onResume();
        enableImmersiveMode();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        updateOrientationMode(newConfig.orientation);
    }

    private void setupOrientationToggle() {
        if (btnOrientationMode != null) {
            btnOrientationMode.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    switch (currentOrientationLock) {
                        case AUTO_SENSOR:
                            currentOrientationLock = OrientationLock.LOCKED_PORTRAIT;
                            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
                            break;
                        case LOCKED_PORTRAIT:
                            currentOrientationLock = OrientationLock.LOCKED_LANDSCAPE;
                            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
                            break;
                        case LOCKED_LANDSCAPE:
                            currentOrientationLock = OrientationLock.AUTO_SENSOR;
                            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
                            break;
                    }
                    updateOrientationMode(getResources().getConfiguration().orientation);
                }
            });
        }
    }

    private void updateOrientationMode(int orientation) {
        boolean isLandscape = (orientation == Configuration.ORIENTATION_LANDSCAPE);
        String modePrefix = "AUTO";
        if (currentOrientationLock == OrientationLock.LOCKED_PORTRAIT ||
            currentOrientationLock == OrientationLock.LOCKED_LANDSCAPE) {
            modePrefix = "LOCKED";
        }

        if (btnOrientationMode != null) {
            if (isLandscape) {
                btnOrientationMode.setText("BIKE/CAR: " + modePrefix + " LANDSCAPE (16:9)");
                btnOrientationMode.setTextColor(0xFF34D399);
            } else {
                btnOrientationMode.setText("BIKE: " + modePrefix + " PORTRAIT (9:16)");
                btnOrientationMode.setTextColor(0xFF38BDF8);
            }
        }

        if (isNativeLoaded) {
            int width = isLandscape ? 1920 : 1080;
            int height = isLandscape ? 1080 : 1920;
            try {
                nativeUpdateDimensions(width, height, isLandscape);
            } catch (Throwable ignored) {}
        }
    }

    private void enableImmersiveMode() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
        );
    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        if (isNativeLoaded) {
            try {
                nativeSetSurface(holder.getSurface());
                boolean isLandscape = (getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE);
                int width = isLandscape ? 1920 : 1080;
                int height = isLandscape ? 1080 : 1920;
                nativeUpdateDimensions(width, height, isLandscape);
            } catch (Throwable ignored) {}
        }
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
        if (isNativeLoaded) {
            boolean isLandscape = (width >= height);
            try {
                nativeUpdateDimensions(width, height, isLandscape);
            } catch (Throwable ignored) {}
        }
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        if (isNativeLoaded) {
            try {
                nativeSetSurface(null);
            } catch (Throwable ignored) {}
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        if (isNativeLoaded) {
            int action = -1;
            switch (event.getActionMasked()) {
                case MotionEvent.ACTION_DOWN:
                    action = 0;
                    break;
                case MotionEvent.ACTION_UP:
                    action = 1;
                    break;
                case MotionEvent.ACTION_MOVE:
                    action = 2;
                    break;
            }
            if (action >= 0) {
                try {
                    nativeInjectTouch((int) event.getX(), (int) event.getY(), action);
                } catch (Throwable ignored) {}
            }
        }
        return true;
    }

    public void onPhoneConnected() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (waitingOverlay != null) {
                    waitingOverlay.setVisibility(View.GONE);
                }
            }
        });
    }

    public void onPhoneDisconnected() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (waitingOverlay != null) {
                    waitingOverlay.setVisibility(View.VISIBLE);
                }
            }
        });
    }
}
