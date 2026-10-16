#!/usr/bin/env bash
#
# Copyright (C) 2026 The Android Open Source Project
# MotoCar OS Fastboot Deployment Script
#

set -e

OUT_DIR="${ANDROID_PRODUCT_OUT:-./out/target/product/motocar_display}"

echo "=========================================================="
echo "      MotoCar OS Fastboot Flasher (Bike & Car)           "
echo "=========================================================="

echo "[*] Checking for connected Fastboot devices..."
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

echo "[+] Target firmware directory: ${OUT_DIR}"

if [ -f "${OUT_DIR}/boot.img" ]; then
    echo "[+] Flashing boot partition (Kernel & Init)..."
    $FASTBOOT_CMD flash boot "${OUT_DIR}/boot.img"
fi

if [ -f "${OUT_DIR}/dtbo.img" ]; then
    echo "[+] Flashing DTBO partition..."
    $FASTBOOT_CMD flash dtbo "${OUT_DIR}/dtbo.img"
fi

if [ -f "${OUT_DIR}/vbmeta.img" ]; then
    echo "[+] Flashing VBMeta (Disabling verification for custom ROM)..."
    $FASTBOOT_CMD --disable-verity --disable-verification flash vbmeta "${OUT_DIR}/vbmeta.img"
fi

if [ -f "${OUT_DIR}/super.img" ]; then
    echo "[+] Flashing dynamic super partition (system, vendor, product)..."
    $FASTBOOT_CMD flash super "${OUT_DIR}/super.img"
fi

echo "[+] Wiping userdata for clean automotive boot..."
$FASTBOOT_CMD erase userdata
$FASTBOOT_CMD erase cache

echo "[+] Rebooting into MotoCar OS..."
$FASTBOOT_CMD reboot

echo "=========================================================="
echo " MotoCar OS successfully flashed!                         "
echo " Device will boot into dedicated Head Unit Shell.         "
echo "=========================================================="
