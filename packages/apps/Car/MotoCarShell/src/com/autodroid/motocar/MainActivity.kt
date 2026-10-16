/*
 * Copyright (C) 2026 The Android Open Source Project
 * MotoCar OS: Main Head Unit Activity (Bike Landscape & Portrait Support)
 */

package com.autodroid.motocar

import android.app.Activity
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.hardware.usb.UsbAccessory
import android.hardware.usb.UsbManager
import android.os.Bundle
import android.view.MotionEvent
import android.view.Surface
import android.view.SurfaceHolder
import android.view.SurfaceView
import android.view.View
import android.widget.Button
import android.widget.TextView

class MainActivity : Activity(), SurfaceHolder.Callback {

    private lateinit var surfaceView: SurfaceView
    private lateinit var waitingOverlay: View
    private lateinit var btnOrientationMode: Button
    private lateinit var txtPhoneBattery: TextView

    private enum class OrientationLock {
        AUTO_SENSOR,
        LOCKED_PORTRAIT,
        LOCKED_LANDSCAPE
    }

    private var currentOrientationLock = OrientationLock.AUTO_SENSOR

    companion object {
        init {
            // Load native projection engine library
            try {
                System.loadLibrary("motocar_projection_jni")
            } catch (e: UnsatisfiedLinkError) {
                // Standalone or mock fallback
            }
        }

        @JvmStatic
        external fun nativeSetSurface(surface: Surface?)

        @JvmStatic
        external fun nativeInjectTouch(x: Int, y: Int, action: Int)

        @JvmStatic
        external fun nativeUpdateDimensions(width: Int, height: Int, isLandscape: Boolean)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        surfaceView = findViewById(R.id.projection_surface)
        waitingOverlay = findViewById(R.id.waiting_overlay)
        btnOrientationMode = findViewById(R.id.btn_orientation_mode)
        txtPhoneBattery = findViewById(R.id.txt_phone_battery)

        surfaceView.holder.addCallback(this)
        enableImmersiveMode()
        setupOrientationToggle()
        updateOrientationMode(resources.configuration.orientation)
    }

    override fun onResume() {
        super.onResume()
        enableImmersiveMode()
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        updateOrientationMode(newConfig.orientation)
    }

    private fun setupOrientationToggle() {
        btnOrientationMode.setOnClickListener {
            // Cycle between Auto-Sensor -> Lock Portrait -> Lock Landscape
            when (currentOrientationLock) {
                OrientationLock.AUTO_SENSOR -> {
                    currentOrientationLock = OrientationLock.LOCKED_PORTRAIT
                    requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
                }
                OrientationLock.LOCKED_PORTRAIT -> {
                    currentOrientationLock = OrientationLock.LOCKED_LANDSCAPE
                    requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
                }
                OrientationLock.LOCKED_LANDSCAPE -> {
                    currentOrientationLock = OrientationLock.AUTO_SENSOR
                    requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
                }
            }
            updateOrientationMode(resources.configuration.orientation)
        }
    }

    private fun updateOrientationMode(orientation: Int) {
        val isLandscape = orientation == Configuration.ORIENTATION_LANDSCAPE
        val modePrefix = when (currentOrientationLock) {
            OrientationLock.AUTO_SENSOR -> "AUTO"
            OrientationLock.LOCKED_PORTRAIT -> "LOCKED"
            OrientationLock.LOCKED_LANDSCAPE -> "LOCKED"
        }

        if (isLandscape) {
            btnOrientationMode.text = "BIKE/CAR: $modePrefix LANDSCAPE (16:9)"
            btnOrientationMode.setTextColor(0xFF34D399.toInt())
        } else {
            btnOrientationMode.text = "BIKE: $modePrefix PORTRAIT (9:16)"
            btnOrientationMode.setTextColor(0xFF38BDF8.toInt())
        }

        // Notify native projection decoder
        val width = if (isLandscape) 1920 else 1080
        val height = if (isLandscape) 1080 else 1920
        try {
            nativeUpdateDimensions(width, height, isLandscape)
        } catch (e: Exception) {}
    }

    private fun enableImmersiveMode() {
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN
        )
    }

    // SurfaceHolder Callbacks
    override fun surfaceCreated(holder: SurfaceHolder) {
        try {
            nativeSetSurface(holder.surface)
            val isLandscape = resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE
            val width = if (isLandscape) 1920 else 1080
            val height = if (isLandscape) 1080 else 1920
            nativeUpdateDimensions(width, height, isLandscape)
        } catch (e: Exception) {}
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        val isLandscape = width >= height
        try {
            nativeUpdateDimensions(width, height, isLandscape)
        } catch (e: Exception) {}
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        try {
            nativeSetSurface(null)
        } catch (e: Exception) {}
    }

    // Touch digitizer injection returning screen taps back to the phone
    override fun onTouchEvent(event: MotionEvent): Boolean {
        val action = when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> 0
            MotionEvent.ACTION_UP -> 1
            MotionEvent.ACTION_MOVE -> 2
            else -> -1
        }
        if (action >= 0) {
            try {
                nativeInjectTouch(event.x.toInt(), event.y.toInt(), action)
            } catch (e: Exception) {}
        }
        return true
    }

    fun onPhoneConnected() {
        runOnUiThread {
            waitingOverlay.visibility = View.GONE
        }
    }

    fun onPhoneDisconnected() {
        runOnUiThread {
            waitingOverlay.visibility = View.VISIBLE
        }
    }
}
