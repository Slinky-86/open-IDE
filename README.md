# Open-IDE

A NativeScript-based open mobile IDE that allows runtime code modification and extensibility, inspired by Theia IDE.

## 🚀 Features

- **Runtime Code Editing**: Modify the IDE's own code while it's running
- **Hot Reload**: Changes take effect immediately with the refresh button
- **Extensible Architecture**: Users can add custom functionality through JavaScript
- **File Management**: Complete file explorer and editor system
- **Console Output**: Real-time code execution and debugging

## 🎨 Theme

**VS Code Dark Theme Inspired:**
- Primary Background: `#1e1e1e` (Dark editor)
- Sidebar Background: `#252526` 
- Action Bar: `#2d2d2d`
- Accent Color: `#007acc` (VS Code blue)
- Text Colors: `#d4d4d4` (primary), `#858585` (secondary)

## 🛠️ Building for Android

### Prerequisites
- Android Studio installed
- NativeScript CLI: `npm install -g @nativescript/cli`
- Android SDK and build tools

### Build Commands
```bash
# Debug build
ns build android

# Release build  
ns build android --release

# Run on device/emulator
ns run android
```

### Required Files for Android Build
- `app/App_Resources/Android/src/main/AndroidManifest.xml`
- `app/App_Resources/Android/src/main/res/values/strings.xml`
- `app/App_Resources/Android/src/main/res/values/colors.xml`
- `app/App_Resources/Android/src/main/res/values/styles.xml`
- `app/App_Resources/Android/build.gradle`
- `app/App_Resources/Android/gradle.properties`
- `app/App_Resources/Android/settings.gradle`
- `app/App_Resources/Android/proguard-rules.pro`
- App icons in various resolutions

## 📱 Runtime Customization

### Getting Started
1. Open the app
2. Navigate to `app-extensions.js` 
3. Write your customizations
4. Hit the refresh button (⟲)
5. Your changes are now active!

### Example Extensions
```javascript
// Add custom menu item
global.app.executor.addMenuItem("My Tool", () => {
  alert("Custom functionality!");
});

// Extend editor
global.app.editor.addCommand("format", (code) => {
  return formattedCode;
});
```

## 📚 Tutorial
The app includes a built-in tutorial (`tutorial.md`) that explains how to:
- Access IDE components at runtime
- Create custom extensions
- Modify UI elements
- Share your customizations

## 🔧 Architecture
- **JavaScript-based**: Pure JS for fastest hot reload
- **Modular Design**: Separate managers for different functionality
- **Global Context**: `global.app` provides access to all components
- **Plugin System**: Runtime-loadable extensions
- **Hidden Build System**: Discoverable advanced features for power users

## 🕵️ Hidden Features

Open-IDE contains hidden advanced features that users can discover:

### **Build System Discovery**
1. Look for commented code in `app/views/build-system-ui.xml`
2. Set `global.app.enableBuildSystem = true` in your extensions
3. Uncomment the UI sections you want to enable
4. Refresh the app to activate the build system

### **What You'll Unlock:**
- Complete NativeScript build pipeline
- Project management tools
- APK/AAB generation
- Build queue monitoring
- Deployment automation
- Custom build scripts

### **Discovery Hints:**
- Check `app/build-system/build-discovery.js` for clues
- Look for console messages with emoji
- Search for files containing "build" in the name
- Advanced features unlock as you use the system

## 📄 License
MIT License - Feel free to customize and extend!
