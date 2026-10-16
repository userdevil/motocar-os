#!/usr/bin/env python3
"""
MotoCar OS Cloud GSI Pipeline Builder
Runs on Ubuntu Linux in GitHub Actions:
1. Dynamically finds and downloads the official TrebleDroid / AOSP ARM64 A/B GSI base.
2. Extracts the filesystem cleanly using read-only loop mount or 7z.
3. Injects compiled native binaries, JNI, MotoCarShell.apk, permissions, and automotive build.prop.
4. Repacks using mke2fs and sparses using img2simg to produce the final universal MotoCar OS system.img.
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
    print(f"[CMD] {cmd}", flush=True)
    res = subprocess.run(cmd, shell=True, cwd=cwd)
    if res.returncode != 0:
        print(f"[ERROR] Command exited with code {res.returncode}: {cmd}", flush=True)
        sys.exit(res.returncode)

def get_latest_gsi_url():
    """Queries GitHub API for the latest release asset of TrebleDroid ARM64 A/B GSI."""
    api_url = "https://api.github.com/repos/TrebleDroid/treble_experimentations/releases/latest"
    req = urllib.request.Request(api_url, headers={"User-Agent": "MotoCarOS-Builder"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            for asset in data.get("assets", []):
                if asset["name"] == "system-td-arm64-ab-vanilla.img.xz":
                    print(f"[*] Found dynamic GSI release asset: {asset['browser_download_url']}", flush=True)
                    return asset["browser_download_url"]
    except Exception as e:
        print(f"[!] Warning: Could not fetch release asset dynamically: {e}", flush=True)
    
    print(f"[*] Using verified release URL: {FALLBACK_GSI_URL}", flush=True)
    return FALLBACK_GSI_URL

def download_file(url, out_path):
    print(f"[*] Downloading base GSI from:\n    {url}", flush=True)
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
    print("\n[+] Download complete!", flush=True)

def main():
    workspace = os.getenv("GITHUB_WORKSPACE", os.getcwd())
    build_dir = os.path.join(workspace, "build_out")
    os.makedirs(build_dir, exist_ok=True)

    print("=================================================================", flush=True)
    print("  MotoCar OS Universal ARM64 Cloud GSI Builder", flush=True)
    print("=================================================================", flush=True)

    # 1. Download official TrebleDroid ARM64 A/B base GSI
    gsi_url = get_latest_gsi_url()
    xz_path = os.path.join(build_dir, "base_system.img.xz")
    raw_img_path = os.path.join(build_dir, "system.raw.img")
    system_tree_dir = os.path.join(build_dir, "system_tree")
    final_sparse_img = os.path.join(build_dir, "system.img")

    download_file(gsi_url, xz_path)

    print("[*] Decompressing XZ archive to raw ext4 image...", flush=True)
    with lzma.open(xz_path, "rb") as f_in, open(raw_img_path, "wb") as f_out:
        shutil.copyfileobj(f_in, f_out)
    os.remove(xz_path)

    raw_size = os.path.getsize(raw_img_path)
    print(f"[+] Raw system.img decompressed: {raw_size:,} bytes", flush=True)

    # 2. Extract filesystem cleanly using read-only loop mount (or 7z fallback)
    os.makedirs(system_tree_dir, exist_ok=True)
    mount_ro_dir = os.path.join(build_dir, "mnt_ro")
    os.makedirs(mount_ro_dir, exist_ok=True)

    print("[*] Extracting system filesystem...", flush=True)
    mount_res = subprocess.run(f"sudo mount -o loop,ro '{raw_img_path}' '{mount_ro_dir}'", shell=True)
    if mount_res.returncode == 0:
        print("[+] Mounted raw image read-only successfully. Copying files to working tree...", flush=True)
        run_cmd(f"sudo cp -a '{mount_ro_dir}'/* '{system_tree_dir}/'")
        run_cmd(f"sudo umount '{mount_ro_dir}'")
    else:
        print("[!] Loop mount failed; falling back to 7z extraction...", flush=True)
        run_cmd(f"7z x '{raw_img_path}' -o'{system_tree_dir}/'")

    # Delete the large base raw image to free disk space
    os.remove(raw_img_path)

    # 3. Locate system directory inside tree
    target_root = system_tree_dir
    if os.path.exists(os.path.join(system_tree_dir, "system")):
        target_root = os.path.join(system_tree_dir, "system")

    print(f"[*] Target system directory: {target_root}", flush=True)

    # 4. Inject MotoCar OS Components
    # MotoCarShell.apk
    privapp_dir = os.path.join(target_root, "priv-app", "MotoCarShell")
    os.makedirs(privapp_dir, exist_ok=True)
    src_apk = os.path.join(workspace, "prebuilts", "app", "MotoCarShell.apk")
    dst_apk = os.path.join(privapp_dir, "MotoCarShell.apk")
    print(f"[*] Copying MotoCarShell.apk -> {dst_apk}", flush=True)
    shutil.copy2(src_apk, dst_apk)
    os.chmod(dst_apk, 0o644)

    # motocar_projection_service
    bin_dir = os.path.join(target_root, "bin")
    os.makedirs(bin_dir, exist_ok=True)
    src_bin = os.path.join(workspace, "prebuilts", "bin", "motocar_projection_service")
    dst_bin = os.path.join(bin_dir, "motocar_projection_service")
    print(f"[*] Copying motocar_projection_service -> {dst_bin}", flush=True)
    shutil.copy2(src_bin, dst_bin)
    os.chmod(dst_bin, 0o755)

    # libmotocar_projection_jni.so
    lib64_dir = os.path.join(target_root, "lib64")
    os.makedirs(lib64_dir, exist_ok=True)
    src_lib = os.path.join(workspace, "prebuilts", "lib64", "libmotocar_projection_jni.so")
    dst_lib = os.path.join(lib64_dir, "libmotocar_projection_jni.so")
    print(f"[*] Copying libmotocar_projection_jni.so -> {dst_lib}", flush=True)
    shutil.copy2(src_lib, dst_lib)
    os.chmod(dst_lib, 0o644)

    # Privileged Permissions
    perm_dir = os.path.join(target_root, "etc", "permissions")
    os.makedirs(perm_dir, exist_ok=True)
    src_perm = os.path.join(workspace, "device", "autodroid", "motocar_display", "permissions", "privapp-permissions-motocar.xml")
    dst_perm = os.path.join(perm_dir, "privapp-permissions-motocar.xml")
    print(f"[*] Copying privapp permissions -> {dst_perm}", flush=True)
    shutil.copy2(src_perm, dst_perm)
    os.chmod(dst_perm, 0o644)

    # Init RC Script
    init_dir = os.path.join(target_root, "etc", "init")
    os.makedirs(init_dir, exist_ok=True)
    src_rc = os.path.join(workspace, "device", "autodroid", "motocar_display", "rootdir", "init.motocar.rc")
    dst_rc = os.path.join(init_dir, "init.motocar.rc")
    print(f"[*] Copying init.motocar.rc -> {dst_rc}", flush=True)
    shutil.copy2(src_rc, dst_rc)
    os.chmod(dst_rc, 0o644)

    # Automotive build.prop
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
    print("[*] Appending automotive configuration to build.prop...", flush=True)
    with open(build_prop_path, "a", encoding="utf-8") as f:
        f.write(automotive_props)

    print("[+] All MotoCar OS components successfully injected into system tree!", flush=True)

    # 5. Pack system tree into new ext4 image using mke2fs
    new_raw_img = os.path.join(build_dir, "motocar_system.raw.img")
    print(f"[*] Repacking system tree into ext4 image: {new_raw_img} (2600 MB)...", flush=True)
    run_cmd(f"sudo mke2fs -t ext4 -b 4096 -d '{system_tree_dir}' -L system '{new_raw_img}' 2600M")

    # 6. Convert raw ext4 to Android sparse image format
    print(f"[*] Converting to Android sparse format: {final_sparse_img}...", flush=True)
    run_cmd(f"img2simg '{new_raw_img}' '{final_sparse_img}'")
    run_cmd(f"sudo rm -f '{new_raw_img}'")

    # 7. Compress sparse image to XZ for release
    xz_release = os.path.join(workspace, "MotoCarOS-Universal-ARM64-v1.0-system.img.xz")
    print(f"[*] Compressing final system image to {xz_release}...", flush=True)
    run_cmd(f"xz -z -T0 -9 -c '{final_sparse_img}' > '{xz_release}'")

    # 8. Create flashable Fastboot ZIP
    zip_release = os.path.join(workspace, "MotoCarOS-Universal-ARM64-v1.0-Fastboot.zip")
    flash_bat = os.path.join(workspace, "flash_device.bat")
    flash_sh = os.path.join(workspace, "flash_device.sh")
    vbmeta = os.path.join(workspace, "prebuilts", "boot", "vbmeta.img")
    boot = os.path.join(workspace, "prebuilts", "boot", "boot.img")

    print(f"[*] Creating flashable fastboot zip: {zip_release}...", flush=True)
    run_cmd(f"zip -j -9 '{zip_release}' '{final_sparse_img}' '{vbmeta}' '{boot}' '{flash_bat}' '{flash_sh}'")

    print("=================================================================", flush=True)
    print("  MotoCar OS Build Complete!", flush=True)
    print(f"  Release Assets Created:")
    print(f"  - {xz_release} ({os.path.getsize(xz_release):,} bytes)", flush=True)
    print(f"  - {zip_release} ({os.path.getsize(zip_release):,} bytes)", flush=True)
    print("=================================================================", flush=True)

if __name__ == "__main__":
    main()
