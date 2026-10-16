#
# Copyright (C) 2026 The Android Open Source Project
# MotoCar OS Device Inclusions & Automotive HALs
# Reference: https://source.android.com/docs/automotive
#

LOCAL_PATH := device/autodroid/motocar_display

# Rootdir scripts
PRODUCT_COPY_FILES += \
    $(LOCAL_PATH)/rootdir/init.motocar.rc:$(TARGET_COPY_OUT_SYSTEM)/etc/init/init.motocar.rc \
    $(LOCAL_PATH)/rootdir/ueventd.motocar.rc:$(TARGET_COPY_OUT_SYSTEM)/etc/ueventd.motocar.rc

# Audio policy configuration (multi-zone automotive ducking + helmet BT intercom routing)
PRODUCT_COPY_FILES += \
    $(LOCAL_PATH)/audio/audio_policy_configuration.xml:$(TARGET_COPY_OUT_SYSTEM)/etc/audio_policy_configuration.xml

# Official Android Automotive OS (AAOS) Core Hardware Permissions
PRODUCT_COPY_FILES += \
    $(LOCAL_PATH)/permissions/car_core_hardware.xml:$(TARGET_COPY_OUT_SYSTEM)/etc/permissions/car_core_hardware.xml \
    $(LOCAL_PATH)/permissions/privapp-permissions-motocar.xml:$(TARGET_COPY_OUT_SYSTEM)/etc/permissions/privapp-permissions-motocar.xml

# Core Product Packages compiled natively into AAOS
PRODUCT_PACKAGES += \
    motocar_projection_service \
    MotoCarShell \
    android.hardware.audio.service \
    android.hardware.bluetooth-service.default \
    android.hardware.wifi-service \
    wpa_supplicant \
    hostapd

# Operating System Characteristic
PRODUCT_CHARACTERISTICS := automotive
PRODUCT_IS_AUTOMOTIVE := true
