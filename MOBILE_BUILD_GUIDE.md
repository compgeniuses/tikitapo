# Mobile Build Guide for tikiTaP0

This guide explains how to build the tikiTaP0 application for mobile devices using Capacitor.js.

## Overview

tikiTaP0 is now configured with Capacitor to run as a native mobile application on Android devices. This allows you to:
- Build APK files for testing and distribution
- Build AAB (Android App Bundle) files for Google Play Store publishing
- Access native device features
- Distribute the app outside of the Play Store

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **Android Studio** (Latest stable version)
   - Download from: https://developer.android.com/studio
   - Required for building APK/AAB files
   - Includes Android SDK and build tools

3. **Java Development Kit (JDK)** 17 or higher
   - Usually included with Android Studio
   - Verify: `java --version`

4. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

### Environment Variables (Windows)

Add these to your system PATH if not already present:

```
C:\Users\[YourUsername]\AppData\Local\Android\Sdk\platform-tools
C:\Users\[YourUsername]\AppData\Local\Android\Sdk\tools
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Web App

```bash
npm run build
```

This creates the production web assets in the `dist/` folder.

### 3. Sync with Capacitor

```bash
npm run mobile:sync
```

This copies the web assets to the Android project.

### 4. Open in Android Studio

```bash
npm run mobile:open
```

This opens the Android project in Android Studio where you can build and run.

## Build Scripts

### Available NPM Scripts

```bash
# Development
npm run dev              # Run web development server
npm run build            # Build web app for production

# Mobile Operations
npm run mobile:sync      # Sync web assets to mobile platforms
npm run mobile:copy      # Copy web assets (faster than sync)
npm run mobile:open      # Open Android project in Android Studio
npm run mobile:build     # Build web + sync to mobile

# Android Builds (Requires Android Studio or Gradle)
npm run android:apk           # Build debug APK
npm run android:apk-release   # Build release APK (requires signing)
npm run android:aab           # Build AAB for Play Store (requires signing)
npm run android:icons         # Generate app icons from SVG
```

## Building APK Files

### Debug APK (for testing)

```bash
npm run android:apk
```

The APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (for distribution)

Before building a release APK, you need to set up signing:

1. **Create a Keystore** (one-time setup):

```bash
cd android
keytool -genkey -v -keystore release-key.keystore -alias tikitapo -keyalg RSA -keysize 2048 -validity 10000
```

Enter a secure password when prompted. Keep the keystore file safe!

2. **Create `key.properties` file** in `android/` directory:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=tikitapo
storeFile=release-key.keystore
```

⚠️ **Never commit `key.properties` or `release-key.keystore` to git!**

3. **Build the release APK**:

```bash
npm run android:apk-release
```

The release APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Building AAB for Google Play Store

AAB (Android App Bundle) is the modern format required by Google Play Store.

### Prerequisites

- Complete the signing setup above (keystore + key.properties)
- Update `android/app/build.gradle` version codes if needed

### Build Process

```bash
npm run android:aab
```

The AAB file will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Upload to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app or select existing
3. Go to **Production** → **Create new release**
4. Upload the `app-release.aab` file
5. Fill in release notes and rollout

## App Icons and Splash Screens

### Generating Icons

The app uses SVG source files to generate all required icon sizes:

**Source Files:**
- `resources/icon.svg` - App icon (512x512)
- `resources/splash.svg` - Splash screen (1080x1920)

**Generate all sizes:**
```bash
npm run android:icons
```

This creates icons in:
- `android/app/src/main/res/mipmap-*` (launcher icons)
- `android/app/src/main/res/drawable-*` (splash screens)

### Customizing Icons

1. Edit `resources/icon.svg` in any vector editor (Inkscape, Adobe Illustrator, Figma)
2. Edit `resources/splash.svg` for the splash screen
3. Run `npm run android:icons` to regenerate

## Mobile-Specific Features

### Screen Orientation

The app is locked to **portrait** mode for optimal gameplay. This is configured in:
- `android/app/src/main/AndroidManifest.xml`
- `capacitor.config.ts`

### Status Bar

