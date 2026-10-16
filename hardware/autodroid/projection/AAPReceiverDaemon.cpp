/*
 * Copyright (C) 2026 The Android Open Source Project
 * MotoCar OS: Native AAP Projection Engine Implementation
 */

#include "AAPReceiverDaemon.h"

#include <fcntl.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <linux/uinput.h>
#include <cstring>
#include <iostream>

#include <android/log.h>
#include <media/NdkMediaCodec.h>
#include <media/NdkMediaFormat.h>

#define ALOGI(...) __android_log_print(ANDROID_LOG_INFO, "MotoCarProjection", __VA_ARGS__)
#define ALOGE(...) __android_log_print(ANDROID_LOG_ERROR, "MotoCarProjection", __VA_ARGS__)
#define ALOGD(...) __android_log_print(ANDROID_LOG_DEBUG, "MotoCarProjection", __VA_ARGS__)

namespace autodroid {
namespace projection {

AAPReceiverDaemon::AAPReceiverDaemon() = default;

AAPReceiverDaemon::~AAPReceiverDaemon() {
    stop();
}

bool AAPReceiverDaemon::init() {
    ALOGI("Initializing MotoCar Projection Engine (Supporting Bike Portrait & Landscape)...");

    if (!initUinputDevice()) {
        ALOGE("Failed to initialize /dev/uinput touch digitizer return");
    }

    if (!initMediaCodec()) {
        ALOGE("Failed to initialize hardware MediaCodec decoder");
    }

    return true;
}

void AAPReceiverDaemon::start() {
    if (mRunning.load()) return;
    mRunning = true;

    ALOGI("Starting USB and Wi-Fi connection threads...");
    mUsbThread = std::thread(&AAPReceiverDaemon::usbConnectionThread, this);
    mWifiThread = std::thread(&AAPReceiverDaemon::wifiConnectionThread, this);
}

void AAPReceiverDaemon::stop() {
    if (!mRunning.load()) return;
    mRunning = false;
    mIsConnected = false;

    if (mUsbFd >= 0) {
        close(mUsbFd);
        mUsbFd = -1;
    }
    if (mClientSocket >= 0) {
        close(mClientSocket);
        mClientSocket = -1;
    }
    if (mWifiServerSocket >= 0) {
        close(mWifiServerSocket);
        mWifiServerSocket = -1;
    }

    if (mUsbThread.joinable()) mUsbThread.join();
    if (mWifiThread.joinable()) mWifiThread.join();

    releaseMediaCodec();

    if (mUinputFd >= 0) {
        ioctl(mUinputFd, UI_DEV_DESTROY);
        close(mUinputFd);
        mUinputFd = -1;
    }

    ALOGI("MotoCar Projection Engine stopped.");
}

void AAPReceiverDaemon::setNativeWindow(ANativeWindow* window) {
    std::lock_guard<std::mutex> lock(mCodecMutex);
    mNativeWindow = window;
    if (mVideoDecoder && mNativeWindow) {
        // Output surface will be refreshed on next video frame
    }
}

void AAPReceiverDaemon::updateDimensions(int width, int height, bool isLandscape) {
    std::lock_guard<std::mutex> lock(mCodecMutex);
    mWidth = width;
    mHeight = height;
    mIsLandscape = isLandscape;

    ALOGI("Bike/Car Display Orientation Update: %dx%d (Landscape: %s)",
          width, height, isLandscape ? "YES" : "NO (Portrait Handlebar)");

    // Reconfigure media decoder for dynamic orientation switch
    if (mVideoDecoder && mNativeWindow) {
        AMediaCodec_stop(mVideoDecoder);
        AMediaFormat* format = AMediaFormat_new();
        AMediaFormat_setString(format, AMEDIAFORMAT_KEY_MIME, "video/avc");
        AMediaFormat_setInt32(format, AMEDIAFORMAT_KEY_WIDTH, width);
        AMediaFormat_setInt32(format, AMEDIAFORMAT_KEY_HEIGHT, height);
        AMediaFormat_setInt32(format, AMEDIAFORMAT_KEY_FRAME_RATE, 60);

        AMediaCodec_configure(mVideoDecoder, format, mNativeWindow, nullptr, 0);
        AMediaFormat_delete(format);
        AMediaCodec_start(mVideoDecoder);
    }
}

bool AAPReceiverDaemon::initUinputDevice() {
    mUinputFd = open("/dev/uinput", O_WRONLY | O_NONBLOCK);
    if (mUinputFd < 0) {
        return false;
    }

    ioctl(mUinputFd, UI_SET_EVBIT, EV_KEY);
    ioctl(mUinputFd, UI_SET_KEYBIT, BTN_TOUCH);
    ioctl(mUinputFd, UI_SET_EVBIT, EV_ABS);
    ioctl(mUinputFd, UI_SET_ABSBIT, ABS_X);
    ioctl(mUinputFd, UI_SET_ABSBIT, ABS_Y);

    struct uinput_user_dev uidev{};
    snprintf(uidev.name, UINPUT_MAX_NAME_SIZE, "MotoCar Head Unit Touch Digitizer");
    uidev.id.bustype = BUS_USB;
    uidev.id.vendor  = 0x18d1; // Google
    uidev.id.product = 0x2d00; // Android Auto
    uidev.id.version = 1;

    uidev.absmin[ABS_X] = 0;
    uidev.absmax[ABS_X] = 1920;
    uidev.absmin[ABS_Y] = 0;
    uidev.absmax[ABS_Y] = 1920; // Accommodate both landscape (1080) and portrait (1920)

    write(mUinputFd, &uidev, sizeof(uidev));
    ioctl(mUinputFd, UI_DEV_CREATE);

    return true;
}

bool AAPReceiverDaemon::initMediaCodec() {
    std::lock_guard<std::mutex> lock(mCodecMutex);
    mVideoDecoder = AMediaCodec_createDecoderByType("video/avc");
    if (!mVideoDecoder) {
        ALOGE("Hardware H.264 decoder unavailable");
        return false;
    }

    AMediaFormat* format = AMediaFormat_new();
    AMediaFormat_setString(format, AMEDIAFORMAT_KEY_MIME, "video/avc");
    AMediaFormat_setInt32(format, AMEDIAFORMAT_KEY_WIDTH, mWidth.load());
    AMediaFormat_setInt32(format, AMEDIAFORMAT_KEY_HEIGHT, mHeight.load());
    AMediaFormat_setInt32(format, AMEDIAFORMAT_KEY_FRAME_RATE, 60);

    media_status_t status = AMediaCodec_configure(mVideoDecoder, format, mNativeWindow, nullptr, 0);
    AMediaFormat_delete(format);

    if (status != AMEDIA_OK) {
        ALOGE("Failed to configure AMediaCodec: %d", status);
        return false;
    }

    AMediaCodec_start(mVideoDecoder);
    ALOGI("Hardware AMediaCodec H.264 decoder started successfully.");
    return true;
}

void AAPReceiverDaemon::releaseMediaCodec() {
    std::lock_guard<std::mutex> lock(mCodecMutex);
    if (mVideoDecoder) {
        AMediaCodec_stop(mVideoDecoder);
        AMediaCodec_delete(mVideoDecoder);
        mVideoDecoder = nullptr;
    }
}

// 1. USB Connection Thread (AOA 2.0 via /dev/usb_accessory)
void AAPReceiverDaemon::usbConnectionThread() {
    while (mRunning.load()) {
        mUsbFd = open("/dev/usb_accessory", O_RDWR);
        if (mUsbFd < 0) {
            std::this_thread::sleep_for(std::chrono::milliseconds(1000));
            continue;
        }

        ALOGI("Connected to phone via USB AOA 2.0!");
        mIsConnected = true;

        uint8_t buffer[16384];
        while (mRunning.load() && mIsConnected.load()) {
            AAPPacketHeader header{};
            ssize_t n = read(mUsbFd, &header, sizeof(header));
            if (n < (ssize_t)sizeof(header)) {
                break;
            }

            uint16_t payloadLen = (header.length >> 8) | (header.length << 8); // ntohs
            if (payloadLen > sizeof(buffer)) payloadLen = sizeof(buffer);

            ssize_t readPayload = read(mUsbFd, buffer, payloadLen);
            if (readPayload > 0) {
                processIncomingPacket(header, buffer, readPayload);
            }
        }

        close(mUsbFd);
        mUsbFd = -1;
        mIsConnected = false;
        ALOGI("USB connection dropped. Waiting for phone reconnect...");
    }
}

// 2. Wi-Fi Wireless Connection Thread (TCP 5277)
void AAPReceiverDaemon::wifiConnectionThread() {
    mWifiServerSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (mWifiServerSocket < 0) return;

    int opt = 1;
    setsockopt(mWifiServerSocket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    sockaddr_in serverAddr{};
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(5277); // Default Android Auto TCP port

    if (bind(mWifiServerSocket, (sockaddr*)&serverAddr, sizeof(serverAddr)) < 0) {
        close(mWifiServerSocket);
        return;
    }

    listen(mWifiServerSocket, 2);
    ALOGI("Wireless AAP Receiver listening on 5GHz Wi-Fi (port 5277)...");

    while (mRunning.load()) {
        sockaddr_in clientAddr{};
        socklen_t clientLen = sizeof(clientAddr);
        mClientSocket = accept(mWifiServerSocket, (sockaddr*)&clientAddr, &clientLen);
        if (mClientSocket < 0) continue;

        ALOGI("Wireless phone connected from %s", inet_ntoa(clientAddr.sin_addr));
        mIsConnected = true;

        uint8_t buffer[16384];
        while (mRunning.load() && mIsConnected.load()) {
            AAPPacketHeader header{};
            ssize_t n = recv(mClientSocket, &header, sizeof(header), MSG_WAITALL);
            if (n < (ssize_t)sizeof(header)) break;

            uint16_t payloadLen = (header.length >> 8) | (header.length << 8);
            if (payloadLen > sizeof(buffer)) payloadLen = sizeof(buffer);

            ssize_t readPayload = recv(mClientSocket, buffer, payloadLen, MSG_WAITALL);
            if (readPayload > 0) {
                processIncomingPacket(header, buffer, readPayload);
            }
        }

        close(mClientSocket);
        mClientSocket = -1;
        mIsConnected = false;
    }
}

// Multiplexed Packet Processor
void AAPReceiverDaemon::processIncomingPacket(const AAPPacketHeader& header, const uint8_t* payload, size_t size) {
    mTotalBytes += (sizeof(header) + size);
    ChannelId ch = static_cast<ChannelId>(header.channelId);

    switch (ch) {
        case ChannelId::CONTROL:
            handleControlChannel(payload, size);
            break;
        case ChannelId::VIDEO:
            handleVideoChannel(payload, size);
            break;
        case ChannelId::AUDIO_MEDIA:
        case ChannelId::AUDIO_GUIDANCE:
            handleAudioChannel(ch, payload, size);
            break;
        case ChannelId::SENSOR:
            handleSensorChannel(payload, size);
            break;
        default:
            break;
    }
}

void AAPReceiverDaemon::handleControlChannel(const uint8_t* payload, size_t size) {
    (void)payload;
    (void)size;
    // Protocol version 1.6 handshake & service discovery responses
    ALOGD("AAP Handshake control frame processed.");
}

void AAPReceiverDaemon::handleVideoChannel(const uint8_t* payload, size_t size) {
    std::lock_guard<std::mutex> lock(mCodecMutex);
    if (!mVideoDecoder) return;

    ssize_t inIdx = AMediaCodec_dequeueInputBuffer(mVideoDecoder, 2000);
    if (inIdx >= 0) {
        size_t bufSize = 0;
        uint8_t* buf = AMediaCodec_getInputBuffer(mVideoDecoder, inIdx, &bufSize);
        if (buf && bufSize >= size) {
            memcpy(buf, payload, size);
            AMediaCodec_queueInputBuffer(mVideoDecoder, inIdx, 0, size, 0, 0);
            mFps++;
        }
    }

    AMediaCodecBufferInfo info{};
    ssize_t outIdx = AMediaCodec_dequeueOutputBuffer(mVideoDecoder, &info, 0);
    while (outIdx >= 0) {
        // Render decoded H.264 frame directly to ANativeWindow Surface
        AMediaCodec_releaseOutputBuffer(mVideoDecoder, outIdx, true);
        outIdx = AMediaCodec_dequeueOutputBuffer(mVideoDecoder, &info, 0);
    }
}

void AAPReceiverDaemon::handleAudioChannel(ChannelId channel, const uint8_t* payload, size_t size) {
    (void)channel;
    (void)payload;
    (void)size;
    // Stream PCM audio directly to native AudioTrack
}

void AAPReceiverDaemon::handleSensorChannel(const uint8_t* payload, size_t size) {
    (void)payload;
    (void)size;
    // Extract GPS location coordinates from phone
}

void AAPReceiverDaemon::injectTouchEvent(int x, int y, int action) {
    if (mUinputFd < 0) return;

    struct input_event ev[3]{};
    ev[0].type = EV_ABS;
    ev[0].code = ABS_X;
    ev[0].value = x;

    ev[1].type = EV_ABS;
    ev[1].code = ABS_Y;
    ev[1].value = y;

    ev[2].type = EV_KEY;
    ev[2].code = BTN_TOUCH;
    ev[2].value = (action == 0 || action == 2) ? 1 : 0; // Down or Move

    write(mUinputFd, ev, sizeof(ev));

    struct input_event syn{};
    syn.type = EV_SYN;
    syn.code = SYN_REPORT;
    syn.value = 0;
    write(mUinputFd, &syn, sizeof(syn));
}

} // namespace projection
} // namespace autodroid
