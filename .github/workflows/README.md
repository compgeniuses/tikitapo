# GitHub CI/CD Pipeline Documentation

This document explains how to use the GitHub Actions CI/CD pipelines for building and distributing tikiTaP0 Android apps.

## 🚀 Quick Start

### Building Your First AAB/APK via GitHub Actions

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add mobile build configuration"
   git push origin main
   ```

2. **Go to GitHub Actions**
   - Open your repository on GitHub
   - Click the **"Actions"** tab
   - You'll see several workflows listed

3. **Run a workflow**
   - Click on **"Build Android App Bundle (AAB)"**
   - Click **"Run workflow"** dropdown
   - Optionally enter a version number
   - Click the green **"Run workflow"** button

4. **Download your files**
   - Wait for the workflow to complete (5-10 minutes)
   - Click on the completed workflow run
   - Scroll down to **"Artifacts"** section
   - Download your AAB/APK files!

---

## 📋 Available Workflows

### 1. Build Android Debug APK
**File**: `.github/workflows/android-debug-apk.yml`

**Purpose**: Build unsigned debug APK for testing

**Triggers**:
- Automatically on every push to `main`, `master`, or `develop`
- On pull requests to `main` or `master`
- Manually via workflow dispatch

**Output**: `tikitapo-debug.apk`

**Use Case**: Quick testing, development builds

### 2. Build Android Release APK
**File**: `.github/workflows/android-release-apk.yml`

**Purpose**: Build signed release APK for distribution

**Triggers**:
- On pushes to `main` or `master`
- When a version tag is pushed (e.g., `v1.0.0`)
- Manually via workflow dispatch

**Requirements**: 
- `RELEASE_KEYSTORE_BASE64` secret (base64 encoded keystore)
- `KEYSTORE_PASSWORD` secret
- `KEY_PASSWORD` secret

**Output**: `tikitapo-release-{version}.apk`

**Use Case**: Production releases, distribution outside Play Store

### 3. Build Android App Bundle (AAB)
**File**: `.github/workflows/android-aab.yml`

**Purpose**: Build signed AAB for Google Play Store

**Triggers**:
- On pushes to `main` or `master`
- When a version tag is pushed
- Manually via workflow dispatch
- Optional: Upload directly to Play Store

**Requirements**:
- `RELEASE_KEYSTORE_BASE64` secret
- `KEYSTORE_PASSWORD` secret
- `KEY_PASSWORD` secret
- Optional: `PLAY_STORE_SERVICE_ACCOUNT_JSON` for auto-upload

**Output**: `tikitapo-{version}.aab`

**Use Case**: Google Play Store publishing

### 4. Build All Artifacts
**File**: `.github/workflows/build-all.yml`

**Purpose**: Build debug APK, release APK, and AAB in one run

**Triggers**:
- Manually via workflow dispatch only

**Options**:
- Select which artifacts to build (all, debug-apk, release-apk, aab)
- Option to create GitHub release
- Enter custom release tag

**Output**: All selected artifacts

**Use Case**: Complete release builds, publishing multiple formats

### 5. PR Validation
**File**: `.github/workflows/pr-validation.yml`

**Purpose**: Validate that PRs don't break the build

**Triggers**:
- On all pull requests to `main`, `master`, or `develop`

**Actions**:
- Installs dependencies
- Builds web app
- Syncs with Capacitor
- Validates Android compilation

**Output**: Build status check

**Use Case**: Prevent broken code from being merged

---

## 🔐 Setting Up Signing Secrets

### Why You Need This

Release APKs and AAB bundles **must be signed** before distribution. The CI/CD pipeline needs your signing keystore to sign the builds.

### Step 1: Create Your Keystore (One Time)

If you don't have a keystore yet, create one locally:

```bash
cd android
keytool -genkey -v -keystore release-key.keystore -alias tikitapo -keyalg RSA -keysize 2048 -validity 10000
```

Remember your passwords! You'll need them in the next steps.

### Step 2: Encode Keystore to Base64

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("android/release-key.keystore")) | Out-File -Encoding ASCII "keystore.b64"
```

