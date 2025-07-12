# How to Build Open-IDE NativeScript App

## ❌ **What NOT to do:**
- Don't open this project in Android Studio
- Don't try to build with Gradle directly
- Don't use Android Studio's build system

## ✅ **Correct NativeScript Build Process:**

### 1. Prerequisites
```bash
# Install NativeScript CLI globally
npm install -g @nativescript/cli

# Verify installation
ns doctor android
```

### 2. Setup Android Environment
- Install Android Studio (for SDK only, not for building)
- Install Android SDK
- Set ANDROID_HOME environment variable
- Accept Android SDK licenses: `sdkmanager --licenses`

### 3. Build Commands (from project root)
```bash
# Debug build
ns build android

# Release build
ns build android --release

# Run on device/emulator
ns run android

# Run with live reload
ns run android --hmr
```

### 4. Preview in Browser (Development)
```bash
# Start preview (what we're using in StackBlitz)
ns preview

# Or use the StackBlitz setup
setup-nativescript-stackblitz && ns preview
```

### 5. Output Locations
- Debug APK: `platforms/android/app/build/outputs/apk/debug/`
- Release APK: `platforms/android/app/build/outputs/apk/release/`

## 🔧 **If You Must Use Android Studio:**

Only for debugging native code, not building:
1. Build first with NativeScript CLI
2. Open `platforms/android` folder in Android Studio
3. Use only for debugging, not building

## 📱 **Current Development:**
Since you're in StackBlitz, use the preview system:
- The app runs in NativeScript Preview
- No local Android build needed
- Test on your phone with NativeScript Preview app

## 🚀 **For Production:**
Use NativeScript CLI or NativeScript Cloud Build services.