/*
 * Copyright (C) 2026 The Android Open Source Project
 * MotoCar OS: Native AAP Projection Engine Header (Bike & Car)
 */

#ifndef MOTOCAR_AAP_RECEIVER_DAEMON_H
#define MOTOCAR_AAP_RECEIVER_DAEMON_H

#include <cstdint>
#include <string>
#include <vector>
#include <thread>
#include <atomic>
#include <mutex>

// Android NDK Media & Window Types
struct AMediaCodec;
struct ANativeWindow;

namespace autodroid {
namespace projection {

// Android Auto Protocol (AAP) Standard Channel IDs
enum class ChannelId : uint8_t {
    CONTROL = 0,
    AUDIO_MEDIA = 1,
    AUDIO_GUIDANCE = 2,
    AUDIO_MIC = 3,
    INPUT = 4,
    VIDEO = 5,
    SENSOR = 6,
    BLUETOOTH = 7
};

// Protocol Flags
constexpr uint8_t FLAG_FIRST_FRAME = 0x01;
constexpr uint8_t FLAG_LAST_FRAME  = 0x02;
constexpr uint8_t FLAG_CONTROL_MSG = 0x04;
constexpr uint8_t FLAG_ENCRYPTED   = 0x08;

#pragma pack(push, 1)
struct AAPPacketHeader {
    uint8_t  channelId;
    uint8_t  flags;
    uint16_t length; // Big-endian
};
#pragma pack(pop)

class AAPReceiverDaemon {
public:
    AAPReceiverDaemon();
    ~AAPReceiverDaemon();

    bool init();
    void start();
    void stop();

    // Touch digitizer return back to phone
    void injectTouchEvent(int x, int y, int action);

    // Set output native window surface
    void setNativeWindow(ANativeWindow* window);

    // Dynamic resolution and orientation updates (Bike Portrait 9:16 vs Landscape 16:9)
    void updateDimensions(int width, int height, bool isLandscape);

    bool isConnected() const { return mIsConnected.load(); }
    uint32_t getReceivedFps() const { return mFps.load(); }
    bool isLandscape() const { return mIsLandscape.load(); }

private:
    void usbConnectionThread();
    void wifiConnectionThread();
    void processIncomingPacket(const AAPPacketHeader& header, const uint8_t* payload, size_t size);

    // Channel Handlers
    void handleControlChannel(const uint8_t* payload, size_t size);
    void handleVideoChannel(const uint8_t* payload, size_t size);
    void handleAudioChannel(ChannelId channel, const uint8_t* payload, size_t size);
    void handleSensorChannel(const uint8_t* payload, size_t size);

    // Hardware Decoders & uinput
    bool initMediaCodec();
    void releaseMediaCodec();
    bool initUinputDevice();

    std::atomic<bool> mRunning{false};
    std::atomic<bool> mIsConnected{false};
    std::atomic<bool> mIsLandscape{true};
    std::atomic<int> mWidth{1920};
    std::atomic<int> mHeight{1080};
    std::atomic<uint32_t> mFps{0};
    std::atomic<uint64_t> mTotalBytes{0};

    int mUsbFd{-1};
    int mUinputFd{-1};
    int mWifiServerSocket{-1};
    int mClientSocket{-1};

    AMediaCodec* mVideoDecoder{nullptr};
    ANativeWindow* mNativeWindow{nullptr};

    std::thread mUsbThread;
    std::thread mWifiThread;
    std::mutex mCodecMutex;
};

} // namespace projection
} // namespace autodroid

#endif // MOTOCAR_AAP_RECEIVER_DAEMON_H
