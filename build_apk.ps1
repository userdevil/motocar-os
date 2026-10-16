#
# MotoCarShell APK Compilation Script
#

$sdk = "C:\Users\ASUS\AppData\Local\Android\Sdk"
$buildTools = "$sdk\build-tools\35.0.0"
$platform = "$sdk\platforms\android-34\android.jar"
$java = "C:\Program Files\Android\Android Studio\jbr\bin"

$aapt2 = "$buildTools\aapt2.exe"
$d8 = "$buildTools\d8.bat"
$zipalign = "$buildTools\zipalign.exe"
$apksigner = "$buildTools\apksigner.bat"
$javac = "$java\javac.exe"

$shellDir = "packages\apps\Car\MotoCarShell"
$buildDir = "out\apk_build"
$outApkDir = "out\target\product\motocar_display\system\priv-app\MotoCarShell"

Write-Host "[1/6] Preparing build directories..."
Remove-Item -Recurse -Force $buildDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path "$buildDir\compiled_res", "$buildDir\gen", "$buildDir\classes", "$outApkDir\lib\arm64" | Out-Null

Write-Host "[2/6] Compiling resources with aapt2..."
$resFiles = Get-ChildItem -Recurse -Path "$shellDir\res" -Include "*.xml"
foreach ($f in $resFiles) {
    & $aapt2 compile $f.FullName -o "$buildDir\compiled_res"
}

Write-Host "[3/6] Linking APK and generating R.java..."
$flatFiles = (Get-ChildItem "$buildDir\compiled_res\*.flat").FullName
& $aapt2 link -I $platform `
    --manifest "$shellDir\AndroidManifest.xml" `
    --java "$buildDir\gen" `
    -o "$buildDir\unaligned.apk" `
    --auto-add-overlay `
    $flatFiles

Write-Host "[4/6] Compiling Java sources with javac..."
$javaSources = (Get-ChildItem -Recurse -Path "$shellDir\src", "$buildDir\gen" -Filter "*.java").FullName
& $javac -cp $platform -d "$buildDir\classes" $javaSources

Write-Host "[5/6] Converting to classes.dex with d8..."
$classFiles = (Get-ChildItem -Recurse -Path "$buildDir\classes" -Filter "*.class").FullName
& $d8 --output "$buildDir" --lib $platform $classFiles

Write-Host "[6/6] Packaging and aligning MotoCarShell.apk..."
# Add classes.dex to APK
& "$java\jar.exe" uf "$buildDir\unaligned.apk" -C "$buildDir" classes.dex

# Copy native library libmotocar_projection_jni.so
$jniSrc = "out\target\product\motocar_display\vendor\lib64\libmotocar_projection_jni.so"
New-Item -ItemType Directory -Force -Path "$buildDir\lib\arm64-v8a" | Out-Null
Copy-Item $jniSrc "$buildDir\lib\arm64-v8a\"
Copy-Item $jniSrc "$outApkDir\lib\arm64\"
& "$java\jar.exe" uf "$buildDir\unaligned.apk" -C "$buildDir" lib/arm64-v8a/libmotocar_projection_jni.so

# Zipalign
& $zipalign -p -f 4 "$buildDir\unaligned.apk" "$outApkDir\MotoCarShell.apk"

Write-Host "[+] MotoCarShell.apk successfully compiled:"
Get-Item "$outApkDir\MotoCarShell.apk" | Select-Object Name, Length, LastWriteTime
