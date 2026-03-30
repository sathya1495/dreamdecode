import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  ONBOARDING_COMPLETE: "onboarding_complete",
  REMINDER_ENABLED: "reminder_enabled",
  REMINDER_TIME: "reminder_time",
  REWARDED_ADS_TODAY: "rewarded_ads_today",
  REWARDED_ADS_DATE: "rewarded_ads_date",
};

export async function isOnboardingComplete(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
  return val === "true";
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, "true");
}

export async function isReminderEnabled(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.REMINDER_ENABLED);
  return val === "true";
}

export async function setReminderEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.REMINDER_ENABLED, enabled ? "true" : "false");
}

export async function getReminderTime(): Promise<string> {
  const val = await AsyncStorage.getItem(KEYS.REMINDER_TIME);
  return val || "07:00";
}

export async function setReminderTime(time: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.REMINDER_TIME, time);
}

// Track rewarded ad views for bonus interpretations
export async function getRewardedAdsToday(): Promise<number> {
  const storedDate = await AsyncStorage.getItem(KEYS.REWARDED_ADS_DATE);
  const today = new Date().toDateString();

  if (storedDate !== today) {
    // Reset for new day
    await AsyncStorage.setItem(KEYS.REWARDED_ADS_DATE, today);
    await AsyncStorage.setItem(KEYS.REWARDED_ADS_TODAY, "0");
    return 0;
  }

  const count = await AsyncStorage.getItem(KEYS.REWARDED_ADS_TODAY);
  return parseInt(count || "0", 10);
}

export async function incrementRewardedAds(): Promise<void> {
  const current = await getRewardedAdsToday();
  const today = new Date().toDateString();
  await AsyncStorage.setItem(KEYS.REWARDED_ADS_DATE, today);
  await AsyncStorage.setItem(KEYS.REWARDED_ADS_TODAY, String(current + 1));
}
