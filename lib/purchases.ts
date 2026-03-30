import { Platform } from "react-native";

// Conditionally import react-native-purchases (native only)
let Purchases: any = null;
if (Platform.OS !== "web") {
  Purchases = require("react-native-purchases").default;
}

// RevenueCat API key (Android-only for now, iOS key added later)
const REVENUECAT_ANDROID_KEY = "YOUR_REVENUECAT_ANDROID_KEY";

const ENTITLEMENT_ID = "premium";

export async function initRevenueCat(): Promise<void> {
  if (Platform.OS !== "android" || !Purchases) return;
  Purchases.configure({ apiKey: REVENUECAT_ANDROID_KEY });
}

export async function getOfferings(): Promise<any[]> {
  if (Platform.OS === "web" || !Purchases) return [];
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch (e) {
    console.error("Error getting offerings:", e);
    return [];
  }
}

export async function purchasePackage(
  pkg: any
): Promise<boolean> {
  if (Platform.OS === "web" || !Purchases) return false;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e: any) {
    if (!e.userCancelled) {
      console.error("Purchase error:", e);
    }
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (Platform.OS === "web" || !Purchases) return false;
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e) {
    console.error("Restore error:", e);
    return false;
  }
}

export async function checkPremiumStatus(): Promise<boolean> {
  if (Platform.OS === "web" || !Purchases) return false;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e) {
    console.error("Check premium error:", e);
    return false;
  }
}
