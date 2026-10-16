/*
 * Copyright (C) 2026 The Android Open Source Project
 * MotoCar OS: Native Service Main Entrypoint
 */

#include "AAPReceiverDaemon.h"
#include <android/log.h>
#include <unistd.h>
#include <csignal>

static autodroid::projection::AAPReceiverDaemon* gDaemon = nullptr;

void signalHandler(int sig) {
    if (gDaemon) {
        gDaemon->stop();
    }
    _exit(sig);
}

int main(int /* argc */, char** /* argv */) {
    __android_log_print(ANDROID_LOG_INFO, "MotoCarProjection", "Starting MotoCar Projection Service...");

    signal(SIGINT, signalHandler);
    signal(SIGTERM, signalHandler);

    autodroid::projection::AAPReceiverDaemon daemon;
    gDaemon = &daemon;

    if (!daemon.init()) {
        __android_log_print(ANDROID_LOG_ERROR, "MotoCarProjection", "Initialization failed!");
        return 1;
    }

    daemon.start();

    // Keep service running in background
    while (true) {
        pause();
    }

    return 0;
}