**On Mac/Linux:**
```bash
base64 -w 0 android/release-key.keystore > keystore.b64
```

**On Windows (WSL/Git Bash):**
```bash
base64 -w 0 android/release-key.keystore > keystore.b64
```

### Step 3: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **"New repository secret"**

Add these secrets:

#### Secret 1: RELEASE_KEYSTORE_BASE64
- **Name**: `RELEASE_KEYSTORE_BASE64`
- **Value**: Copy and paste the contents of `keystore.b64` file

#### Secret 2: KEYSTORE_PASSWORD
- **Name**: `KEYSTORE_PASSWORD`
- **Value**: The password you entered when creating the keystore

#### Secret 3: KEY_PASSWORD
- **Name**: `KEY_PASSWORD`
- **Value**: The key password (often the same as keystore password)

### Step 4: Verify Setup

Run a workflow to test:
1. Go to Actions tab
2. Click "Build Android App Bundle (AAB)"
3. Click "Run workflow"
4. Check that it completes successfully

---

## 📤 Setting Up Google Play Store Auto-Upload (Optional)

### What This Does

Automatically upload your AAB to Google Play Store when you create a release!

### Prerequisites

1. Google Play Developer account ($25 one-time fee)
2. App created in Play Console
3. Service account with API access

### Step 1: Create Service Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Setup** → **API access**
3. Click **"Create new service account"**
4. Follow the link to Google Cloud Console
5. Create a service account:
   - Name: `github-actions-uploader`
   - Role: `Service Account User`
   - Create key (JSON format)
6. Download the JSON key file
7. Back in Play Console, click **"Grant access"** for the service account
8. Set permission to **"Release manager"** (or Admin)

### Step 2: Add JSON Key to GitHub Secrets

1. Open the downloaded JSON file
2. Copy the entire contents
3. Go to GitHub → Settings → Secrets → Actions
4. Click **"New repository secret"**
5. **Name**: `PLAY_STORE_SERVICE_ACCOUNT_JSON`
6. **Value**: Paste the entire JSON content
7. Click **"Add secret"**

### Step 3: Enable Auto-Upload

When running the AAB workflow manually, check the **"Upload to Google Play Store"** option.

Or modify `.github/workflows/android-aab.yml` to always upload:
```yaml
- name: Upload to Google Play Store
  if: github.ref == 'refs/heads/main'  # Auto-upload on main branch
  uses: r0adkll/upload-google-play@v1
  ...
```

---

## 🏷️ Automated Releases with Tags

### Creating Versioned Releases

When you push a tag like `v1.0.0`, the workflows automatically:
1. Build signed release APK
2. Build signed AAB
3. Create a GitHub Release
4. Attach the APK and AAB to the release

### How to Create a Release

**Option 1: Using Git CLI**
```bash
# Create and push a tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

**Option 2: Using GitHub Web Interface**
1. Go to your repository
2. Click **Releases** → **Create a new release**
3. Enter a tag name: `v1.0.0`
4. Click **"Create new tag"**
5. Fill in release notes
6. Click **"Publish release"**

**Option 3: Using Build All Workflow**
1. Go to Actions → "Build All Android Artifacts"
2. Click "Run workflow"
3. Select "all" for build type
4. Check "Create GitHub release"
5. Enter release tag: `v1.0.0`
6. Click "Run workflow"

---

## 📊 Workflow Caching

All workflows use caching to speed up builds:

- **Node modules**: Cached based on `package-lock.json`
- **Gradle packages**: Cached based on Gradle files
- **Build time**: ~3-5 minutes (after first run)

First build: ~10-15 minutes  
Subsequent builds: ~3-5 minutes

---

## 🐛 Troubleshooting

### Workflow Fails with "Keystore not found"

**Error:**
```
Error: RELEASE_KEYSTORE_BASE64 secret not set
```

**Solution:**
Follow the "Setting Up Signing Secrets" section above.

### Workflow Fails with "Build failed"

**Check:**
1. Did the web app build successfully?
2. Check the workflow logs for specific errors
3. Try running locally: `npm run build && npx cap sync`

### AAB Upload to Play Store Fails

**Check:**
1. Is `PLAY_STORE_SERVICE_ACCOUNT_JSON` set correctly?
2. Does the service account have Release Manager permission?
3. Is the package name correct? (`africa.genius.tikitapo`)
4. Check Play Console for any policy issues

### Artifact Not Found

**Check:**
1. Did the build step complete successfully?
2. Check the workflow logs for "Upload artifact" step
3. Artifacts are kept for 90 days (configurable)

---

## 🔧 Customizing Workflows

### Changing Node.js or Java Version

Edit the workflow files:
```yaml
env:
  NODE_VERSION: '20'  # Change from '18'
  JAVA_VERSION: '21'  # Change from '17'
