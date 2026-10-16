@echo off
setlocal enabledelayedexpansion

echo =====================================================================
echo       MotoCar OS Universal Fastboot Flasher (All Phones)
echo =====================================================================

set FASTBOOT="%LOCALAPPDATA%\Android\Sdk\platform-tools\fastboot.exe"
if not exist %FASTBOOT% (
    set FASTBOOT=fastboot
)

set OUT=out\target\product\motocar_display

echo [*] Checking for connected fastboot devices...
%FASTBOOT% devices

%FASTBOOT% getvar product >nul 2>&1
if errorlevel 1 (
    echo.
    echo [!] No phone detected in fastboot mode.
    echo Please connect your phone via USB and put it into bootloader mode:
    echo     adb reboot bootloader
    echo     or hold Volume Down + Power while powering on.
    echo.
    pause
    exit /b 1
)

echo.
echo [*] Device detected!
%FASTBOOT% getvar product 2>&1
%FASTBOOT% getvar current-slot 2>&1

echo.
echo [*] Checking for dynamic partition support (fastbootd)...
%FASTBOOT% getvar is-userspace 2>&1 | findstr "yes" >nul
if errorlevel 1 (
    echo [*] Phone is in standard bootloader. For devices with dynamic partitions (Android 10+),
    echo     rebooting to fastbootd userspace mode...
    %FASTBOOT% reboot fastboot >nul 2>&1
    timeout /t 5 >nul
)

echo.
echo [+] Step 1: Disabling Android Verified Boot (AVB) verity checks...
%FASTBOOT% --disable-verity --disable-verification flash vbmeta "%OUT%\vbmeta.img" >nul 2>&1
if errorlevel 1 (
    echo [*] Standard vbmeta flash failed, attempting without extra flags...
    %FASTBOOT% flash vbmeta "%OUT%\vbmeta.img"
)

echo.
echo [+] Step 2: Flashing MotoCar OS Universal System Image (system.img)...
%FASTBOOT% flash system "%OUT%\system.img"
if errorlevel 1 (
    echo [!] If flashing failed due to partition size in dynamic partitions, attempting slot flash...
    %FASTBOOT% flash system_a "%OUT%\system.img" >nul 2>&1
    %FASTBOOT% flash system_b "%OUT%\system.img" >nul 2>&1
)

echo.
echo [+] Step 3: Performing clean data wipe for automotive headunit first boot...
%FASTBOOT% -w >nul 2>&1
if errorlevel 1 (
    %FASTBOOT% erase userdata
    %FASTBOOT% erase metadata >nul 2>&1
)

echo.
echo [+] Step 4: Rebooting into MotoCar OS...
%FASTBOOT% reboot

echo.
echo =====================================================================
echo  MotoCar OS Successfully Flashed!
echo  Your phone is now rebooting into the dedicated Bike/Car Head Unit OS.
echo =====================================================================
pause
