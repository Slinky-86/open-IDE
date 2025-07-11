# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Keep NativeScript runtime classes
-keep class com.tns.** { *; }
-keep class org.nativescript.** { *; }

# Keep JavaScript interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep reflection-based code
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Keep line numbers for debugging
-keepattributes SourceFile,LineNumberTable

# Keep all classes with native methods
-keepclasseswithmembernames class * {
    native <methods>;
}