# 📱 Build Your First APK and AAB - Step by Step Guide

This guide will walk you through building your first Android APK and AAB files for tikiTaP0.

## ✅ Prerequisites Check

Before we start, let's verify everything is ready:

### 1. Check Java Installation
Open Command Prompt and run:
```cmd
java --version
```

You should see something like:
```
java 17.0.x 2023-xx-xx LTS
```

✅ **If Java is installed** → Continue to step 2  
❌ **If Java is NOT installed** → Download from: https://adoptium.net/

### 2. Check Android Studio Installation

You need Android Studio installed. Download from:
https://developer.android.com/studio

**During installation, make sure to install:**
- ✅ Android SDK
- ✅ Android SDK Platform-Tools
- ✅ Android SDK Build-Tools
- ✅ Android Emulator (optional, for testing)

### 3. Verify Project Setup

Your project should already have:
- ✅ Node modules installed (`npm install` completed)
- ✅ Android platform added (`android/` folder exists)
- ✅ Web assets built (`dist/` folder exists)

## 🚀 Method 1: Using Android Studio (Recommended)

This is the most reliable method, especially for first-time builds.

### Step 1: Build Web Assets

Open Command Prompt in the project folder and run:

```cmd
npm run build
```

You should see:
```
vite v6.4.1 building for production...
✓ 94 modules transformed.
✓ built in X.XXs
```

### Step 2: Sync with Capacitor

Run:
```cmd
npx cap sync
```

You should see:
```
✓ Copying web assets from dist to android\app\src\main\assets\public
✓ Creating capacitor.config.json
✓ update android in X.XXs
[success] android platform is ready!
```

### Step 3: Open Android Studio

Run:
```cmd
npx cap open android
```

This will open Android Studio with the tikiTaP0 project.

**First time setup in Android Studio:**
1. Wait for Gradle sync to complete (may take 5-10 minutes first time)
2. You might see "Gradle project sync failed" - click "Try Again"
3. Accept any SDK license agreements if prompted

### Step 4: Build Debug APK

In Android Studio:

1. **Select Build Variant:**
   - Look at the bottom-left of Android Studio
   - Click on "Build Variants" tab
   - Make sure "app" module is set to "debug"

2. **Build the APK:**
   - Go to **Build** menu → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - OR use keyboard shortcut: `Ctrl+F9`

3. **Wait for build:**
   - You'll see progress at the bottom of Android Studio
   - First build may take 5-15 minutes (downloads dependencies)
   - Subsequent builds are faster

4. **Locate the APK:**
   - After build completes, you'll see a notification
   - Click "locate" in the notification
   - OR go to: `android\app\build\outputs\apk\debug\`
   - File: `app-debug.apk`

✅ **Congratulations! You have your first APK!**

### Step 5: Install and Test

To test on your Android device:

1. **Enable Developer Options on your phone:**
   - Go to **Settings** → **About Phone**
   - Tap **Build Number** 7 times
   - Enter your PIN/password
   - You'll see "You are now a developer!"

2. **Enable USB Debugging:**
   - Go to **Settings** → **System** → **Developer Options**
   - Turn on **USB Debugging**

3. **Connect your phone:**
   - Connect Android phone to computer via USB
   - On phone, allow USB debugging when prompted

4. **Install APK:**
   - In Android Studio, click the green **Run** button (▶️)
   - Select your device from the dropdown
   - The app will install and launch automatically!

**OR manually install:**
```cmd
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

## 🔨 Method 2: Using Command Line (Faster for repeated builds)

Once Android Studio has done the initial setup, you can use command line for faster builds.

### Build Debug APK via Command Line

```cmd
# Build web assets
npm run build

# Sync with Capacitor
npx cap sync

# Build APK
cd android
gradlew.bat assembleDebug
```

**Output location:**
```
android\app\build\outputs\apk\debug\app-debug.apk
```

### Build Release APK (For Distribution)

Before building a release APK, you need to set up signing.

#### Step 1: Create Signing Keystore

Open Command Prompt in the `android` folder:

```cmd
cd android
keytool -genkey -v -keystore release-key.keystore -alias tikitapo -keyalg RSA -keysize 2048 -validity 10000
```

**You'll be asked for:**
- Keystore password (create a strong one, remember it!)
- Key password (can be same as keystore)
- Your information (name, organization, etc.)

**IMPORTANT:** Keep the `release-key.keystore` file safe! You'll need it for all future updates.

#### Step 2: Create key.properties

Create a new file: `android\key.properties`

Add this content:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=tikitapo
storeFile=release-key.keystore
```

Replace with your actual passwords!

#### Step 3: Build Release APK

```cmd
# Make sure you're in project root
cd ..

