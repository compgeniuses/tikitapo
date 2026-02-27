#!/usr/bin/env node

/**
 * Mobile Build Script for tikiTaP0
 * 
 * This script automates the build process for Android APK and AAB files.
 * 
 * Usage:
 *   node scripts/build-mobile.js [apk|aab] [--release]
 * 
 * Examples:
 *   node scripts/build-mobile.js apk              # Build debug APK
 *   node scripts/build-mobile.js apk --release    # Build release APK
 *   node scripts/build-mobile.js aab --release    # Build AAB for Play Store
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  log(`\n> ${command}`, 'cyan');
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: options.cwd || process.cwd(),
      ...options 
    });
    return true;
  } catch (error) {
    if (!options.ignoreError) {
      log(`\n❌ Command failed: ${command}`, 'red');
      process.exit(1);
    }
    return false;
  }
}

function checkPrerequisites() {
  log('\n📋 Checking prerequisites...', 'yellow');
  
  // Check Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    log(`✓ Node.js: ${nodeVersion}`, 'green');
  } catch {
    log('❌ Node.js not found. Please install Node.js 18+', 'red');
    process.exit(1);
  }
  
  // Check Android SDK
  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!androidHome) {
    log('⚠️  ANDROID_HOME not set. Make sure Android Studio is installed.', 'yellow');
  } else {
    log(`✓ Android SDK: ${androidHome}`, 'green');
  }
  
  // Check if android directory exists
  if (!fs.existsSync('android')) {
    log('❌ Android platform not found. Running capacitor add...', 'yellow');
    exec('npx cap add android');
  }
}

function buildWeb() {
  log('\n🔨 Building web app...', 'yellow');
  exec('npm run build');
  log('✓ Web build complete', 'green');
}

function syncCapacitor() {
  log('\n📱 Syncing with Capacitor...', 'yellow');
  exec('npx cap sync');
  log('✓ Capacitor sync complete', 'green');
}

function checkSigningConfig(isRelease) {
  if (!isRelease) return true;
  
  const keyPropertiesPath = path.join('android', 'key.properties');
  const keystorePath = path.join('android', 'release-key.keystore');
  
  if (!fs.existsSync(keyPropertiesPath)) {
    log('\n⚠️  Release build requires signing configuration!', 'yellow');
    log('\nTo create a signing key, run:', 'cyan');
    log('  cd android', 'bright');
    log('  keytool -genkey -v -keystore release-key.keystore -alias tikitapo -keyalg RSA -keysize 2048 -validity 10000', 'bright');
    log('\nThen create android/key.properties with:', 'cyan');
    log('  storePassword=YOUR_PASSWORD', 'bright');
    log('  keyPassword=YOUR_PASSWORD', 'bright');
    log('  keyAlias=tikitapo', 'bright');
    log('  storeFile=release-key.keystore', 'bright');
    return false;
  }
  
  if (!fs.existsSync(keystorePath)) {
    log('\n❌ Keystore file not found at android/release-key.keystore', 'red');
    return false;
  }
  
  log('✓ Signing configuration found', 'green');
  return true;
}

function buildAPK(isRelease) {
  const buildType = isRelease ? 'Release' : 'Debug';
  log(`\n📦 Building ${buildType} APK...`, 'yellow');
  
  if (isRelease && !checkSigningConfig(true)) {
    process.exit(1);
  }
  
  const gradleCommand = isRelease 
    ? './gradlew assembleRelease'
    : './gradlew assembleDebug';
  
  exec(gradleCommand, { cwd: 'android' });
  
  const outputPath = isRelease
    ? 'android/app/build/outputs/apk/release/app-release.apk'
    : 'android/app/build/outputs/apk/debug/app-debug.apk';
  
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    log(`\n✅ ${buildType} APK built successfully!`, 'green');
    log(`📄 Location: ${outputPath}`, 'cyan');
    log(`📊 Size: ${sizeMB} MB`, 'cyan');
    
    // Copy to root for easy access
    const destName = isRelease ? 'tikitapo-release.apk' : 'tikitapo-debug.apk';
    fs.copyFileSync(outputPath, destName);
    log(`📋 Copied to: ${destName}`, 'cyan');
  } else {
    log('\n❌ APK build failed - output file not found', 'red');
    process.exit(1);
  }
}

function buildAAB() {
  log('\n📦 Building AAB for Google Play Store...', 'yellow');
  
  if (!checkSigningConfig(true)) {
    process.exit(1);
  }
  
  exec('./gradlew bundleRelease', { cwd: 'android' });
  
  const outputPath = 'android/app/build/outputs/bundle/release/app-release.aab';
  
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    log(`\n✅ AAB bundle built successfully!`, 'green');
    log(`📄 Location: ${outputPath}`, 'cyan');
    log(`📊 Size: ${sizeMB} MB`, 'cyan');
    
    // Copy to root for easy access
    fs.copyFileSync(outputPath, 'tikitapo.aab');
    log(`📋 Copied to: tikitapo.aab`, 'cyan');
    log(`\n🚀 Ready for Google Play Store upload!`, 'magenta');
  } else {
    log('\n❌ AAB build failed - output file not found', 'red');
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
${colors.bright}tikiTaP0 Mobile Build Script${colors.reset}

Usage:
  node scripts/build-mobile.js [command] [options]

Commands:
  apk       Build APK file
  aab       Build AAB bundle for Play Store
  help      Show this help message

Options:
  --release    Build release version (signed)
  --skip-web   Skip web build (use existing dist/)
  --open       Open Android Studio after build

Examples:
  node scripts/build-mobile.js apk              # Debug APK
  node scripts/build-mobile.js apk --release    # Release APK
  node scripts/build-mobile.js aab --release    # Play Store bundle
  node scripts/build-mobile.js apk --skip-web   # Use existing dist/
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('help') || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }
  
  const command = args[0];
  const isRelease = args.includes('--release');
  const skipWeb = args.includes('--skip-web');
  const openStudio = args.includes('--open');
  
  log(`${colors.bright}
╔════════════════════════════════════════════════╗
║      tikiTaP0 Mobile Build Script              ║
║      Developed by Genius.africa                ║
╚════════════════════════════════════════════════╝${colors.reset}\n`);
  
  // Check prerequisites
  checkPrerequisites();
  
  // Build web app
  if (!skipWeb) {
    buildWeb();
  } else {
    log('\n⏩ Skipping web build (--skip-web)', 'yellow');
  }
  
  // Sync with Capacitor
  syncCapacitor();
  
  // Build based on command
  switch (command) {
    case 'apk':
      buildAPK(isRelease);
      break;
    case 'aab':
      if (!isRelease) {
        log('\n⚠️  AAB should be built in release mode for Play Store', 'yellow');
        log('Use: node scripts/build-mobile.js aab --release\n', 'cyan');
      }
      buildAAB();
      break;
    default:
      log(`\n❌ Unknown command: ${command}`, 'red');
      showHelp();
      process.exit(1);
  }
  
  // Open Android Studio if requested
  if (openStudio) {
    log('\n📱 Opening Android Studio...', 'yellow');
    exec('npx cap open android');
  }
  
  log(`\n${colors.bright}${colors.green}✨ Build process complete!${colors.reset}\n`);
}

main().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
