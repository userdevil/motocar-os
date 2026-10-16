/*
 * Copyright (C) 2026 The Android Open Source Project
 * MotoCar OS JNI Bridge (Bike & Car Orientation Support)
 */

#include <jni.h>
#include <android/native_window_jni.h>
#include "AAPReceiverDaemon.h"

static autodroid::projection::AAPReceiverDaemon gDaemon;

extern "C" {

JNIEXPORT void JNICALL
Java_com_autodroid_motocar_MainActivity_nativeSetSurface(JNIEnv* env, jclass /* clazz */, jobject surface) {
    if (surface != nullptr) {
        ANativeWindow* window = ANativeWindow_fromSurface(env, surface);
        gDaemon.setNativeWindow(window);
    } else {
        gDaemon.setNativeWindow(nullptr);
    }
}

JNIEXPORT void JNICALL
Java_com_autodroid_motocar_MainActivity_nativeInjectTouch(JNIEnv* /* env */, jclass /* clazz */, jint x, jint y, jint action) {
    gDaemon.injectTouchEvent(x, y, action);
}

JNIEXPORT void JNICALL
Java_com_autodroid_motocar_MainActivity_nativeUpdateDimensions(JNIEnv* /* env */, jclass /* clazz */, jint width, jint height, jboolean isLandscape) {
    gDaemon.updateDimensions(width, height, isLandscape == JNI_TRUE);
}

} // extern "C"
