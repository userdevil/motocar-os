#
# Copyright (C) 2026 The Android Open Source Project
# MotoCar OS Device Inclusions & HALs
#

LOCAL_PATH := device/autodroid/motocar_display

# Rootdir scripts
PRODUCT_COPY_FILES += \
    $(LOCAL_PATH)/rootdir/init.motocar.rc:$(TARGET_COPY_OUT_VENDOR)/etc/init/init.motocar.rc \
    $(LOCAL_PATH)/rootdir/ueventd.motocar.rc:$(TARGET_COPY_OUT_VENDOR)/etc/ueventd.motocar.rc

# Audio policy configuration (multi-zone + helmet BT intercom routing)
PRODUCT_COPY_FILES += \
    $(LOCAL_PATH)/audio/audio_policy_configuration.xml:$(TARGET_COPY_OUT_VENDOR)/etc/audio_policy_configuration.xml

# Hardware Features & Permissions
PRODUCT_COPY_FILES += \
    frameworks/native/data/etc/android.hardware.usb.accessory.xml:$(TARGET_COPY_OUT_VENDOR)/etc/permissions/android.hardware.usb.accessory.xml \
    frameworks/native/data/etc/android.hardware.usb.host.xml:$(TARGET_COPY_OUT_VENDOR)/etc/permissions/android.hardware.usb.host.xml \
    frameworks/native/data/etc/android.hardware.wifi.xml:$(TARGET_COPY_OUT_VENDOR)/etc/permissions/android.hardware.wifi.xml \
    frameworks/native/data/etc/android.hardware.wifi.direct.xml:$(TARGET_COPY_OUT_VENDOR)/etc/permissions/android.hardware.wifi.direct.xml \
    frameworks/native/data/etc/android.hardware.bluetooth.xml:$(TARGET_COPY_OUT_VENDOR)/etc/permissions/android.hardware.bluetooth.xml \
    frameworks/native/data/etc/android.hardware.bluetooth_le.xml:$(TARGET_COPY_OUT_VENDOR)/etc/permissions/android.hardware.bluetooth_le.xml \
    frameworks/native/data/etc/android.hardware.touchscreen.multitouch.jazzhand.xml:$(TARGET_COPY_OUT_VENDOR)/etc/permissions/android.hardware.touchscreen.multitouch.jazzhand.xml \
    frameworks/native/data/etc/android.hardware.location.gps.xml:$(TARGET_COPY_OUT_VENDOR)/etc/permissions/android.hardware.location.gps.xml

# Core Product Packages
PRODUCT_PACKAGES += \
    motocar_projection_service \
    MotoCarShell \
    android.hardware.audio.service \
    android.hardware.bluetooth-service.default \
    android.hardware.wifi-service \
    wpa_supplicant \
    hostapd

# Enable AOA 2.0 USB Accessory
PRODUCT_CHARACTERISTICS := automotive
