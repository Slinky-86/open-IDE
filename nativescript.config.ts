import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'com.openide.app',
  appDisplayName: 'Open-IDE',
  appPath: 'app',
  main: 'app/app.js',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none'
  }
} as NativeScriptConfig;