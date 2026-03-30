import { Platform } from "react-native";

// Native-only ad modules — conditionally import
let InterstitialAd: any = null;
let RewardedAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = {};
let AdEventType: any = {};
let RewardedAdEventType: any = {};
let BannerAdComponent: any = null;

if (Platform.OS !== "web") {
  const admob = require("react-native-google-mobile-ads");
  InterstitialAd = admob.InterstitialAd;
  RewardedAd = admob.RewardedAd;
  BannerAdSize = admob.BannerAdSize;
  TestIds = admob.TestIds;
  AdEventType = admob.AdEventType;
  RewardedAdEventType = admob.RewardedAdEventType;
  BannerAdComponent = admob.BannerAd;
}

// Use test IDs in development, replace with real IDs for production
const AD_UNITS = {
  banner: __DEV__ ? (TestIds.BANNER || "") : "ca-app-pub-XXXXXXXX/YYYYYYYY",
  interstitial: __DEV__ ? (TestIds.INTERSTITIAL || "") : "ca-app-pub-XXXXXXXX/YYYYYYYY",
  rewarded: __DEV__ ? (TestIds.REWARDED || "") : "ca-app-pub-XXXXXXXX/YYYYYYYY",
};

// Pre-load interstitial
let interstitialAd: any = null;

export function preloadInterstitial(): void {
  if (Platform.OS === "web" || !InterstitialAd) return;
  interstitialAd = InterstitialAd.createForAdRequest(AD_UNITS.interstitial, {
    keywords: ["dreams", "sleep", "wellness", "meditation", "psychology"],
  });
  interstitialAd.load();
}

export function showInterstitial(): Promise<boolean> {
  return new Promise((resolve) => {
    if (Platform.OS === "web" || !interstitialAd) {
      if (Platform.OS !== "web") preloadInterstitial();
      resolve(false);
      return;
    }

    const unsubLoaded = interstitialAd.addAdEventListener(
      AdEventType.LOADED,
      () => {
        interstitialAd?.show();
      }
    );

    const unsubClosed = interstitialAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        unsubLoaded();
        unsubClosed();
        // Pre-load the next one
        preloadInterstitial();
        resolve(true);
      }
    );

    const unsubError = interstitialAd.addAdEventListener(
      AdEventType.ERROR,
      () => {
        unsubLoaded();
        unsubClosed();
        unsubError();
        preloadInterstitial();
        resolve(false);
      }
    );

    if (interstitialAd.loaded) {
      interstitialAd.show();
    } else {
      interstitialAd.load();
    }
  });
}

// Rewarded ad for bonus interpretation
export function showRewardedAd(): Promise<boolean> {
  if (Platform.OS === "web" || !RewardedAd) return Promise.resolve(false);
  return new Promise((resolve) => {
    const rewarded = RewardedAd.createForAdRequest(AD_UNITS.rewarded, {
      keywords: ["dreams", "sleep", "wellness", "meditation"],
    });

    const unsubEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        resolve(true);
      }
    );

    const unsubLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        rewarded.show();
      }
    );

    const unsubClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      unsubEarned();
      unsubLoaded();
      unsubClosed();
      unsubError();
    });

    const unsubError = rewarded.addAdEventListener(AdEventType.ERROR, () => {
      unsubEarned();
      unsubLoaded();
      unsubClosed();
      unsubError();
      resolve(false);
    });

    rewarded.load();
  });
}

export { AD_UNITS, BannerAdSize };
export const BannerAd = BannerAdComponent;
