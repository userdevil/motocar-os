#
# Copyright (C) 2026 The Android Open Source Project
# Android Automotive OS (AAOS) Generic System Image for ARM64 Phones
# Reference: https://source.android.com/docs/automotive
#

# 1. Inherit common base configurations for automotive GSIs
$(call inherit-product, device/generic/car/common/car.mk)

# 2. Inherit generic ARM64 Treble GSI target definitions
$(call inherit-product, $(SRC_TARGET_DIR)/product/gsi_arm64.mk)

# 3. Inherit MotoCar display and head unit customizations
$(call inherit-product, device/autodroid/motocar_display/motocar_display.mk)

PRODUCT_NAME := gsi_car_arm64
PRODUCT_DEVICE := generic_arm64
PRODUCT_BRAND := Android
PRODUCT_MODEL := MotoCar AAOS Universal Head Unit (ARM64)
PRODUCT_MANUFACTURER := AutoDroid

# Operating System Characteristic
PRODUCT_CHARACTERISTICS := automotive
PRODUCT_IS_AUTOMOTIVE := true
