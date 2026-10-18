@echo off
setlocal enabledelayedexpansion

echo =====================================================================
echo  MotoCar OS: Android Automotive OS (AAOS) Emulator Launcher
echo  Runs MotoCar AAOS Universal ARM64 system.img in Virtual Machine
echo =====================================================================

set EMULATOR="%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe"
if not exist %EMULATOR% (
    echo [!] Android SDK Emulator not found at:
    echo     %EMULATOR%
    echo Please install the Android Emulator via Android Studio SDK Manager.
    pause
    exit /b 1
)

echo [*] Android Emulator found!
echo.

rem Check for system.img or compressed archive
set SYSTEM_IMG=system.img
if not exist "%SYSTEM_IMG%" (
    if exist "build_out\system.img" (
        set SYSTEM_IMG=build_out\system.img
    ) else if exist "MotoCarOS-AAOS-Universal-ARM64-v2.0-system.img.xz" (
        echo [*] Found MotoCarOS-AAOS-Universal-ARM64-v2.0-system.img.xz.
        echo [*] Decompressing archive to raw system.img (requires 7-Zip or tar)...
        tar -xf "MotoCarOS-AAOS-Universal-ARM64-v2.0-system.img.xz" >nul 2>&1
        if not exist "system.img" (
            echo [!] Please extract MotoCarOS-AAOS-Universal-ARM64-v2.0-system.img.xz to system.img first!
            pause
            exit /b 1
        )
    ) else (
        echo [!] system.img not found in the current directory.
        echo Please place the decompressed system.img in this folder.
        pause
        exit /b 1
    )
)

echo [+] Target system image: %SYSTEM_IMG%
echo.

echo [*] Available Android Virtual Devices (AVDs):
%EMULATOR% -list-avds
echo.

set /p AVD_NAME="Enter the AVD name to boot (e.g. from the list above): "

if "%AVD_NAME%"=="" (
    echo [!] No AVD name specified. Exiting.
    pause
    exit /b 1
)

echo.
echo =====================================================================
echo  Booting MotoCar AAOS in Virtual Machine: %AVD_NAME%
echo =====================================================================
echo [*] Command: %EMULATOR% -avd %AVD_NAME% -system "%SYSTEM_IMG%" -wipe-data
echo.

%EMULATOR% -avd %AVD_NAME% -system "%SYSTEM_IMG%" -wipe-data -gpu host

pause