```

### Changing Retention Period

Artifacts are kept for 90 days by default. Change in workflow:
```yaml
- name: Upload Artifact
  uses: actions/upload-artifact@v4
  with:
    retention-days: 30  # Change as needed
```

### Adding More Build Types

Copy an existing workflow and modify the Gradle command:
```yaml
- name: Build Custom Variant
  run: ./gradlew assembleCustomRelease
```

---

## 📈 Monitoring Builds

### View Build Status

1. Go to repository on GitHub
2. Click **Actions** tab
3. See list of recent workflow runs
4. Green checkmark = Success
5. Red X = Failed

### Get Notifications

**Email Notifications:**
- GitHub sends emails for failed builds
- Check your GitHub notification settings

**Slack/Discord Integration:**
Add to your workflow:
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  if: always()
  with:
    status: ${{ job.status }}
    channel: '#builds'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 📝 Best Practices

### 1. Use Branches for Development

- `main` or `master`: Production-ready code
- `develop`: Integration branch
- Feature branches: `feature/new-feature`

### 2. Tag Your Releases

Always use semantic versioning:
- `v1.0.0` - Major release
- `v1.1.0` - Minor release
- `v1.1.1` - Patch release

### 3. Write Good Commit Messages

This helps with release notes:
```
feat: Add new Sci-Fi theme
gix: Fix multiplayer connection issue
docs: Update README with new instructions
```

### 4. Protect Your Secrets

- Never commit keystore files
- Never commit `key.properties`
- Regularly rotate secrets if needed
- Use GitHub's secret scanning

### 5. Test Before Releasing

Always test the debug APK before creating a release:
1. Download debug APK from Actions
2. Install on device
3. Test all features
4. Then create release

---

## 🎯 Common Use Cases

### "I want to test my changes"

1. Push to `develop` branch
2. Debug APK builds automatically
3. Download from Actions → Artifacts

### "I want to share a beta version"

1. Run "Build Android Release APK" workflow manually
2. Enter version: `1.0.0-beta.1`
3. Download signed APK
4. Share with testers

### "I want to publish to Play Store"

1. Run "Build Android App Bundle (AAB)" workflow
2. Check "Upload to Google Play Store" (if auto-upload is set up)
3. Or download AAB and upload manually to Play Console

### "I need all formats at once"

1. Run "Build All Android Artifacts" workflow
2. Select "all"
3. Get debug APK, release APK, and AAB in one download

---

## 📚 Related Documentation

- [Mobile Build Guide](./MOBILE_BUILD_GUIDE.md) - Local builds
- [Build First APK Guide](./BUILD_FIRST_APK_GUIDE.md) - Getting started
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Capacitor Android Docs](https://capacitorjs.com/docs/android)

---

**Need Help?**

If workflows fail, check:
1. This troubleshooting section
2. Workflow logs in GitHub Actions
3. GitHub's [Actions documentation](https://docs.github.com/en/actions)

---

*Last Updated: 2024*  
*Developed by Genius.africa*  
*Innovation • Technology • Excellence*
