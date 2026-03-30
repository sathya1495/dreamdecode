import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { Colors, EMOTIONS } from "@/constants/theme";
import { getDreamById } from "@/lib/database";
import { useApp } from "@/context/AppContext";
import { Dream } from "@/types";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function DreamResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useApp();
  const [dream, setDream] = useState<Dream | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function load() {
      if (id) {
        const d = await getDreamById(id);
        setDream(d);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    }
    load();
  }, [id, fadeAnim]);

  async function handleShare() {
    if (!dream?.interpretation) return;
    try {
      await Share.share({
        message: `🌙 My Dream Decoded by DreamDecode AI\n\n${dream.interpretation.overview}\n\n🔮 Key Symbols: ${dream.interpretation.symbols.map((s) => s.emoji + " " + s.name).join(", ")}\n\n💭 ${dream.interpretation.interpretation.slice(0, 200)}...\n\nDecode your dreams → DreamDecode AI`,
      });
    } catch (e) {
      console.error(e);
    }
  }

  if (!dream) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: Colors.dream.bg }}
      >
        <Text style={{ color: Colors.text.secondary }}>Loading...</Text>
      </View>
    );
  }

  // If dream has no interpretation (e.g. daily limit reached), redirect to detail view
  if (!dream.interpretation) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dream.bg }}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">🌙</Text>
          <Text
            className="text-xl font-bold text-center mb-3"
            style={{ color: Colors.text.primary }}
          >
            Dream Saved
          </Text>
          <Text
            className="text-center mb-6"
            style={{ color: Colors.text.secondary, fontSize: 15, lineHeight: 22 }}
          >
            Your dream was saved to your journal but hasn't been decoded yet.
          </Text>
          <Pressable
            onPress={() => router.replace({ pathname: "/dream-detail", params: { id: dream.id } })}
            className="px-6 py-3 rounded-xl mb-3"
            style={{ backgroundColor: Colors.dream.purple }}
          >
            <Text className="font-bold" style={{ color: "#FFF", fontSize: 15 }}>
              View Dream →
            </Text>
          </Pressable>
          <Pressable onPress={() => router.replace("/(tabs)")}>
            <Text style={{ color: Colors.text.muted, fontSize: 14 }}>Go Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const interp = dream.interpretation;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dream.bg }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
          <Pressable onPress={() => router.replace("/(tabs)")}>
            <Text style={{ color: Colors.text.secondary, fontSize: 16 }}>← Home</Text>
          </Pressable>
          <View className="flex-row gap-4">
            <Pressable onPress={handleShare}>
              <Text style={{ fontSize: 20 }}>📤</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Title Card */}
          <LinearGradient
            colors={[Colors.dream.purple + "40", Colors.dream.blue + "20"]}
            className="rounded-xl p-5 mb-5 mt-2"
          >
            <Text className="text-3xl text-center mb-1">🌙</Text>
            <Text
              className="text-xl font-bold text-center"
              style={{ color: Colors.text.primary }}
            >
              Your Dream Decoded
            </Text>
            <Text
              className="text-center mt-1"
              style={{ color: Colors.text.secondary, fontSize: 14 }}
            >
              {formatDate(dream.createdAt)}
            </Text>
          </LinearGradient>

          {/* Overview */}
          <SectionCard emoji="🔮" title="Overview">
            <Text
              style={{
                color: Colors.text.primary,
                fontSize: 15,
                lineHeight: 24,
                fontStyle: "italic",
              }}
            >
              "{interp.overview}"
            </Text>
          </SectionCard>

          {/* Key Symbols */}
          <SectionCard emoji="🗝️" title="Key Symbols">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            >
              {interp.symbols.map((symbol, i) => (
                <View
                  key={i}
                  className="items-center p-3 rounded-xl"
                  style={{
                    backgroundColor: Colors.dream.surface,
                    width: 100,
                  }}
                >
                  <Text className="text-2xl mb-1">{symbol.emoji}</Text>
                  <Text
                    className="font-semibold text-center"
                    style={{ color: Colors.text.primary, fontSize: 13 }}
                  >
                    {symbol.name}
                  </Text>
                  <Text
                    className="text-center mt-1"
                    style={{ color: Colors.text.muted, fontSize: 11 }}
                    numberOfLines={2}
                  >
                    {symbol.meaning}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </SectionCard>

          {/* Full Interpretation */}
          <SectionCard emoji="💭" title="What This Means">
            <Text
              style={{
                color: Colors.text.primary,
                fontSize: 15,
                lineHeight: 24,
              }}
            >
              {interp.interpretation}
            </Text>
          </SectionCard>

          {/* Reflection */}
          <SectionCard emoji="🌱" title="Reflection Prompt">
            <View
              className="p-4 rounded-xl"
              style={{ backgroundColor: Colors.dream.purple + "15" }}
            >
              <Text
                style={{
                  color: Colors.dream.lightPurple,
                  fontSize: 15,
                  lineHeight: 24,
                  fontStyle: "italic",
                }}
              >
                {interp.reflection}
              </Text>
            </View>
          </SectionCard>

          {/* Themes */}
          {interp.themes && interp.themes.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-5">
              {interp.themes.map((theme, i) => (
                <View
                  key={i}
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: Colors.dream.card }}
                >
                  <Text style={{ color: Colors.text.muted, fontSize: 12 }}>
                    #{theme}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Premium Upsell */}
          {!profile?.isPremium && (
            <Pressable
              onPress={() => router.push("/paywall")}
              className="rounded-xl p-5 mb-5 overflow-hidden"
              style={{ backgroundColor: Colors.dream.card }}
            >
              <Text className="font-bold mb-2" style={{ color: Colors.text.primary, fontSize: 16 }}>
                🔓 Go Deeper with Premium
              </Text>
              <Text style={{ color: Colors.text.secondary, fontSize: 13, lineHeight: 20 }}>
                • Jungian archetype analysis{"\n"}
                • Connection to your past dreams{"\n"}
                • Personalized action steps{"\n"}
                • Follow-up AI chat
              </Text>
              <View className="mt-3">
                <Text className="font-semibold" style={{ color: Colors.dream.purple }}>
                  Unlock Premium — Free Trial →
                </Text>
              </View>
            </Pressable>
          )}

          {/* Feedback */}
          <View className="flex-row items-center justify-center gap-6 mb-4">
            <Text style={{ color: Colors.text.secondary, fontSize: 14 }}>
              Was this helpful?
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Could trigger store rating prompt here
              }}
            >
              <Text style={{ fontSize: 28 }}>👍</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={{ fontSize: 28 }}>👎</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function SectionCard({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-5">
      <Text className="font-bold mb-3" style={{ color: Colors.text.primary, fontSize: 16 }}>
        {emoji} {title}
      </Text>
      {children}
    </View>
  );
}
