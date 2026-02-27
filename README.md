<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# tikiTaP0 - Connect. Compete. Conquer.

A modern, feature-rich Connect-N strategy game built with React and powered by Genius.africa.

[![Web](https://img.shields.io/badge/Web-Ready-brightgreen)](https://ai.studio/apps/drive/12ARZp-B5NuWwVcUJkjF9jzZUUr33Zbys)
[![Android](https://img.shields.io/badge/Android-APK%2FAAB-blue)](./MOBILE_BUILD_GUIDE.md)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blueviolet)](./.github/workflows/README.md)
[![Platform](https://img.shields.io/badge/Platform-Capacitor-orange)](https://capacitorjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)]()

## 🚀 Quick Deploy

| Platform | Status | Action |
|----------|--------|--------|
| Web | ✅ Ready | [Play Now](https://ai.studio/apps/drive/12ARZp-B5NuWwVcUJkjF9jzZUUr33Zbys) |
| Android APK | 🔄 Auto-build | [Download from Actions](https://github.com/compgeniuses/tikitapo/actions) |
| Android AAB | 🔄 Auto-build | [Download from Actions](https://github.com/compgeniuses/tikitapo/actions) |
| Play Store | 📦 Ready for upload | Build AAB → Upload |

## Features

- **Multiple Game Modes**: vs CPU, vs AI, 2 Player, Online Multiplayer
- **Difficulty Levels**: Simple, Hard, Pro with structured progression
- **Immersive Themes**: Sci-Fi, Jungle, Ocean with animated backgrounds
- **AI Integration**: Google Gemini API for personalized avatars and victory images
- **Real-time Multiplayer**: Socket.IO powered online matches
- **Mobile Optimized**: Native Android APK/AAB builds via Capacitor

## 🆕 CI/CD - Automated Builds (No Local Setup Required!)

### GitHub Actions Workflows

This project includes **automated CI/CD pipelines** that build your APK and AAB files in the cloud!

**No need to install Android Studio locally** - just push to GitHub and download your builds.

#### Available Workflows:

| Workflow | Trigger | Output | Time |
|----------|---------|--------|------|
| **Build Debug APK** | Every push to main | `tikitapo-debug.apk` | ~5 min |
| **Build Release APK** | Tags (v1.0.0) | `tikitapo-release.apk` | ~7 min |
| **Build AAB** | Manual or tags | `tikitapo.aab` (Play Store) | ~7 min |
| **Build All** | Manual | APK + AAB | ~10 min |

#### How to Build via GitHub Actions:

1. **Push your code** to GitHub
2. Go to **Actions** tab in your repository
3. Select a workflow (e.g., "Build Android App Bundle")
4. Click **"Run workflow"**
5. Download your files from the **Artifacts** section

#### For Signed Release Builds:

Add these secrets to GitHub (Settings → Secrets → Actions):
- `RELEASE_KEYSTORE_BASE64` - Your keystore (base64 encoded)
- `KEYSTORE_PASSWORD` - Keystore password
- `KEY_PASSWORD` - Key password

See [CI/CD Documentation](./.github/workflows/README.md) for detailed setup instructions.

---

## Quick Start

### Web (Development)

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# Run development server
npm run dev
```

Open http://localhost:5173 to play!

### Mobile (Android)

See the [Mobile Build Guide](./MOBILE_BUILD_GUIDE.md) for detailed instructions.

**Quick Build Commands:**

```bash
# Install dependencies
npm install

# Build debug APK (for testing)
npm run mobile:apk

# Build release APK (for distribution)
npm run mobile:apk-release

# Build AAB for Google Play Store
npm run mobile:aab
```

## Platforms

### Web
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for desktop and mobile browsers
- PWA support for installable web app

### Android
- APK files for direct installation
- AAB bundles for Google Play Store
- Native performance via Capacitor.js
- Screen orientation locked to portrait
- Optimized touch controls

## Build Scripts

### Web Development
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Mobile Development
```bash
# Quick builds
npm run mobile:apk         # Debug APK
npm run mobile:apk-release # Release APK
npm run mobile:aab         # Play Store bundle

# Individual steps
npm run mobile:build       # Build web + sync
npm run mobile:sync        # Sync with Capacitor
npm run mobile:open        # Open in Android Studio
npm run android:icons      # Generate app icons
```

### Custom Build Script
```bash
# Build with options
node scripts/build-mobile.js apk --release
node scripts/build-mobile.js aab --release --open
```

## Documentation

- **[Mobile Build Guide](./MOBILE_BUILD_GUIDE.md)** - Complete guide for APK and AAB builds
- **[Capacitor Documentation](https://capacitorjs.com/docs)** - Native mobile app framework

## Environment Variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_api_key_here
```

Get your API key from: https://ai.google.dev/

## Requirements

### Web
- Node.js 18+
- Modern web browser

### Mobile
- Node.js 18+
- Android Studio (for building APK/AAB)
- JDK 17+
- Android SDK

## Project Structure

```
tikitapo/
├── android/              # Android native project
├── components/           # React components
├── services/             # Game logic & APIs
├── resources/            # App icons and splash screens
├── scripts/              # Build automation scripts
├── src/                  # Source files
├── capacitor.config.ts   # Capacitor configuration
├── MOBILE_BUILD_GUIDE.md # Mobile build documentation
└── README.md            # This file
```

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Mobile**: Capacitor 8, Android SDK
- **Build Tool**: Vite 6
- **AI**: Google Gemini API
- **Multiplayer**: Socket.IO
- **State**: React Hooks

## Support

- **Issues**: [GitHub Issues](https://github.com/compgeniuses/tikitapo/issues)
- **Documentation**: See [MOBILE_BUILD_GUIDE.md](./MOBILE_BUILD_GUIDE.md)
- **Capacitor**: https://capacitorjs.com/docs

## License

MIT License - See LICENSE file for details

---

**Developed by [Genius.africa](https://genius.africa)**  
*Innovation • Technology • Excellence*

View the app in AI Studio: https://ai.studio/apps/drive/12ARZp-B5NuWwVcUJkjF9jzZUUr33Zbys