# Build web assets
npm run build

# Sync with Capacitor
npx cap sync

# Build release APK
cd android
gradlew.bat assembleRelease
```

**Output location:**
```
android\app\build\outputs\apk\release\app-release.apk
```

✅ **This APK is signed and ready for distribution!**

## 📦 Building AAB for Google Play Store

AAB (Android App Bundle) is the format required by Google Play Store.

### Prerequisites
- ✅ Completed release APK setup (keystore + key.properties)
- ✅ Google Play Developer account ($25 one-time fee)

### Build AAB

```cmd
# Build web assets
npm run build

# Sync with Capacitor
npx cap sync

# Build AAB
cd android
gradlew.bat bundleRelease
```

**Output location:**
```
android\app\build\outputs\bundle\release\app-release.aab
```

### Upload to Google Play Store

1. Go to https://play.google.com/console
2. Sign in with your Google account
3. Click "Create app"
4. Fill in app details:
   - App name: tikiTaP0
   - Default language: English
   - App or game: App
   - Free or paid: Free
5. Go to **Production** → **Create new release**
6. Upload your `app-release.aab` file
7. Add release notes
8. Save and publish!

## 🎯 Quick Reference Commands

### Using the Batch Script (Easiest)

Double-click `build-mobile.bat` in the project folder and follow the menu.

### Using NPM Scripts

```bash
# Debug APK
npm run mobile:apk

# Release APK (requires signing setup)
npm run mobile:apk-release

# AAB for Play Store (requires signing setup)
npm run mobile:aab
```

### Using Build Script

```bash
# Debug APK
node scripts/build-mobile.js apk

# Release APK
node scripts/build-mobile.js apk --release

# AAB
node scripts/build-mobile.js aab --release
```

## 🐛 Troubleshooting

### Issue: "JAVA_HOME is not set"

**Solution:**
1. Find your Java installation (usually `C:\Program Files\Java\jdk-17`)
2. Set environment variable:
   ```cmd
   setx JAVA_HOME "C:\Program Files\Java\jdk-17"
   ```
3. Restart Command Prompt

### Issue: "gradlew.bat is not recognized"

**Solution:**
1. Make sure you're in the `android` folder
2. Use full path:
   ```cmd
   .\gradlew.bat assembleDebug
   ```

### Issue: "Could not find android-sdk"

**Solution:**
1. Open Android Studio
2. Go to **File** → **Settings** → **Appearance & Behavior** → **System Settings** → **Android SDK**
3. Copy the "Android SDK Location" path
4. Set environment variable:
   ```cmd
   setx ANDROID_HOME "C:\Users\[YourName]\AppData\Local\Android\Sdk"
   ```
5. Restart Command Prompt

### Issue: Build fails with "Duplicate class" errors

**Solution:**
```cmd
cd android
gradlew.bat clean
cd ..
npm run mobile:sync
```

### Issue: "Timeout downloading Gradle"

**Solution:**
- Check your internet connection
- Try building using Android Studio instead (more reliable)
- OR wait and try again later

### Issue: App crashes on launch

**Solution:**
1. Check `capacitor.config.ts` has correct `appId`
2. Make sure `webDir` is set to `dist`
3. Run `npm run mobile:sync` again
4. Clean build:
   ```cmd
   cd android
   gradlew.bat clean
   gradlew.bat assembleDebug
   ```

## 📊 Build Output Locations

After successful build, you'll find:

| Build Type | Location |
|------------|----------|
| Debug APK | `android\app\build\outputs\apk\debug\app-debug.apk` |
| Release APK | `android\app\build\outputs\apk\release\app-release.apk` |
| AAB Bundle | `android\app\build\outputs\bundle\release\app-release.aab` |

**Convenience copies in root:**
- `tikitapo-debug.apk`
- `tikitapo-release.apk`
- `tikitapo.aab`

## 🎉 Success!

You now have:
- ✅ Debug APK for testing
- ✅ Knowledge to build Release APK
- ✅ Knowledge to build AAB for Play Store
- ✅ Instructions to publish on Google Play

**Next Steps:**
1. Test the debug APK on your device
2. Set up signing for release builds
3. Create your Google Play Developer account
4. Publish your app!

## 📚 Additional Resources

- **Mobile Build Guide**: `MOBILE_BUILD_GUIDE.md`
- **Implementation Summary**: `MOBILE_IMPLEMENTATION_SUMMARY.md`
- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Studio Docs**: https://developer.android.com/studio/intro

---

**Developed by Genius.africa**  
*Innovation • Technology • Excellence*

Need help? Check the troubleshooting section above or refer to the detailed guides!
