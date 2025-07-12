# Android Environment Setup for NativeScript

## 🎯 **Quick Setup (Recommended)**

### **Step 1: Install Android Studio**
1. Download from: https://developer.android.com/studio
2. Install and open it once
3. Let it download the Android SDK automatically

### **Step 2: Set Environment Variables**

**For Windows (Git Bash/PowerShell):**
```bash
# Add these to your system environment variables
# Go to: System Properties > Advanced > Environment Variables

# Add new system variables:
ANDROID_HOME = C:\Users\%USERNAME%\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT = C:\Users\%USERNAME%\AppData\Local\Android\Sdk

# Add to PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
%ANDROID_HOME%\emulator
```

**Or set them in Git Bash:**
```bash
# Add to ~/.bashrc or ~/.bash_profile
export ANDROID_HOME="$HOME/AppData/Local/Android/Sdk"
export ANDROID_SDK_ROOT="$HOME/AppData/Local/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/emulator"

# Reload
source ~/.bashrc
```

### **Step 3: Install Required SDK Components**
```bash
# Navigate to SDK manager
cd "$ANDROID_HOME/cmdline-tools/latest/bin"

# Install required components
./sdkmanager "platform-tools"
./sdkmanager "platforms;android-34"
./sdkmanager "build-tools;34.0.0"
./sdkmanager "build-tools;33.0.0"
./sdkmanager "emulator"

# Accept licenses
./sdkmanager --licenses
```

### **Step 4: Verify Setup**
```bash
# Check if everything is working
ns doctor android

# Should show all green checkmarks
```

## 🚀 **Alternative: Command Line Tools Only**

If you don't want Android Studio:

### **Download Command Line Tools:**
1. Go to: https://developer.android.com/studio#command-tools
2. Download "Command line tools only"
3. Extract to: `C:\Users\%USERNAME%\Android\Sdk\cmdline-tools\latest`

### **Set Environment Variables (same as above)**

### **Install SDK Components:**
```bash
# Set ANDROID_HOME first
export ANDROID_HOME="$HOME/AppData/Local/Android/Sdk"

# Install components
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platform-tools"
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platforms;android-34"
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "build-tools;34.0.0"
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
```

## 🔍 **Troubleshooting**

### **If sdkmanager command not found:**
```bash
# Check if ANDROID_HOME is set
echo $ANDROID_HOME

# Check if cmdline-tools exist
ls "$ANDROID_HOME/cmdline-tools/latest/bin/"

# If not, download command line tools and extract properly
```

### **If environment variables don't persist:**
```bash
# Add to Windows system environment variables permanently
# System Properties > Advanced > Environment Variables > System Variables
```

## ✅ **Quick Test**
```bash
# After setup, test:
ns doctor android

# Should show:
# ✓ Android SDK is installed and configured properly
# ✓ Android Build Tools are installed
# ✓ Android Platform Tools are installed
```

## 📱 **Then Build Your App**
```bash
# Once environment is set up:
ns build android
ns run android
```

## 🎯 **Fastest Option for Testing**
If you just want to test the app quickly without full setup:
```bash
ns preview
# Scan QR code with NativeScript Preview app
```