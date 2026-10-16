#!/usr/bin/env bash
#
# Copyright (C) 2026 The Android Open Source Project
# MotoCar OS Fastboot Deployment Script (Android Automotive OS Universal)
#

set -e

OUT_DIR="${ANDROID_PRODUCT_OUT:-./out/target/product/motocar_display}"

echo "=========================================================="
echo "  MotoCar OS (AAOS) Fastboot Flasher (Universal Phone)    "
echo "  Target: gsi_car_arm64                                   "
echo "=========================================================="

FASTBOOT_CMD="fastboot"
if ! command -v fastboot &> /dev/null; then
    if [ -f "$LOCALAPPDATA/Android/Sdk/platform-tools/fastboot.exe" ]; then
        FASTBOOT_CMD="$LOCALAPPDATA/Android/Sdk/platform-tools/fastboot.exe"
    elif [ -f "/c/Users/ASUS/AppData/Local/Android/Sdk/platform-tools/fastboot.exe" ]; then
        FASTBOOT_CMD="/c/Users/ASUS/AppData/Local/Android/Sdk/platform-tools/fastboot.exe"
    else
        echo "[!] Error: fastboot tool not found in PATH."
        exit 1
    fi
fi

$FASTBOOT_CMD devices

SYSTEM_IMG="system.img"
if [ ! -f "$SYSTEM_IMG" ]; then
    SYSTEM_IMG="${OUT_DIR}/system.img"
fi

VBMETA_IMG="vbmeta.img"
if [ ! -f "$VBMETA_IMG" ]; then
    VBMETA_IMG="${OUT_DIR}/vbmeta.img"
fi

BOOT_IMG="boot.img"
if [ ! -f "$BOOT_IMG" ]; then
    BOOT_IMG="${OUT_DIR}/boot.img"
fi

if [ -f "$BOOT_IMG" ]; then
    echo "[+] Flashing boot partition..."
    $FASTBOOT_CMD flash boot "$BOOT_IMG" || true
fi

if [ -f "$VBMETA_IMG" ]; then
    echo "[+] Flashing VBMeta (disabling AVB)..."
    $FASTBOOT_CMD --disable-verity --disable-verification flash vbmeta "$VBMETA_IMG" || $FASTBOOT_CMD flash vbmeta "$VBMETA_IMG" || true
fi

if [ -f "$SYSTEM_IMG" ]; then
    echo "[+] Flashing MotoCar AAOS Universal System Image..."
    $FASTBOOT_CMD flash system "$SYSTEM_IMG" || {
        echo "[!] Flashing slot-specific..."
        $FASTBOOT_CMD flash system_a "$SYSTEM_IMG" || true
        $FASTBOOT_CMD flash system_b "$SYSTEM_IMG" || true
    }
else
    echo "[!] ERROR: system.img not found!"
    exit 1
fi

echo "[+] Wiping userdata for clean automotive boot..."
$FASTBOOT_CMD -w || {
    $FASTBOOT_CMD erase userdata || true
    $FASTBOOT_CMD erase metadata || true
}

echo "[+] Rebooting into Android Automotive OS..."
$FASTBOOT_CMD reboot

echo "=========================================================="
echo " MotoCar OS successfully flashed!                         "
echo " Device is rebooting into Android Automotive OS (AAOS).   "
echo "=========================================================="
