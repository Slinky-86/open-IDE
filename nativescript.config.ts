import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'org.nativescript.openide',
  appDisplayName: 'Open-IDE',
  appPath: 'app',
  appResourcesPath: 'app/App_Resources',
  main: 'app/app.js',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
    codeCache: false,
    maxLogcatObjectSize: 2048,
    suppressCallJSMethodExceptions: false
  }
} as NativeScriptConfig;
