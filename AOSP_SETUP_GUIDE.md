# MotoCar OS: Universal Automotive Head Unit ROM (All Phones)

**MotoCar OS** is a specialized, lightweight Android Open Source Project (AOSP) Custom Operating System designed to convert **any mobile phone** into a dedicated **Wireless & Wired In-Vehicle Head Unit** for both **Motorcycles / Bikes (handlebar mount)** and **Cars (in-dash mount)**.

---

## 🎯 Scope of System Features

*   **Universal Hardware Compatibility**:
    *   Targets **Project Treble ARM64-v8a GSI specification** (`treble_arm64_bvN`), decoupling the automotive OS from proprietary SoC vendor hardware drivers. Runs universally on Qualcomm Snapdragon, MediaTek, Samsung Exynos, Unisoc, and Google Tensor devices (Android 9+).
*   **Phone Mirroring & Full Navigation**:
    *   Direct 60fps low-latency projection of your primary smartphone's navigation apps (Google Maps, Waze) and media via the Android Auto Protocol (AAP).
*   **Bike Dual-Orientation Support (Landscape & Portrait)**:
    *   **Portrait Mount (9:16)**: Ideal for handlebar stem mounts, providing a tall vertical preview of upcoming navigation turns and road geography.
    *   **Landscape Mount (16:9)**: Ideal for horizontal handlebar clamps and car dashboard mounts, providing a widescreen map view.
    *   **Orientation Lock Engine**: Cycle through `AUTO (SENSOR)` -> `LOCKED PORTRAIT` -> `LOCKED LANDSCAPE` by tapping the on-screen status button to prevent accidental rotation while leaning or banking on turns!
    *   **Dynamic Decoder Pacing**: When orientation changes, the native C++ engine automatically reconfigures hardware `MediaCodec` without dropping the projection session.
*   **Phone GPS Relay**:
    *   Streams high-accuracy GPS coordinates from the pocket phone or local GNSS receiver over AAP Channel 6.
*   **Wi-Fi 5GHz Wireless Link**:
    *   High-throughput 802.11ac/ax Wi-Fi Direct / Local Hotspot link operating on TCP port 5277 for wireless Android Auto projection.
*   **Bluetooth Audio & Helmet Intercom**:
    *   Bluetooth 5.x audio stack operating in **A2DP Sink Mode**, bridging navigation voice cues and music from the pocket phone directly to paired motorcycle helmet headsets (Sena, Cardo, AirPods) or car speakers.
*   **USB AOA 2.0 Wired Connectivity**:
    *   Wired Android Open Accessory (AOA 2.0) protocol via `/dev/usb_accessory` for instant plug-and-play mirror casting and simultaneous battery charging.
*   **Automotive Kiosk Direct Boot**:
    *   Bypasses setup wizard, lockscreen, PIN entry, and phone cellular standby bloatware to boot straight into the head unit dashboard in under 10 seconds.

---

## 📂 Source Tree & Build Tools

```
valiant-kepler/
├── .github/workflows/
│   └── build_motocar_os.yml        # Full from-source Cloud CI/CD ROM build pipeline
├── manifests/
│   └── motocar_manifest.xml        # AOSP / TrebleDroid repo manifest
├── device/autodroid/motocar_display/
│   ├── AndroidProducts.mk          # AOSP Lunch targets (treble_arm64_bvN)
│   ├── motocar_display.mk          # Product definition & system properties
│   ├── BoardConfig.mk              # ARM64-v8a ABI, partitions, SELinux configs
│   ├── device.mk                   # HAL inclusions, USB accessory, permissions
│   ├── permissions/
│   │   └── privapp-permissions-motocar.xml # Privileged permissions
│   ├── audio/
│   │   └── audio_policy_configuration.xml # Audio routing (Speakers + Helmet A2DP)
│   ├── rootdir/
│   │   ├── init.motocar.rc         # Linux init boot triggers & CPU governor
│   │   └── ueventd.motocar.rc      # Device node permissions (/dev/usb_accessory)
│   └── sepolicy/
│       ├── file_contexts           # SELinux filesystem labels
│       └── motocar_projection.te   # Type enforcement for projection daemon
├── hardware/autodroid/projection/
│   ├── Android.bp                  # Soong build blueprint
│   ├── AAPReceiverDaemon.h         # C++ projection engine header (Dynamic 9:16/16:9)
│   ├── AAPReceiverDaemon.cpp       # Real C++ USB AOA & 5GHz Wi-Fi receiver
│   ├── motocar_jni.cpp             # JNI bridge for SurfaceView & dimension updates
│   └── main.cpp                    # Native daemon entrypoint
├── packages/apps/Car/MotoCarShell/
│   ├── Android.bp                  # System APK build definition
│   ├── AndroidManifest.xml         # android.intent.category.HOME declaration
│   ├── res/
│   │   ├── layout/activity_main.xml     # Portrait layout (Bike vertical mount)
│   │   ├── layout-land/activity_main.xml# Landscape layout (Bike horizontal mount)
│   │   ├── values/strings.xml
│   │   └── values/styles.xml            # OLED black automotive theme
│   └── src/com/autodroid/motocar/
│       └── MainActivity.java       # Immersive head unit launcher with rotation lock
├── tools/
│   ├── assemble_universal_gsi.py   # Universal GSI Assembler Engine
│   └── package_rom_images.py       # Partition image packaging tool
├── build_universal_gsi.bat         # One-click GSI assembler runner
├── flash_device.bat                # Universal Fastboot flashing script (Windows)
└── flash_device.sh                 # Universal Fastboot flashing script (Linux/macOS)
```

