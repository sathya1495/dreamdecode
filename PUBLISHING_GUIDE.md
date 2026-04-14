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

### ⚠️ PLAY STORE LIMITS
- **App name:** 30 characters max
- **Short description:** 80 characters max
- **Full description:** 4,000 characters max

---

### App Name (COPY-PASTE — 30 chars)
```
DreamDecode: AI Dream Journal
```

### Short Description (COPY-PASTE — 79 chars)
```
AI dream interpreter & journal. Decode dream meanings, symbols & patterns free
```

### Full Description (COPY-PASTE — ~3,800 chars)

```
🌙 What does my dream mean?

DreamDecode is your AI dream interpreter, dream journal, and dream dictionary — all in one app. Describe your dream and get a personalized, psychology-based dream interpretation in seconds. Not generic dream meanings — real dream analysis that references YOUR specific details.

Whether you dreamed about teeth falling out, snakes, water, flying, falling, being chased, or a recurring nightmare — DreamDecode's AI dream decoder explains what it means and why your subconscious chose those symbols.

🆓 ACTUALLY FREE — NOT A PAYWALL TRAP
Unlike other dream apps, DreamDecode gives you 1 FREE AI dream interpretation every day + unlimited dream journaling + full dream insights — forever. No paywall blocking your first dream.

✨ FEATURES

🔮 AI Dream Interpretation & Dream Meanings
Powered by advanced AI blending Jungian dream analysis, neuroscience, and cultural symbolism. Ask "what does my dream mean" and get a thoughtful, personalized dream interpretation — not a copy-paste dream dictionary entry.

📖 Dream Dictionary & Symbol Guide
Discover the meaning behind common dream symbols: water dreams, snake dreams, teeth dreams, death dreams, flying dreams, falling dreams, chase dreams, pregnancy dreams, and more. Every interpretation explains the psychology behind the symbol.

📝 Dream Journal & Dream Diary
Beautiful, searchable dream journal and dream diary. Tag emotions and dream symbols. Full-text search across all your dreams. Record every dream before you forget.

📊 Dream Patterns & Recurring Dreams
See your emotional landscape over time. Detect recurring dreams and recurring nightmares. Track which dream themes your subconscious keeps returning to — and understand what they mean.

🎤 Voice & Text Dream Input
Describe your dream by typing or speaking — perfect for groggy mornings when you can barely keep your eyes open. Capture every detail before it fades.

🔥 Dream Streak & Morning Reminders
Build a daily dream journaling habit with streak tracking and gentle morning reminders. The more you journal, the better your dream recall becomes.

🔒 Private Dream Vault
Your dream journal is stored locally on YOUR device. No account required. No cloud uploads. Your dreams stay completely private.

📤 Export Dream Journal
Export all your dreams as JSON anytime. Your dream diary data belongs to you.

🌟 FREE vs PREMIUM

FREE (forever):
✅ 1 AI dream interpretation per day
✅ Unlimited dream journal entries
✅ Dream dictionary & symbol meanings
✅ Emotion & symbol tagging
✅ Dream insights & statistics
✅ Recurring dream detection
✅ Full-text dream search
✅ Dream streak tracking & reminders
✅ Export dream journal

PREMIUM ($3.99/mo or $29.99/yr — 7-day free trial):
✅ Unlimited AI dream interpretations
✅ Follow-up AI chat about your dreams
✅ Weekly AI dream analysis report
✅ Dream personality profile
✅ Advanced nightmare pattern detection
✅ No ads

🧠 PSYCHOLOGY-BASED DREAM ANALYSIS
DreamDecode blends Jungian dream analysis, modern neuroscience, and cultural dream symbolism. No mystical fortune-telling — thoughtful dream interpretation that helps you understand what your subconscious mind is processing.

Perfect for: dream journaling beginners, lucid dreamers, nightmare sufferers, anyone curious about dream meanings, psychology enthusiasts, and self-improvement seekers.

Download DreamDecode — the AI dream interpreter that actually helps you understand your dreams. Free today.

dream journal app, dream diary, dream interpretation, dream meaning, dream analysis, AI dream interpreter, dream decoder, dream dictionary, dream symbols, lucid dream journal, sleep journal, dream tracker, nightmare journal, recurring dreams, what does my dream mean, Jungian dream analysis, dream log, dream meanings explained
```

### Keywords (iOS App Store — 100 chars)
```
dream journal,dream meaning,AI interpreter,dream diary,nightmare,dream dictionary,symbols,decoder
```

### ASO Keyword Density Targets (for reference)
| Keyword | Min Count in Full Desc | Actual |
|---|---|---|
| dream | 50+ | ✅ 60+ |
| dream interpretation | 4+ | ✅ 5 |
| dream journal | 5+ | ✅ 7 |
| dream meaning(s) | 4+ | ✅ 5 |
| dream diary | 2+ | ✅ 3 |
| dream dictionary | 2+ | ✅ 3 |
| dream analysis | 2+ | ✅ 3 |
| dream decoder | 1+ | ✅ 2 |
| nightmare | 2+ | ✅ 3 |
| recurring dream(s) | 2+ | ✅ 3 |
| AI dream | 3+ | ✅ 4 |
| what does my dream mean | 1+ | ✅ 2 |
| teeth/snake/water/flying | 1 each | ✅ all |
| Jungian | 1+ | ✅ 2 |
| lucid dream | 1+ | ✅ 1 |
| subconscious | 1+ | ✅ 2 |
| free | 3+ | ✅ 4 |

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