- Hidden in immersive mode during gameplay
- Dark theme for better visibility
- Configured via `@capacitor/status-bar`

### Splash Screen

- 3-second minimum display time
- Automatically hides when app is ready
- Dark theme matching the app
- Custom branding with Genius.africa logo

### Device Permissions

The app requires these permissions:
- `INTERNET` - For online multiplayer and API calls
- `ACCESS_NETWORK_STATE` - To check connectivity
- `VIBRATE` - For haptic feedback (optional)

## Testing on Device

### Option 1: Android Studio (Recommended)

1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging**
3. Connect device via USB
4. In Android Studio, select your device from the dropdown
5. Click **Run** (green play button)

### Option 2: ADB Command Line

```bash
# Install debug APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or install release APK
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Option 3: Wireless Debugging (Android 11+)

1. Enable wireless debugging in Developer Options
2. Pair device: `adb pair IP:PORT`
3. Connect: `adb connect IP:PORT`
4. Install and run as normal

## Troubleshooting

### Common Issues

**1. Gradle sync fails**
```bash
cd android
./gradlew clean
./gradlew build
```

**2. Build fails with "Duplicate class" errors**
```bash
cd android
./gradlew clean
npm run mobile:sync
```

**3. App crashes on launch**
- Check `capacitor.config.ts` for correct `appId`
- Ensure `webDir` points to `dist`
- Run `npm run mobile:sync` again

**4. Changes not reflecting**
```bash
npm run build
npm run mobile:copy
# Then reload in Android Studio
```

**5. Keystore errors**
- Ensure `key.properties` exists in `android/` folder
- Verify keystore path is correct
- Check password is correct

### Reset Everything

If you encounter persistent issues:

```bash
# Clean everything
rm -rf android
rm -rf dist
rm -rf node_modules
npm install

# Rebuild
npm run build
npx cap add android
npx cap sync
```

## Distribution Options

### 1. Google Play Store (Recommended)

- Build AAB: `npm run android:aab`
- Upload to Play Console
- Requires Google Play Developer account ($25 one-time fee)

### 2. Direct APK Distribution

- Build release APK: `npm run android:apk-release`
- Share `app-release.apk` directly
- Users must enable "Install from unknown sources"

### 3. Alternative App Stores

- Amazon Appstore
- Samsung Galaxy Store
- F-Droid (for open source)
- APKMirror

### 4. Internal Testing

- Use Firebase App Distribution
- Share debug APK with team
- Use Google Play Internal Testing track

## App Store Optimization (ASO)

### Google Play Store Listing

**Required Assets:**
- App Icon: 512x512 PNG
- Feature Graphic: 1024x500 PNG
- Screenshots: At least 2 (16:9 or 9:16)
- Short Description: 80 characters max
- Full Description: 4000 characters max

**Keywords:**
- Tic-tac-toe, Connect game, Strategy game
- Multiplayer, AI game, Board game
- Puzzle, Brain training, Casual game

## Security Best Practices

1. **Never commit secrets:**
   - Add to `.gitignore`:
     ```
     android/release-key.keystore
     android/key.properties
     ```

2. **Use environment variables** for sensitive API keys

3. **Enable ProGuard** for code obfuscation (already configured)

4. **Regular security updates:**
   ```bash
   npm audit
   npm update
   ```

## Performance Optimization

### For Mobile

1. **Enable code splitting** (already in vite.config.ts)
2. **Lazy load** non-critical components
3. **Optimize images** in assets folder
4. **Minimize bundle size** with tree shaking

### Native Performance

1. **Use WKWebView** on Android (default in Capacitor)
2. **Enable hardware acceleration** (already configured)
3. **Optimize splash screen** load time

## Support

For issues related to:
- **Capacitor**: https://capacitorjs.com/docs
- **Android Studio**: https://developer.android.com/studio/intro
- **Google Play Console**: https://support.google.com/googleplay/android-developer

## License

This mobile build configuration is part of the tikiTaP0 project by Genius.africa.

---

**Developed by Genius.africa**  
*Innovation • Technology • Excellence*
