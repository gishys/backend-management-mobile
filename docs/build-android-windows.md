# Windows 下构建 Android APK（解决路径超 260 字符）

在 Windows 上构建 Android 时，可能遇到：

```text
ninja: error: ... Filename longer than 260 characters
```

按下面步骤处理即可正常构建。

## 1. 启用 Windows 长路径支持（需管理员权限）

在 **以管理员身份运行** 的 PowerShell 中执行：

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

执行后**重启电脑**一次。

也可按微软文档手动修改：  
[最大路径长度限制 - 启用长路径](https://learn.microsoft.com/zh-cn/windows/win32/fileio/maximum-file-path-limitation?tabs=registry#enable-long-paths-in-windows-10-version-1607-and-later)

## 2. 使用支持长路径的 Ninja（1.12+）

Android SDK 自带的 CMake 里是旧版 Ninja，不支持长路径。需要单独安装 Ninja 1.12 或更高版本。

### 方式 A：用脚本自动下载（推荐）

在项目根目录执行：

```powershell
.\scripts\setup-ninja-windows.ps1
```

脚本会把 Ninja 解压到 `C:\ninja`（若已存在则跳过）。

### 方式 B：手动安装

1. 打开 [Ninja 发布页](https://github.com/ninja-build/ninja/releases)，下载 **ninja-win.zip**（例如 v1.12.1 或更新）。
2. 解压得到 `ninja.exe`。
3. 创建目录 `C:\ninja`，将 `ninja.exe` 放入其中，保证路径为：`C:\ninja\ninja.exe`。

### 使用其他路径

若不想用 `C:\ninja`，可在执行 Gradle 时指定：

```powershell
$env:NINJA_PATH = "D:\tools\ninja.exe"
npm run android:apk
```

或在项目根目录的 `android/gradle.properties` 中增加：

```properties
NINJA_PATH=D:\\tools\\ninja.exe
```

## 3. 重新构建 APK

```powershell
cd c:\work\projectsnew\workflow-management\backend-management-mobile
npm run android:apk
```

成功后，Release APK 位于：

```text
android\app\build\outputs\apk\release\app-release.apk
```

## 参考

- [Expo #36274 - Filename longer than 260 characters](https://github.com/expo/expo/issues/36274)
- [ninja-build/ninja #1900 - 260 character limit workaround](https://github.com/ninja-build/ninja/issues/1900#issuecomment-1817532728)
