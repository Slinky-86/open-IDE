# NativeScript Installation Guide

## 🚀 **Step 1: Install Node.js**
```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from https://nodejs.org/
# Or use a package manager:

# On Ubuntu/Debian:
sudo apt update
sudo apt install nodejs npm

# On macOS (with Homebrew):
brew install node

# On Windows (with Chocolatey):
choco install nodejs
```

## 🔧 **Step 2: Install NativeScript CLI**
```bash
# Install NativeScript CLI globally
npm install -g @nativescript/cli

# Verify installation
ns --version
```

## 📱 **Step 3: Setup Android Development Environment**
```bash
# Check what's needed for Android development
ns doctor android

# This will tell you what's missing and how to install it
```

## 🛠️ **Step 4: Install Android Requirements**

### **Option A: Install Android Studio (Recommended)**
1. Download Android Studio from https://developer.android.com/studio
2. Install it and open it once to download SDK
3. Set environment variables:

```bash
# Add to your ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Reload your shell
source ~/.bashrc  # or source ~/.zshrc
```

### **Option B: Command Line Tools Only**
```bash
# Download command line tools from:
# https://developer.android.com/studio#command-tools

# Extract and set up
mkdir -p ~/Android/Sdk/cmdline-tools
cd ~/Android/Sdk/cmdline-tools
# Extract downloaded zip here, rename folder to 'latest'

# Set environment variables (same as above)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Install required packages
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
sdkmanager --licenses  # Accept all licenses
```

## ✅ **Step 5: Verify Everything Works**
```bash
# Check if everything is set up correctly
ns doctor android

# Should show all green checkmarks
```

## 🏗️ **Step 6: Build Your NativeScript App**
```bash
# Clone or download your project
git clone <your-repo-url>
cd open-ide

# Install dependencies
npm install

# Build for Android
ns build android

# Or run on device/emulator
ns run android

# For development with hot reload
ns run android --hmr
```

## 🔍 **Troubleshooting Common Issues**

### **"ns command not found"**
```bash
# Make sure npm global bin is in PATH
npm config get prefix
# Add the bin folder to your PATH

# Or reinstall NativeScript CLI
npm uninstall -g @nativescript/cli
npm install -g @nativescript/cli
```

### **Android SDK Issues**
```bash
# Check if ANDROID_HOME is set correctly
echo $ANDROID_HOME

# List installed packages
sdkmanager --list

# Install missing packages
sdkmanager "platforms;android-34"
sdkmanager "build-tools;34.0.0"
```

### **Permission Issues on Linux/macOS**
```bash
# If you get permission errors with npm
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use a Node version manager like nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
nvm use node
```

## 📱 **Quick Start for Development**
```bash
# For immediate testing without local setup
ns preview

# This gives you a QR code to scan with NativeScript Preview app
# Download "NativeScript Preview" from app store
```

## 🎯 **Summary Commands**
```bash
# Essential installation commands:
npm install -g @nativescript/cli
ns doctor android
ns build android
```

That's it! You're ready to develop NativeScript apps! 🚀