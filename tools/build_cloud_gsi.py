#!/usr/bin/env python3
"""
MotoCar OS Cloud GSI Pipeline Builder
Runs on Ubuntu Linux in GitHub Actions:
1. Dynamically finds and downloads the official TrebleDroid / AOSP ARM64 A/B GSI base.
2. Decompresses and resizes the ext4 filesystem.
3. Injects compiled native binaries, JNI, MotoCarShell.apk, permissions, and automotive build.prop.
4. Repacks and sparses the final universal MotoCar OS system.img.
"""

import os
import sys
import json
import subprocess
import urllib.request
import lzma
import shutil

FALLBACK_GSI_URL = "https://github.com/TrebleDroid/treble_experimentations/releases/download/ci-20250415/system-td-arm64-ab-vanilla.img.xz"

def run_cmd(cmd, cwd=None):
    print(f"[CMD] {cmd}")
    res = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[ERROR] Command failed: {cmd}")
        print(f"Stdout:\n{res.stdout}")
        print(f"Stderr:\n{res.stderr}")
        sys.exit(res.returncode)
    return res.stdout

def get_latest_gsi_url():
    """Queries GitHub API for the latest release asset of TrebleDroid ARM64 A/B GSI."""
    api_url = "https://api.github.com/repos/TrebleDroid/treble_experimentations/releases/latest"
    req = urllib.request.Request(api_url, headers={"User-Agent": "MotoCarOS-Builder"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            for asset in data.get("assets", []):
                if asset["name"] == "system-td-arm64-ab-vanilla.img.xz":
                    print(f"[*] Found dynamic GSI release asset: {asset['browser_download_url']}")
                    return asset["browser_download_url"]
    except Exception as e:
        print(f"[!] Warning: Could not fetch release asset dynamically: {e}")
    
    print(f"[*] Using verified release URL: {FALLBACK_GSI_URL}")
    return FALLBACK_GSI_URL

def download_file(url, out_path):
    print(f"[*] Downloading base GSI from:\n    {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"})
    with urllib.request.urlopen(req) as resp, open(out_path, "wb") as f_out:
        total = int(resp.headers.get("Content-Length", 0))
        downloaded = 0
        while chunk := resp.read(1024 * 1024 * 8):
            f_out.write(chunk)
            downloaded += len(chunk)
            if total > 0:
                percent = (downloaded / total) * 100
                print(f"\r    {downloaded / (1024*1024):.1f} MB / {total / (1024*1024):.1f} MB ({percent:.1f}%)", end="", flush=True)
            else:
                print(f"\r    {downloaded / (1024*1024):.1f} MB downloaded", end="", flush=True)
    print("\n[+] Download complete!")

def main():
    workspace = os.getenv("GITHUB_WORKSPACE", os.getcwd())
    build_dir = os.path.join(workspace, "build_out")
    os.makedirs(build_dir, exist_ok=True)

    print("=================================================================")
    print("  MotoCar OS Universal ARM64 Cloud GSI Builder")
    print("=================================================================")

    # 1. Download official TrebleDroid ARM64 A/B base GSI
    gsi_url = get_latest_gsi_url()
    xz_path = os.path.join(build_dir, "base_system.img.xz")
    raw_img_path = os.path.join(build_dir, "system.raw.img")
    final_sparse_img = os.path.join(build_dir, "system.img")

    download_file(gsi_url, xz_path)

    print("[*] Decompressing XZ archive to raw ext4 image...")
    with lzma.open(xz_path, "rb") as f_in, open(raw_img_path, "wb") as f_out:
        shutil.copyfileobj(f_in, f_out)
    os.remove(xz_path)

    print(f"[+] Raw system.img ready: {os.path.getsize(raw_img_path):,} bytes")

    # 2. Resize filesystem using resize2fs to give space for MotoCar components (+100MB)
    run_cmd(f"e2fsck -y -f '{raw_img_path}' || true")
    run_cmd(f"resize2fs '{raw_img_path}' 2800M")

    # 3. Mount filesystem locally via loop mount
    mount_dir = os.path.join(build_dir, "mnt_system")
    os.makedirs(mount_dir, exist_ok=True)

    print(f"[*] Mounting system image at {mount_dir}...")
    run_cmd(f"sudo mount -o loop,rw '{raw_img_path}' '{mount_dir}'")

    try:
        # Check system directory structure (some GSIs have /system or are rootfs)
        target_root = mount_dir
        if os.path.exists(os.path.join(mount_dir, "system")):
            target_root = os.path.join(mount_dir, "system")

        print(f"[*] Target system directory: {target_root}")

        # Inject MotoCar Shell System APK
        privapp_dir = os.path.join(target_root, "priv-app", "MotoCarShell")
        os.makedirs(privapp_dir, exist_ok=True)
        src_apk = os.path.join(workspace, "prebuilts", "app", "MotoCarShell.apk")
        dst_apk = os.path.join(privapp_dir, "MotoCarShell.apk")
        print(f"[*] Copying MotoCarShell.apk -> {dst_apk}")
        shutil.copy2(src_apk, dst_apk)
        run_cmd(f"sudo chmod 644 '{dst_apk}'")

        # Inject Native Projection Daemon (ARM64 ELF)
        bin_dir = os.path.join(target_root, "bin")
        os.makedirs(bin_dir, exist_ok=True)
        src_bin = os.path.join(workspace, "prebuilts", "bin", "motocar_projection_service")
        dst_bin = os.path.join(bin_dir, "motocar_projection_service")
        print(f"[*] Copying motocar_projection_service -> {dst_bin}")
        shutil.copy2(src_bin, dst_bin)
        run_cmd(f"sudo chmod 755 '{dst_bin}'")

        # Inject JNI Shared Library (ARM64 ELF)
        lib64_dir = os.path.join(target_root, "lib64")
        os.makedirs(lib64_dir, exist_ok=True)
        src_lib = os.path.join(workspace, "prebuilts", "lib64", "libmotocar_projection_jni.so")
        dst_lib = os.path.join(lib64_dir, "libmotocar_projection_jni.so")
        print(f"[*] Copying libmotocar_projection_jni.so -> {dst_lib}")
        shutil.copy2(src_lib, dst_lib)
        run_cmd(f"sudo chmod 644 '{dst_lib}'")

        # Inject Privileged Permissions XML
        perm_dir = os.path.join(target_root, "etc", "permissions")
        os.makedirs(perm_dir, exist_ok=True)
        src_perm = os.path.join(workspace, "device", "autodroid", "motocar_display", "permissions", "privapp-permissions-motocar.xml")
        dst_perm = os.path.join(perm_dir, "privapp-permissions-motocar.xml")
        print(f"[*] Copying privapp permissions -> {dst_perm}")
        shutil.copy2(src_perm, dst_perm)
        run_cmd(f"sudo chmod 644 '{dst_perm}'")

        # Inject Init RC Script
        init_dir = os.path.join(target_root, "etc", "init")
        os.makedirs(init_dir, exist_ok=True)
        src_rc = os.path.join(workspace, "device", "autodroid", "motocar_display", "rootdir", "init.motocar.rc")
        dst_rc = os.path.join(init_dir, "init.motocar.rc")
        print(f"[*] Copying init.motocar.rc -> {dst_rc}")
        shutil.copy2(src_rc, dst_rc)
        run_cmd(f"sudo chmod 644 '{dst_rc}'")

        # Configure Automotive Properties in build.prop
        build_prop_path = os.path.join(target_root, "build.prop")
        automotive_props = (
            "\n# --- MotoCar OS Automotive System Properties ---\n"
            "ro.build.display.id=MotoCar-OS-v1.0-Universal-Treble-ARM64\n"
            "ro.product.brand=MotoCar\n"
            "ro.product.model=Universal Automotive HeadUnit\n"
            "ro.setupwizard.mode=DISABLED\n"
            "config.disable_lockscreen=true\n"
            "persist.sys.phh.autorotate=true\n"
            "persist.sys.motocar.bike_mode=true\n"
            "bluetooth.profile.a2dp.sink.enabled=true\n"
            "bluetooth.profile.hfp.hf.enabled=true\n"
            "persist.bluetooth.enablesink=true\n"
            "ro.audio.silent=0\n"
            "sys.usb.config=accessory,adb\n"
            "persist.sys.usb.config=accessory,adb\n"
            "# ------------------------------------------------\n"
        )
        print("[*] Appending automotive configuration to build.prop...")
        with open(build_prop_path, "a", encoding="utf-8") as f:
            f.write(automotive_props)

        print("[+] All MotoCar OS system components injected successfully!")

    finally:
        print("[*] Unmounting system image...")
        run_cmd(f"sudo umount '{mount_dir}'")
        run_cmd(f"e2fsck -y -f '{raw_img_path}' || true")

    # 4. Convert raw ext4 image to Android sparse image using img2simg
    print(f"[*] Converting raw image to Android sparse format: {final_sparse_img}...")
    run_cmd(f"img2simg '{raw_img_path}' '{final_sparse_img}'")
    os.remove(raw_img_path)

    # 5. Compress to XZ for release
    xz_release = os.path.join(workspace, "MotoCarOS-Universal-ARM64-v1.0-system.img.xz")
    print(f"[*] Compressing final image to {xz_release}...")
    run_cmd(f"xz -z -T0 -9 -c '{final_sparse_img}' > '{xz_release}'")

    # 6. Bundle Fastboot ZIP package
    zip_release = os.path.join(workspace, "MotoCarOS-Universal-ARM64-v1.0-Fastboot.zip")
    flash_bat = os.path.join(workspace, "flash_device.bat")
    flash_sh = os.path.join(workspace, "flash_device.sh")
    vbmeta = os.path.join(workspace, "prebuilts", "boot", "vbmeta.img")
    boot = os.path.join(workspace, "prebuilts", "boot", "boot.img")

    print(f"[*] Creating flashable fastboot zip: {zip_release}...")
    run_cmd(f"zip -j -9 '{zip_release}' '{final_sparse_img}' '{vbmeta}' '{boot}' '{flash_bat}' '{flash_sh}'")

    print("=================================================================")
    print("  MotoCar OS Build Complete!")
    print(f"  Release Assets Created:")
    print(f"  - {xz_release} ({os.path.getsize(xz_release):,} bytes)")
    print(f"  - {zip_release} ({os.path.getsize(zip_release):,} bytes)")
    print("=================================================================")

if __name__ == "__main__":
    main()
