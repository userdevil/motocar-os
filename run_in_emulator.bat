@echo off
setlocal enabledelayedexpansion

echo =====================================================================
echo  MotoCar OS: Android Automotive OS (AAOS) Emulator Launcher
echo  Runs MotoCar AAOS Universal ARM64 system.img in Virtual Machine
echo =====================================================================

set "EMULATOR=%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe"
if not exist "%EMULATOR%" (
    echo [!] Android SDK Emulator not found at:
    echo     %EMULATOR%
    echo Please install the Android Emulator via Android Studio SDK Manager.
    pause
    exit /b 1
)

echo [*] Android Emulator found: %EMULATOR%
echo.

rem Search for system.img across known locations
set "SYSTEM_IMG="

if exist "%~dp0system.img" (
    set "SYSTEM_IMG=%~dp0system.img"
)

if not defined SYSTEM_IMG (
    if exist "system.img" (
        set "SYSTEM_IMG=system.img"
    )
)

if not defined SYSTEM_IMG (
    if exist "%USERPROFILE%\Downloads\MotoCarOS-AAOS-Universal-ARM64-v2.0-Fastboot\system.img" (
        set "SYSTEM_IMG=%USERPROFILE%\Downloads\MotoCarOS-AAOS-Universal-ARM64-v2.0-Fastboot\system.img"
    )
)

if not defined SYSTEM_IMG (
    if exist "build_out\system.img" (
        set "SYSTEM_IMG=build_out\system.img"
    )
)

if not defined SYSTEM_IMG (
    echo [!] ERROR: system.img was not found!
    echo Please place system.img in this directory or enter the full path.
    set /p "SYSTEM_IMG=Enter full path to system.img: "
)

if not exist "!SYSTEM_IMG!" (
    echo [!] ERROR: Specified image does not exist: !SYSTEM_IMG!
    pause
    exit /b 1
)

echo [+] Target system image: !SYSTEM_IMG!
echo.

echo [*] Detected Android Virtual Devices (AVDs):
"%EMULATOR%" -list-avds
echo.

set "AVD_NAME="
rem Auto-detect 'Automotive' AVD if it exists
"%EMULATOR%" -list-avds | findstr /i "^Automotive$" >nul 2>&1
if not errorlevel 1 (
    echo [*] Found matching 'Automotive' virtual device!
    set "AVD_NAME=Automotive"
)

if not defined AVD_NAME (
    set /p "AVD_NAME=Enter the AVD name to boot (e.g. Automotive): "
)

if not defined AVD_NAME (
    echo [!] No AVD name provided. Exiting.
    pause
    exit /b 1
)

echo.
echo =====================================================================
echo  Booting MotoCar AAOS in Virtual Machine: !AVD_NAME!
echo =====================================================================
echo [*] Command: "%EMULATOR%" -avd !AVD_NAME! -system "!SYSTEM_IMG!" -wipe-data -gpu host
echo.

"%EMULATOR%" -avd !AVD_NAME! -system "!SYSTEM_IMG!" -wipe-data -gpu host

pause
