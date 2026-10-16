@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo       Deploying MotoCar OS to Connected Phone
echo ========================================================

set ADB="%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
if not exist %ADB% (
    set ADB=adb
)

echo [*] Checking for connected Android device via ADB...
%ADB% devices

%ADB% get-state >nul 2>&1
if errorlevel 1 (
    echo [!] No Android device found. Please connect your phone via USB with USB Debugging enabled.
    pause
    exit /b 1
)

echo [+] Installing MotoCar OS Shell APK (Default Home Launcher)...
%ADB% install -r -g "out\target\product\motocar_display\system\priv-app\MotoCarShell\MotoCarShell.apk"

echo [+] Granting Permissions (Location/GPS, Wi-Fi, Bluetooth)...
%ADB% shell pm grant com.autodroid.motocar android.permission.ACCESS_FINE_LOCATION
%ADB% shell pm grant com.autodroid.motocar android.permission.ACCESS_COARSE_LOCATION
%ADB% shell pm grant com.autodroid.motocar android.permission.BLUETOOTH_CONNECT

echo [+] Pushing native ARM64 projection engine binary...
%ADB% root >nul 2>&1
%ADB% remount >nul 2>&1
%ADB% push "out\target\product\motocar_display\vendor\bin\hw\motocar_projection_service" /data/local/tmp/
%ADB% shell chmod 755 /data/local/tmp/motocar_projection_service

echo [+] Starting MotoCar Head Unit Shell...
%ADB% shell am start -n com.autodroid.motocar/.MainActivity

echo ========================================================
echo  MotoCar OS successfully installed and launched!
echo  Mount your phone on bike handlebar or car dashboard.
echo ========================================================
pause
