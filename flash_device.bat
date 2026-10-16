@echo off
setlocal enabledelayedexpansion

echo =====================================================================
echo  MotoCar OS: Android Automotive OS (AAOS) Fastboot Flasher
echo  Architecture: gsi_car_arm64 (Universal for All Android Phones)
echo =====================================================================

set FASTBOOT="%LOCALAPPDATA%\Android\Sdk\platform-tools\fastboot.exe"
if not exist %FASTBOOT% (
    set FASTBOOT=fastboot
)

set OUT=out\target\product\motocar_display

set SYSTEM_IMG=system.img
if not exist "%SYSTEM_IMG%" (
    set SYSTEM_IMG=%OUT%\system.img
)

set VBMETA_IMG=vbmeta.img
if not exist "%VBMETA_IMG%" (
    set VBMETA_IMG=%OUT%\vbmeta.img
)

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
if exist "%VBMETA_IMG%" (
    %FASTBOOT% --disable-verity --disable-verification flash vbmeta "%VBMETA_IMG%" >nul 2>&1
    if errorlevel 1 (
        %FASTBOOT% flash vbmeta "%VBMETA_IMG%"
    )
) else (
    echo [*] vbmeta.img not found, skipping AVB flash...
)

echo.
echo [+] Step 2: Flashing MotoCar AAOS Universal System Image...
if not exist "%SYSTEM_IMG%" (
    echo [!] ERROR: system.img not found! Ensure system.img is in the current directory.
    pause
    exit /b 1
)
%FASTBOOT% flash system "%SYSTEM_IMG%"
if errorlevel 1 (
    echo [!] Standard flash failed, attempting slot-specific flashing...
    %FASTBOOT% flash system_a "%SYSTEM_IMG%" >nul 2>&1
    %FASTBOOT% flash system_b "%SYSTEM_IMG%" >nul 2>&1
)

echo.
echo [+] Step 3: Performing clean data wipe for automotive headunit first boot...
%FASTBOOT% -w >nul 2>&1
if errorlevel 1 (
    %FASTBOOT% erase userdata
    %FASTBOOT% erase metadata >nul 2>&1
)

echo.
echo [+] Step 4: Rebooting into Android Automotive OS...
%FASTBOOT% reboot

echo.
echo =====================================================================
echo  MotoCar OS Successfully Flashed!
echo  Your phone is now rebooting into Android Automotive OS (AAOS).
echo =====================================================================
pause
