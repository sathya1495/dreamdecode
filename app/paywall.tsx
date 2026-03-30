import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { Colors } from "@/constants/theme";
import { getOfferings, purchasePackage } from "@/lib/purchases";
import { useApp } from "@/context/AppContext";

export default function PaywallScreen() {
  const router = useRouter();
  const { refreshProfile } = useApp();
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<string>("annual");

  useEffect(() => {
    async function load() {
      try {
        const pkgs = await getOfferings();
        setPackages(pkgs);
      } catch (e) {
        console.error("Failed to load offerings:", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function handlePurchase(pkg: any) {
    setIsPurchasing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const success = await purchasePackage(pkg);
      if (success) {
        await refreshProfile();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPurchasing(false);
    }
  }

  const features = [
    { emoji: "🔮", title: "Unlimited Interpretations", desc: "Decode every dream, no daily limits" },
    { emoji: "💬", title: "Follow-up AI Chat", desc: "Ask questions about your dream" },
    { emoji: "📝", title: "Weekly Dream Report", desc: "AI patterns & insights delivered weekly" },
    { emoji: "🧭", title: "Dream Personality", desc: "Discover your unique dream profile" },
    { emoji: "📊", title: "Advanced Insights", desc: "Full charts, patterns & connections" },
    { emoji: "🚫", title: "No Ads", desc: "Clean, distraction-free experience" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dream.bg }}>
      {/* Close button */}
      <View className="flex-row justify-end px-5 pt-2">
        <Pressable onPress={() => router.back()} className="p-2">
          <Text style={{ color: Colors.text.muted, fontSize: 16 }}>✕</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Header */}
        <View className="items-center px-5 mb-6">
          <Text className="text-5xl mb-3">✨</Text>
          <Text
            className="text-2xl font-bold text-center"
            style={{ color: Colors.text.primary }}
          >
            Unlock the Full Power{"\n"}of DreamDecode
          </Text>
          <Text
            className="text-center mt-2"
            style={{ color: Colors.text.secondary, fontSize: 14 }}
          >
            Go deeper into your subconscious
          </Text>
        </View>

        {/* Features */}
        <View className="px-5 mb-6">
          {features.map((f, i) => (
            <View
              key={i}
              className="flex-row items-center py-3"
              style={{
                borderBottomWidth: i < features.length - 1 ? 1 : 0,
                borderBottomColor: Colors.dream.card,
              }}
            >
              <Text className="text-2xl mr-4">{f.emoji}</Text>
              <View className="flex-1">
                <Text className="font-semibold" style={{ color: Colors.text.primary, fontSize: 15 }}>
                  {f.title}
                </Text>
                <Text style={{ color: Colors.text.muted, fontSize: 12, marginTop: 1 }}>
                  {f.desc}
                </Text>
              </View>
              <Text style={{ color: Colors.dream.green, fontSize: 16 }}>✓</Text>
            </View>
          ))}
        </View>

        {/* Pricing Options */}
        <View className="px-5 mb-6 gap-3">
          {/* Annual */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPkg("annual");
            }}
          >
            <LinearGradient
              colors={
                selectedPkg === "annual"
                  ? [Colors.dream.purple + "40", Colors.dream.blue + "30"]
                  : [Colors.dream.card, Colors.dream.card]
              }
              className="p-4 rounded-xl flex-row items-center justify-between"
              style={{
                borderWidth: selectedPkg === "annual" ? 2 : 0,
                borderColor: Colors.dream.purple,
              }}
            >
              <View>
                <View className="flex-row items-center gap-2">
                  <Text className="font-bold" style={{ color: Colors.text.primary, fontSize: 16 }}>
                    Annual
                  </Text>
                  <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: Colors.dream.green + "30" }}>
                    <Text style={{ color: Colors.dream.green, fontSize: 11, fontWeight: "600" }}>
                      SAVE 37%
                    </Text>
                  </View>
                </View>
                <Text style={{ color: Colors.text.muted, fontSize: 12, marginTop: 2 }}>
                  $2.50/month, billed annually
                </Text>
              </View>
              <Text className="font-bold" style={{ color: Colors.text.primary, fontSize: 18 }}>
                $29.99
                <Text style={{ fontSize: 12, fontWeight: "400" }}>/yr</Text>
              </Text>
            </LinearGradient>
          </Pressable>

          {/* Monthly */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedPkg("monthly");
            }}
          >
            <View
              className="p-4 rounded-xl flex-row items-center justify-between"
              style={{
                backgroundColor: Colors.dream.card,
                borderWidth: selectedPkg === "monthly" ? 2 : 0,
                borderColor: Colors.dream.purple,
              }}
            >
              <View>
                <Text className="font-bold" style={{ color: Colors.text.primary, fontSize: 16 }}>
                  Monthly
                </Text>
                <Text style={{ color: Colors.text.muted, fontSize: 12, marginTop: 2 }}>
                  Cancel anytime
                </Text>
              </View>
              <Text className="font-bold" style={{ color: Colors.text.primary, fontSize: 18 }}>
                $3.99
                <Text style={{ fontSize: 12, fontWeight: "400" }}>/mo</Text>
              </Text>
            </View>
          </Pressable>
        </View>

        {/* CTA Button */}
        <View className="px-5 mb-4">
          <Pressable
            onPress={() => {
              // In production, find the matching package from RevenueCat
              if (packages.length > 0) {
                const pkg =
                  packages.find(
                    (p) =>
                      (selectedPkg === "annual" && p.packageType === "ANNUAL") ||
                      (selectedPkg === "monthly" && p.packageType === "MONTHLY")
                  ) || packages[0];
                handlePurchase(pkg);
              } else {
                // Demo mode
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.back();
              }
            }}
            disabled={isPurchasing}
          >
            <LinearGradient
              colors={[Colors.dream.purple, Colors.dream.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 rounded-xl items-center"
            >
              {isPurchasing ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="font-bold" style={{ color: "#FFFFFF", fontSize: 17 }}>
                  Start Free Trial
                </Text>
              )}
            </LinearGradient>
          </Pressable>
          <Text
            className="text-center mt-2"
            style={{ color: Colors.text.muted, fontSize: 12 }}
          >
            7-day free trial, then {selectedPkg === "annual" ? "$29.99/year" : "$3.99/month"}
          </Text>
        </View>

        {/* Legal */}
        <View className="px-5 items-center">
          <Text
            className="text-center"
            style={{ color: Colors.text.muted, fontSize: 11, lineHeight: 16 }}
          >
            Payment will be charged to your App Store / Play Store account.
            {"\n"}Subscriptions automatically renew unless cancelled.
            {"\n"}
            <Text style={{ textDecorationLine: "underline" }}>Terms</Text>
            {" · "}
            <Text style={{ textDecorationLine: "underline" }}>Privacy</Text>
            {" · "}
            <Text style={{ textDecorationLine: "underline" }}>Restore</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
