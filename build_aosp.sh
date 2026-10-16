#!/usr/bin/env bash
#
# Copyright (C) 2026 The Android Open Source Project
# MotoCar OS: AOSP Build Orchestration Script
#

set -e

echo "=========================================================="
echo "      Building MotoCar OS (Bike & Car Head Unit)         "
echo "=========================================================="

if [ -z "$ANDROID_BUILD_TOP" ]; then
    echo "[-] Sourcing AOSP build environment..."
    if [ -f "build/envsetup.sh" ]; then
        source build/envsetup.sh
    else
        echo "[!] Error: build/envsetup.sh not found. Run this from your AOSP root."
        exit 1
    fi
fi

TARGET_LUNCH="motocar_display-userdebug"
echo "[+] Selecting lunch target: ${TARGET_LUNCH}"
lunch "${TARGET_LUNCH}"

NPROC=$(nproc 2>/dev/null || echo 8)
echo "[+] Building target images with ${NPROC} parallel jobs..."
m -j"${NPROC}" \
    motocar_projection_service \
    MotoCarShell \
    bootimage \
    superimage

echo "=========================================================="
echo "      Build Completed Successfully!                      "
echo "  Artifacts available in: \$OUT                          "
echo "  Run ./flash_device.sh to deploy to connected device.   "
echo "=========================================================="
