# 🚀 DreamDecode AI — Publishing Guide

## Prerequisites

Before you can build and publish, you need to set up a few accounts and replace placeholder values.

---

## Step 1: API Keys & Accounts Setup

### 1.1 Google Gemini API Key (FREE)
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Replace `YOUR_GEMINI_API_KEY` in `lib/gemini.ts` (line 5)
5. Also replace in `eas.json` for production builds

### 1.2 Apple Developer Account ($99/year)
1. Go to https://developer.apple.com/programs/enroll/
2. Enroll in the Apple Developer Program
3. Note your **Team ID** (visible in Membership tab)

### 1.3 Google Play Console ($25 one-time)
1. Go to https://play.google.com/console/signup
2. Pay the $25 registration fee
3. Create a developer account

### 1.4 AdMob Account (FREE)
1. Go to https://admob.google.com/
2. Sign up / sign in with Google
3. Create a new app for iOS and Android
4. Create 3 ad units per platform:
   - **Banner** (for journal screen)
   - **Interstitial** (after dream interpretation)
   - **Rewarded** (for bonus interpretations)
5. Replace placeholder IDs:
   - `app.json` → `react-native-google-mobile-ads` plugin → `androidAppId` and `iosAppId`
   - `lib/ads.ts` → `AD_UNITS` object → replace with real ad unit IDs

### 1.5 RevenueCat Account (FREE under $2.5K MTR)
1. Go to https://app.revenuecat.com/signup
2. Create a project called "DreamDecode"
3. Add your iOS and Android apps
4. Create two products:
   - `dreamdecode_monthly` — $3.99/month
   - `dreamdecode_annual` — $29.99/year
5. Create an offering with both packages
6. Copy API keys and replace in `lib/purchases.ts`:
   - `API_KEYS.ios`
   - `API_KEYS.android`

---

## Step 2: EAS Setup

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Link this project to EAS
cd DreamDecode
eas init

# This will give you a project ID — it's automatically added to app.json
```

---

## Step 3: App Store Assets

### Icon (Required)
- **Size:** 1024x1024 px (no transparency, no rounded corners)
- **Design:** Moon/crystal ball on deep navy/purple gradient background
- Generate using Canva, Figma, or AI tool (Midjourney/DALL-E)
- Place at `assets/images/icon.png`

### Screenshots (Required)
- **iOS:** 6.7" (1290x2796) and 5.5" (1242x2208)
- **Android:** Phone (1080x1920 minimum)
- Take screenshots using simulator/emulator
- Add text overlays with app features
- Recommended: Use https://screenshots.pro/ or Figma

### Splash Screen
- Design matching the app theme (deep navy, moon/stars)
- Place at `assets/images/splash-icon.png`

### Feature Graphic (Android only)
- 1024x500 px
- Place in Play Store listing

---

## Step 4: Build

### Development Build (for testing)
```bash
# iOS Simulator
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### Preview Build (TestFlight / Internal Testing)
```bash
# Both platforms
eas build --profile preview --platform all
```

### Production Build
```bash
# Both platforms
eas build --profile production --platform all
```

---

## Step 5: Submit to Stores

### iOS (App Store)
```bash
eas submit --platform ios --latest
```

**App Store Connect Setup:**
1. Go to https://appstoreconnect.apple.com
2. Create a new app
   - Bundle ID: `com.dreamdecode.ai`
   - Name: "DreamDecode AI - Dream Journal"
   - Primary language: English
