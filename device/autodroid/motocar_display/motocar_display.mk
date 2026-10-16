#
# Copyright (C) 2026 The Android Open Source Project
# MotoCar OS: High-Performance Head Unit for Bike & Car
#

# Inherit from Android Automotive base
$(call inherit-product, packages/services/Car/car_product/build/car.mk)

# Inherit device specifications
$(call inherit-product, $(LOCAL_DIR)/device.mk)

PRODUCT_NAME := motocar_display
PRODUCT_DEVICE := motocar_display
PRODUCT_BRAND := AutoDroid
PRODUCT_MODEL := MotoCar Smart Head Unit (Bike & Car)
PRODUCT_MANUFACTURER := AutoDroid

# System Properties for MotoCar Display
PRODUCT_SYSTEM_PROPERTIES += \
    ro.product.model="MotoCar Head Unit" \
    ro.product.brand="AutoDroid" \
    persist.sys.usb.config=accessory,adb \
    persist.sys.motocar.mode=adaptive \
    persist.sys.motocar.rotation=auto \
    persist.sys.motocar.high_contrast=true \
    ro.sf.lcd_density=320 \
    ro.audio.silent=0 \
    ro.hardware.motocar=true