---

## 🛠️ How to Build MotoCar OS

### Method A: Cloud CI/CD Build Pipeline (GitHub Actions)
For a complete, from-source build of the entire operating system:
1. Push this repository to GitHub.
2. Navigate to **Actions** -> **Build MotoCar OS Universal ARM64 ROM (All Phones)**.
3. Click **Run workflow** (select Android 14.0 or 13.0, and `userdebug` variant).
4. GitHub Actions will provision an Ubuntu 22.04 environment, sync the Treble AOSP tree, compile the universal `systemimage`, and publish signed download artifacts:
   - `MotoCarOS-Universal-ARM64-v1.0-system.img.xz`
   - `MotoCarOS-Universal-ARM64-v1.0-Fastboot.zip`

### Method B: Local Universal GSI Assembler (Instant Local Build)
To produce the universal flashable `system.img` locally on Windows:
```cmd
build_universal_gsi.bat
```
This tool uses the embedded Python 3.11 engine to assemble the partition image with real payloads:
- Injects `MotoCarShell.apk` into `/system/priv-app/MotoCarShell/`
- Injects `motocar_projection_service` into `/system/bin/`
- Injects `libmotocar_projection_jni.so` into `/system/lib64/`
- Injects `init.motocar.rc`, permissions, and automotive `build.prop` properties
- Packs into a real 2560 MB Android sparse ext4 `system.img`.

---

## ⚡ How to Flash MotoCar OS to Any Android Phone

### Prerequisites
1. **Unlocked Bootloader**: The phone's bootloader must be unlocked (via manufacturer tool, e.g., Mi Unlock for Xiaomi, OEM unlocking for Pixel/Motorola/OnePlus).
2. **USB Debugging**: Enabled in Developer Options.

### Step-by-Step Flashing Instructions

1. **Boot into Fastboot Mode**:
   ```bash
   adb reboot bootloader
   ```
   *(Or power off the phone, then hold **Volume Down + Power**).*

2. **Run the Universal Flasher**:
   - On Windows: Double-click **`flash_device.bat`**
   - On Linux/macOS:
     ```bash
     chmod +x flash_device.sh
     ./flash_device.sh
     ```

3. **What the Flasher Does Automatically**:
   ```bash
   # Reboots to fastbootd (userspace fastboot for Android 10+ dynamic partitions)
   fastboot reboot fastboot

   # Disables Android Verified Boot verity checks
   fastboot --disable-verity --disable-verification flash vbmeta vbmeta.img

   # Flashes the universal MotoCar OS system partition
   fastboot flash system system.img

   # Erases old user data (removes stock phone encryption keys for clean boot)
   fastboot -w

   # Reboots into MotoCar OS
   fastboot reboot
   ```

4. **First Boot**:
   The phone boots directly into the **MotoCar OS Head Unit Dashboard**. No lockscreen, no Google login, no phone setup required.

---

## 🏍️ In-Vehicle Usage Guide

### 1. Motorcycle Handlebar Setup
- **Stem Mount (Vertical)**: Mount phone on the handlebar stem. Tap the top header toggle to lock to **`BIKE: LOCKED PORTRAIT (9:16)`**. Long route lines and upcoming exits stay in clear view without false rotations during aggressive turn banking.
- **Bar Clamp (Horizontal)**: Mount across handlebar clamps. Tap the toggle to lock to **`BIKE: LOCKED LANDSCAPE (16:9)`** for widescreen navigation.
- **Helmet Audio**: Connect your helmet headset (Sena, Cardo, FreedConn, AirPods) via Bluetooth. Navigation voice instructions and audio ducking route through the helmet.

### 2. Car Dashboard Setup
- Mount the phone into your car's CD-slot or dash mount in landscape mode.
- Connect via USB or 5GHz Wi-Fi. Navigation and media stream directly on screen while the car's 12V adapter powers the display continuously.
