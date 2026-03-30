# DreamDecode AI — Production Deployment Guide

## 🔑 Step 1: Set Up All Keys & Accounts

### A. Groq AI (Dream Interpretation Engine)

Your Groq key is already created. For production, store it securely:

```bash
# Set via EAS Secrets (recommended — never commit keys to git)
eas secret:create --name EXPO_PUBLIC_GROQ_API_KEY --value gsk_YOUR_REAL_KEY_HERE --scope project
```

Then update `app.json` → `extra.groqApiKey` to read from the env:
```json
"groqApiKey": "${process.env.EXPO_PUBLIC_GROQ_API_KEY}"
```

> ⚠️ **Rotate your current Groq key** at https://console.groq.com/keys since it was previously in source code.

---

### B. RevenueCat (Subscriptions)

1. **Create account**: https://app.revenuecat.com
2. **Create a Project** named "DreamDecode"
3. **Add iOS App**: Enter your App Store bundle ID (`com.dreamdecode.ai`) + App-Specific Shared Secret
4. **Add Android App**: Enter your Play Store package name (`com.dreamdecode.ai`)
5. **Create Products**:
   - `dreamdecode_monthly` — $3.99/month
   - `dreamdecode_annual` — $29.99/year
6. **Create Entitlement**: Name it `premium`, attach both products
7. **Create Offering**: Name it `default`, add both products
8. **Copy API Keys** → update in `lib/purchases.ts`:

```
ios: "appl_YOUR_IOS_KEY"
android: "goog_YOUR_ANDROID_KEY"
```

---

### C. Google AdMob (Ads)

1. **Create account**: https://admob.google.com
2. **Add iOS App** → get App ID (e.g., `ca-app-pub-1234567890123456~1234567890`)
3. **Add Android App** → get App ID
4. **Create Ad Units** for each app:
   - Banner Ad Unit
   - Interstitial Ad Unit
   - Rewarded Ad Unit
5. **Update `app.json`** with App IDs:

```json
["react-native-google-mobile-ads", {
  "androidAppId": "ca-app-pub-XXXX~YYYY",
  "iosAppId": "ca-app-pub-XXXX~YYYY"
}]
```

6. **Update `lib/ads.ts`** with Ad Unit IDs:

```typescript
banner: "ca-app-pub-XXXX/YYYY",
interstitial: "ca-app-pub-XXXX/YYYY",
rewarded: "ca-app-pub-XXXX/YYYY",
```

---

## 📱 Step 2: App Store (iOS) Setup

### A. Apple Developer Account ($99/year)

1. **Enroll**: https://developer.apple.com/programs/enroll/
2. **Create App ID**: developer.apple.com → Certificates, IDs & Profiles → Identifiers
   - Bundle ID: `com.dreamdecode.ai`
   - Enable: Push Notifications, In-App Purchase

### B. App Store Connect

1. **Create App**: https://appstoreconnect.apple.com → My Apps → "+"
   - Name: "DreamDecode AI"
   - Bundle ID: select `com.dreamdecode.ai`
   - SKU: `dreamdecode-ai`
2. **In-App Purchases**: Create subscriptions matching RevenueCat products
   - Go to Subscriptions → Create Subscription Group: "DreamDecode Premium"
   - Add: `dreamdecode_monthly` ($3.99) and `dreamdecode_annual` ($29.99)
3. **App-Specific Shared Secret**: App → In-App Purchases → Manage → App-Specific Shared Secret
   - Copy this into RevenueCat dashboard
4. **App Privacy**: Fill out the data collection questionnaire
5. **Note your ASC App ID** (numeric) from App → General → App Information

### C. Update eas.json

```json
"ios": {
  "appleId": "your@email.com",
  "ascAppId": "1234567890",
  "appleTeamId": "ABC123DEF4"
}
```

---

## 🤖 Step 3: Google Play Store (Android) Setup

### A. Google Play Developer Account ($25 one-time)

1. **Register**: https://play.google.com/console/signup
2. **Create App**: Play Console → Create App
   - App name: "DreamDecode AI"
   - Package name: `com.dreamdecode.ai`

### B. Google Play Billing (Subscriptions)

1. **Monetize → Subscriptions**: Create subscription products
   - `dreamdecode_monthly` — $3.99/month
   - `dreamdecode_annual` — $29.99/year
2. **Link to RevenueCat**: Copy the Base64 license key from
   Play Console → Monetize → Monetization Setup → Licensing
   → paste into RevenueCat Android app settings

### C. Service Account for Automated Submissions

