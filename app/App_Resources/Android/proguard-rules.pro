# Open-IDE ProGuard Rules
# Add project specific ProGuard rules here.

# Keep NativeScript runtime
-keep class com.tns.** { *; }
-keep class org.nativescript.** { *; }

# Keep JavaScript interface
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

# Don't warn about missing classes
-dontwarn com.tns.**
-dontwarn org.nativescript.**
