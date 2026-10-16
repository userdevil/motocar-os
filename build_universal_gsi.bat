@echo off
setlocal enabledelayedexpansion

echo =====================================================================
echo   MotoCar OS: Universal ARM64 GSI ROM Assembler (All Phones)
echo =====================================================================

set PYTHON_BIN=C:\Users\ASUS\AppData\Local\Android\Sdk\ndk\28.2.13676358\toolchains\llvm\prebuilt\windows-x86_64\python3\python.exe

if not exist "%PYTHON_BIN%" (
    echo [ERROR] Python 3.11 not found at %PYTHON_BIN%
    pause
    exit /b 1
)

echo [*] Using NDK Python runtime: %PYTHON_BIN%
"%PYTHON_BIN%" "%~dp0tools\assemble_universal_gsi.py" %*

if %ERRORLEVEL% equ 0 (
    echo.
    echo =====================================================================
    echo   Universal system.img built successfully!
    echo   Ready to flash on any Treble ARM64 Android phone via:
    echo     flash_device.bat
    echo =====================================================================
) else (
    echo [ERROR] GSI assembly failed with exit code %ERRORLEVEL%
)

exit /b %ERRORLEVEL%