3. Fill in the listing:
   - **Subtitle:** "AI Dream Interpreter & Journal"
   - **Category:** Health & Fitness (primary), Lifestyle (secondary)
   - **Description:** (see below)
   - **Keywords:** dream interpreter, dream journal, dream meaning, dream analysis, dream diary, sleep, AI, dream decoder, dream dictionary, subconscious
   - **Privacy Policy URL:** (create one using https://www.freeprivacypolicy.com/)
4. Add screenshots
5. Set pricing: Free (with in-app purchases)
6. Configure In-App Purchases in App Store Connect (linked via RevenueCat)
7. Submit for review

### Android (Google Play)
```bash
eas submit --platform android --latest
```

**Play Console Setup:**
1. Go to https://play.google.com/console
2. Create a new app
   - App name: "DreamDecode AI - Dream Interpreter & Journal"
   - Default language: English
3. Complete the store listing:
   - **Short description:** "AI-powered dream interpreter. Decode your dreams, track patterns, understand your subconscious."
   - **Full description:** (see below)
4. Add screenshots & feature graphic
5. Set content rating (complete questionnaire)
6. Set pricing: Free
7. Add in-app products (linked via RevenueCat)
8. Roll out to production

---

## Step 6: Store Listing Copy

### App Name
**DreamDecode AI - Dream Interpreter & Journal**

### Short Description (80 chars)
AI-powered dream interpreter. Decode dreams, track patterns, know yourself.

### Full Description (4000 chars)

```
🌙 What did you dream last night?

DreamDecode AI uses advanced artificial intelligence to help you understand the hidden meanings in your dreams. Simply describe your dream — by typing or speaking — and get a personalized, psychology-inspired interpretation in seconds.

✨ WHY DREAMDECODE?

Unlike other dream apps that lock everything behind a paywall, DreamDecode gives you a FREE daily AI interpretation, unlimited dream journaling, and beautiful insights — all for free.

🔮 FEATURES:

• AI Dream Interpretation — Get personalized, psychology-based analysis of your dreams powered by advanced AI. Not generic — references YOUR specific dream details.

• Voice & Text Input — Describe your dream by typing or speaking. Optimized for those groggy mornings when you can barely keep your eyes open.

• Dream Journal — Beautiful, searchable dream diary. Tag emotions, symbols, and themes. Never forget a dream again.

• Emotional Insights — See your emotional patterns over time. Which emotions appear most in your dreams? Track trends and understand your subconscious.

• Symbol Tracking — Discover recurring symbols across your dreams. Water, flying, falling — see what your subconscious keeps returning to.

• Dream Streaks — Build a daily habit of dream journaling with streak tracking and gentle morning reminders.

• Privacy First — Your dreams are stored locally on your device. No account required.

🌟 FREE vs PREMIUM:

FREE (forever):
✅ 1 AI interpretation per day
✅ Unlimited dream journaling
✅ Emotion & symbol tagging
✅ 7-day insights
✅ Dream search
✅ Streak tracking

PREMIUM ($3.99/mo or $29.99/yr):
✅ Unlimited AI interpretations
✅ Follow-up AI chat about your dreams
✅ Weekly AI dream report
✅ Dream personality profile
✅ Advanced insights & pattern detection
✅ No ads

🧠 POWERED BY PSYCHOLOGY:
DreamDecode blends Jungian psychology, modern neuroscience, and cultural symbolism to give you interpretations that actually make sense. No fortune-telling, no mystical nonsense — just thoughtful, personalized analysis.

💜 BUILT FOR DREAMERS:
Beautiful dark theme designed for early mornings. Smooth animations, haptic feedback, and a calm interface that respects your space.

Download DreamDecode AI today and start understanding what your subconscious is trying to tell you.

Sweet dreams. 🌙
```

---

## Step 7: Post-Launch Checklist

- [ ] Monitor crash reports (EAS dashboard + App Store Connect / Play Console)
- [ ] Respond to user reviews within 24 hours
- [ ] Track key metrics: DAU, retention, conversion rate
- [ ] A/B test paywall copy after 100+ installs
- [ ] Submit V1.1 update within 2 weeks (shows stores the app is actively maintained)
- [ ] Set up Firebase Analytics for detailed event tracking
- [ ] Create social media accounts for cross-promotion
- [ ] Post on Reddit (r/dreams, r/LucidDreaming, r/selfimprovement)
- [ ] Create TikTok/Reels content showing the app in action

---

## Quick Reference: Files to Update Before Publishing

| File | What to Replace |
|------|----------------|
| `lib/gemini.ts` | `YOUR_GEMINI_API_KEY` → actual Gemini key |
| `lib/purchases.ts` | `YOUR_REVENUECAT_IOS_KEY` and `YOUR_REVENUECAT_ANDROID_KEY` |
| `lib/ads.ts` | Ad unit IDs (banner, interstitial, rewarded) |
| `app.json` | AdMob app IDs (`androidAppId`, `iosAppId`) |
| `eas.json` | `YOUR_GEMINI_API_KEY`, Apple credentials, service account path |

---

*Follow this guide top to bottom and you'll go from code → published in both stores. Total time: ~2-4 hours (excluding Apple review which takes 1-3 days).*
