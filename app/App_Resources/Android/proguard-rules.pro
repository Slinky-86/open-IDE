# Open-IDE ProGuard Rules
# Add project specific ProGuard rules here.

# Keep NativeScript runtime
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

# Don't warn about missing classes
-dontwarn com.tns.**
-dontwarn org.nativescript.**

# Keep WebView JavaScript interface
-keep public class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep classes that might be accessed via reflection
-keep class * extends android.webkit.WebViewClient
-keep class * extends android.webkit.WebChromeClient

# Additional NativeScript specific rules
-keep class java.lang.reflect.** { *; }
-keep class com.tns.Runtime { *; }
-keep class com.tns.NativeScriptApplication { *; }
-keep class com.tns.NativeScriptActivity { *; }

# Keep all classes with native methods
-keepclasseswithmembernames class * {
    native <methods>;
}