1. **Google Cloud Console**: https://console.cloud.google.com
   - Create project or use existing
   - Enable "Google Play Android Developer API"
2. **Create Service Account**:
   - IAM & Admin → Service Accounts → Create
   - Name: `eas-submit`
   - Grant role: (none needed at this step)
   - Create JSON key → download as `google-service-account.json`
3. **Grant Access in Play Console**:
   - Play Console → Users & Permissions → Invite User
   - Add the service account email (from the JSON file)
   - Grant: "Release manager" permission for your app
4. **Place the JSON file** in your project root:

```
/DreamDecode/google-service-account.json
```

> ⚠️ **Add to `.gitignore`**: `google-service-account.json`

---

## 🏗️ Step 4: EAS Build & Submit

### A. Initial Setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Initialize project (gets your EAS Project ID)
eas init

# Copy the project ID into app.json → extra.eas.projectId
```

### B. Set Secrets (Never commit keys to git)

```bash
# Groq API key
eas secret:create --name EXPO_PUBLIC_GROQ_API_KEY --value "gsk_YOUR_KEY" --scope project
```

### C. Build for Production

```bash
# iOS production build
NODE_OPTIONS='--no-experimental-strip-types' eas build --platform ios --profile production

# Android production build (AAB for Play Store)
NODE_OPTIONS='--no-experimental-strip-types' eas build --platform android --profile production

# Both platforms
NODE_OPTIONS='--no-experimental-strip-types' eas build --platform all --profile production
```

### D. Submit to Stores

```bash
# Submit to App Store
NODE_OPTIONS='--no-experimental-strip-types' eas submit --platform ios --profile production

# Submit to Google Play
NODE_OPTIONS='--no-experimental-strip-types' eas submit --platform android --profile production
```

---

## 📋 Step 5: Store Listing Assets Needed

### App Store (iOS)
- [ ] 6.7" Screenshots (1290 × 2796) — at least 3
- [ ] 6.5" Screenshots (1284 × 2778) — at least 3
- [ ] 5.5" Screenshots (1242 × 2208) — at least 3
- [ ] iPad Screenshots (2048 × 2732) if supporting tablet
- [ ] App Icon (1024 × 1024, no alpha)
- [ ] Description (4000 chars max)
- [ ] Keywords (100 chars, comma-separated)
- [ ] Privacy Policy URL
- [ ] Support URL

### Google Play (Android)
- [ ] Phone Screenshots (min 2, up to 8) — 16:9 or 9:16
- [ ] Feature Graphic (1024 × 500)
- [ ] App Icon (512 × 512)
- [ ] Short Description (80 chars)
- [ ] Full Description (4000 chars)
- [ ] Privacy Policy URL
- [ ] Content Rating questionnaire
- [ ] Data Safety section

---

## 🔒 Step 6: Pre-Launch Checklist

- [ ] **Rotate Groq API key** (old one was in source code)
- [ ] All placeholder keys replaced with real values
- [ ] `google-service-account.json` added to `.gitignore`
- [ ] Privacy Policy page published (required by both stores)
- [ ] Terms of Service page published
- [ ] App icons and splash screen finalized
- [ ] Test on physical iOS device via TestFlight
- [ ] Test on physical Android device via internal track
- [ ] Verify subscriptions work end-to-end in sandbox
- [ ] Verify ads display correctly (use test IDs first)
- [ ] Verify dream interpretation returns valid responses
- [ ] Set up crash reporting (Sentry or similar)
- [ ] Remove any console.log/console.error in production

---

## 💰 Estimated Costs

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer Program | $99 | Annual |
| Google Play Developer | $25 | One-time |
| Groq API (Llama 3.3 70B) | ~$0.59/M input tokens | Per use |
| EAS Build (free tier) | $0 | 30 builds/month |
| RevenueCat | $0 | Free under $2.5k MTR |
| AdMob | $0 | Revenue share |
| **Total to launch** | **~$124** | |

---

## 🚀 Quick Start Commands

```bash
cd DreamDecode

# 1. Login
eas login

# 2. Initialize
eas init

# 3. Set your Groq API key as a secret
eas secret:create --name EXPO_PUBLIC_GROQ_API_KEY --value "YOUR_KEY" --scope project

# 4. Build preview (test on device first)
NODE_OPTIONS='--no-experimental-strip-types' eas build --platform all --profile preview

# 5. Build production
NODE_OPTIONS='--no-experimental-strip-types' eas build --platform all --profile production

# 6. Submit
NODE_OPTIONS='--no-experimental-strip-types' eas submit --platform all --profile production
```
