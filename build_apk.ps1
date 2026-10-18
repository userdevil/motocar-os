#
# MotoCarShell Universal Multi-ABI APK Compilation Script (ARM64 + x86_64)
#

$sdk = "$env:LOCALAPPDATA\Android\Sdk"
$buildTools = "$sdk\build-tools\35.0.0"
$platform = "$sdk\platforms\android-34\android.jar"
if (-not (Test-Path $platform)) {
    $platform = (Get-ChildItem "$sdk\platforms" -Filter "android.jar" -Recurse | Select-Object -First 1).FullName
}
$java = "C:\Program Files\Android\Android Studio\jbr\bin"

$aapt2 = "$buildTools\aapt2.exe"
$d8 = "$buildTools\d8.bat"
$zipalign = "$buildTools\zipalign.exe"
$apksigner = "$buildTools\apksigner.bat"
$javac = "$java\javac.exe"

$shellDir = "packages\apps\Car\MotoCarShell"
$buildDir = "out\apk_build"
$outApkDir = "prebuilts\app"

Write-Host "[1/7] Preparing build directories..."
Remove-Item -Recurse -Force $buildDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path "$buildDir\compiled_res", "$buildDir\gen", "$buildDir\classes", "$buildDir\lib\arm64-v8a", "$buildDir\lib\x86_64", "$outApkDir" | Out-Null

Write-Host "[2/7] Compiling resources with aapt2..."
$resFiles = Get-ChildItem -Recurse -Path "$shellDir\res" -Include "*.xml"
foreach ($f in $resFiles) {
    & $aapt2 compile $f.FullName -o "$buildDir\compiled_res"
}

Write-Host "[3/7] Linking APK with minSdkVersion 24 and targetSdkVersion 34..."
$flatFiles = (Get-ChildItem "$buildDir\compiled_res\*.flat").FullName
& $aapt2 link -I $platform `
    --manifest "$shellDir\AndroidManifest.xml" `
    --min-sdk-version 24 `
    --target-sdk-version 34 `
    --java "$buildDir\gen" `
    -o "$buildDir\unaligned.apk" `
    --auto-add-overlay `
    $flatFiles

Write-Host "[4/7] Compiling Java sources with javac..."
$javaSources = (Get-ChildItem -Recurse -Path "$shellDir\src", "$buildDir\gen" -Filter "*.java").FullName
& $javac -cp $platform -d "$buildDir\classes" $javaSources

Write-Host "[5/7] Converting to classes.dex with d8..."
$classFiles = (Get-ChildItem -Recurse -Path "$buildDir\classes" -Filter "*.class").FullName
& $d8 --output "$buildDir" --lib $platform --min-api 24 $classFiles

Write-Host "[6/7] Packaging multi-ABI native libraries (ARM64 + x86_64)..."
& "$java\jar.exe" uf "$buildDir\unaligned.apk" -C "$buildDir" classes.dex

# Copy ARM64 native library (for physical mobile phones)
$arm64Lib = "prebuilts\lib64\libmotocar_projection_jni.so"
if (Test-Path $arm64Lib) {
    Copy-Item $arm64Lib "$buildDir\lib\arm64-v8a\libmotocar_projection_jni.so" -Force
    & "$java\jar.exe" uf "$buildDir\unaligned.apk" -C "$buildDir" lib/arm64-v8a/libmotocar_projection_jni.so
}

# Copy x86_64 native library (for PC Android Emulator)
$x86Lib = "prebuilts\lib64\libmotocar_projection_jni_x86_64.so"
if (Test-Path $x86Lib) {
    Copy-Item $x86Lib "$buildDir\lib\x86_64\libmotocar_projection_jni.so" -Force
    & "$java\jar.exe" uf "$buildDir\unaligned.apk" -C "$buildDir" lib/x86_64/libmotocar_projection_jni.so
}

Write-Host "[7/7] Zipaligning and Signing MotoCarShell.apk..."
& $zipalign -p -f 4 "$buildDir\unaligned.apk" "$outApkDir\MotoCarShell.apk"

# Sign with debug.keystore
$keystore = "$env:USERPROFILE\.android\debug.keystore"
if (Test-Path $keystore) {
    & $apksigner sign --ks "$keystore" --ks-pass pass:android --key-pass pass:android "$outApkDir\MotoCarShell.apk"
    & $apksigner verify -v "$outApkDir\MotoCarShell.apk"
}

Write-Host "[+] MotoCarShell.apk successfully compiled, aligned, and signed:"
Get-Item "$outApkDir\MotoCarShell.apk" | Select-Object Name, Length, LastWriteTime
