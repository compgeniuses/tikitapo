@echo off
chcp 65001 >nul
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║        tikiTaP0 Mobile Build Launcher                     ║
echo ║        Developed by Genius.africa                         ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo This script will help you build APK and AAB files.
echo.
echo Prerequisites:
echo   1. Android Studio installed
echo   2. Java 17+ installed
echo   3. Node.js dependencies installed (npm install)
echo.
echo Choose build option:
echo   [1] Build Debug APK (for testing)
echo   [2] Build Release APK (requires signing setup)
echo   [3] Build AAB for Play Store (requires signing setup)
echo   [4] Open in Android Studio
echo   [5] Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto debug_apk
if "%choice%"=="2" goto release_apk
if "%choice%"=="3" goto aab
if "%choice%"=="4" goto open_studio
if "%choice%"=="5" goto exit
goto invalid

:debug_apk
echo.
echo Building Debug APK...
echo Step 1/3: Building web app
call npm run build
if errorlevel 1 goto build_error

echo.
echo Step 2/3: Syncing with Capacitor
call npx cap sync
if errorlevel 1 goto sync_error

echo.
echo Step 3/3: Building Android Debug APK
cd android
gradlew.bat assembleDebug
if errorlevel 1 goto gradle_error
cd ..

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  ✅ Debug APK Built Successfully!                         ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo Location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
copy android\app\build\outputs\apk\debug\app-debug.apk tikitapo-debug.apk >nul 2>&1
echo Copied to: tikitapo-debug.apk
echo.
pause
goto exit

:release_apk
echo.
echo Building Release APK...
echo Checking for signing configuration...
if not exist "android\key.properties" (
    echo.
    echo ⚠️  WARNING: Signing configuration not found!
    echo.
    echo To create a release build, you need to:
    echo.
    echo 1. Create a keystore file:
    echo    cd android
    echo    keytool -genkey -v -keystore release-key.keystore -alias tikitapo -keyalg RSA -keysize 2048 -validity 10000
    echo.
    echo 2. Create android\key.properties with:
    echo    storePassword=YOUR_PASSWORD
    echo    keyPassword=YOUR_PASSWORD  
    echo    keyAlias=tikitapo
    echo    storeFile=release-key.keystore
    echo.
    echo Would you like to proceed with an UNSIGNED release build? (not recommended)
    set /p confirm="Continue? (y/n): "
    if /i not "%confirm%"=="y" goto exit
)

echo.
echo Step 1/3: Building web app
call npm run build
if errorlevel 1 goto build_error

echo.
echo Step 2/3: Syncing with Capacitor
call npx cap sync
if errorlevel 1 goto sync_error

echo.
echo Step 3/3: Building Android Release APK
cd android
gradlew.bat assembleRelease
if errorlevel 1 goto gradle_error
cd ..

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  ✅ Release APK Built Successfully!                       ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo Location: android\app\build\outputs\apk\release\app-release.apk
echo.
copy android\app\build\outputs\apk\release\app-release.apk tikitapo-release.apk >nul 2>&1
echo Copied to: tikitapo-release.apk
echo.
echo ⚠️  Note: If unsigned, you need to sign before distribution.
echo.
pause
goto exit

:aab
echo.
echo Building AAB for Google Play Store...
echo Checking for signing configuration...
if not exist "android\key.properties" (
    echo.
    echo ⚠️  WARNING: Signing configuration not found!
    echo.
    echo AAB files MUST be signed for Google Play Store!
    echo.
    echo Please set up signing first:
    echo 1. Create android\release-key.keystore
    echo 2. Create android\key.properties
    echo.
    echo See MOBILE_BUILD_GUIDE.md for detailed instructions.
    echo.
    pause
    goto exit
)

echo.
echo Step 1/3: Building web app
call npm run build
if errorlevel 1 goto build_error

echo.
echo Step 2/3: Syncing with Capacitor
call npx cap sync
if errorlevel 1 goto sync_error

echo.
echo Step 3/3: Building Android App Bundle
cd android
gradlew.bat bundleRelease
if errorlevel 1 goto gradle_error
cd ..

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  ✅ AAB Bundle Built Successfully!                        ║
echo ║  🚀 Ready for Google Play Store!                          ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo Location: android\app\build\outputs\bundle\release\app-release.aab
echo.
copy android\app\build\outputs\bundle\release\app-release.aab tikitapo.aab >nul 2>&1
echo Copied to: tikitapo.aab
echo.
echo Next steps:
echo 1. Go to https://play.google.com/console
echo 2. Create or select your app
echo 3. Upload the AAB file to Production
echo.
pause
goto exit

:open_studio
echo.
echo Opening Android Studio...
call npx cap open android
goto exit

:build_error
echo.
echo ❌ Error: Web build failed!
echo Please check for TypeScript errors and try again.
pause
goto exit

:sync_error
echo.
echo ❌ Error: Capacitor sync failed!
echo Make sure Capacitor is properly installed.
pause
goto exit

:gradle_error
echo.
echo ❌ Error: Gradle build failed!
echo.
echo Common solutions:
echo 1. Make sure Android Studio is installed
echo 2. Check that JAVA_HOME is set correctly
echo 3. Try running: cd android && gradlew.bat clean
echo 4. Check your internet connection (Gradle may need to download dependencies)
echo.
cd ..
pause
goto exit

:invalid
echo.
echo ❌ Invalid choice. Please enter 1, 2, 3, 4, or 5.
pause
goto exit

:exit
echo.
echo Goodbye!
timeout /t 2 >nul
