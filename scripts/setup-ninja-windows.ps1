# Install Ninja 1.12+ for Android build on Windows (fix path longer than 260 chars)
# Run from project root: .\scripts\setup-ninja-windows.ps1

$NinjaDir = "C:\ninja"
$NinjaExe = "$NinjaDir\ninja.exe"
$NinjaVersion = "v1.12.1"
$ZipUrl = "https://github.com/ninja-build/ninja/releases/download/$NinjaVersion/ninja-win.zip"
$ZipPath = "$env:TEMP\ninja-win.zip"

$NeedDownload = -not (Test-Path $NinjaExe)

if ($NeedDownload) {
    Write-Host "Creating $NinjaDir ..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path $NinjaDir | Out-Null

    Write-Host "Downloading Ninja $NinjaVersion ..." -ForegroundColor Cyan
    try {
        Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath -UseBasicParsing
    } catch {
        Write-Host "Download failed: $_" -ForegroundColor Red
        Write-Host "Download ninja-win.zip from: $ZipUrl" -ForegroundColor Yellow
        Write-Host "Extract ninja.exe to: $NinjaDir" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "Extracting to $NinjaDir ..." -ForegroundColor Cyan
    Expand-Archive -Path $ZipPath -DestinationPath $NinjaDir -Force
    Remove-Item $ZipPath -Force -ErrorAction SilentlyContinue

    if (-not (Test-Path $NinjaExe)) {
        Write-Host "ninja.exe not found after extract. Check $NinjaDir" -ForegroundColor Red
        exit 1
    }
    Write-Host "Ninja installed to $NinjaExe" -ForegroundColor Green
} else {
    Write-Host "Found $NinjaExe, will copy to Android SDK." -ForegroundColor Green
}

$AndroidSdk = $env:ANDROID_HOME
if (-not $AndroidSdk) { $AndroidSdk = $env:ANDROID_SDK_ROOT }
if (-not $AndroidSdk) { $AndroidSdk = "$env:LOCALAPPDATA\Android\Sdk" }

$CmakeBin = Join-Path $AndroidSdk "cmake\3.22.1\bin"
$SdkNinja = Join-Path $CmakeBin "ninja.exe"

if (-not (Test-Path $CmakeBin)) {
    Write-Host "Android SDK CMake not found: $CmakeBin" -ForegroundColor Yellow
    Write-Host "Set ANDROID_HOME or copy $NinjaExe to your SDK cmake\3.22.1\bin" -ForegroundColor Yellow
    exit 1
}

Copy-Item -Path $NinjaExe -Destination $SdkNinja -Force
Write-Host "Ninja 1.12+ copied to SDK: $SdkNinja" -ForegroundColor Green
Write-Host "Enable Windows long paths if needed (see docs/build-android-windows.md), then run: npm run android:apk" -ForegroundColor Cyan
