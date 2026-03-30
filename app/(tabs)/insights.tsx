import React, { useCallback } from "react";
import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";

import { useApp } from "@/context/AppContext";
import { Colors, EMOTIONS } from "@/constants/theme";

const { width } = Dimensions.get("window");

function getEmotionEmoji(key: string): string {
  return EMOTIONS.find((e) => e.key === key)?.emoji || "🌙";
}

// Simple bar chart component
function BarChart({
  data,
  maxValue,
}: {
  data: { label: string; value: number; color: string }[];
  maxValue: number;
}) {
  return (
    <View className="gap-2.5">
      {data.map((item, i) => (
        <View key={i} className="flex-row items-center">
          <Text
            style={{ color: Colors.text.secondary, fontSize: 12, width: 70 }}
            numberOfLines={1}
          >
            {item.label}
          </Text>
          <View className="flex-1 mx-2 h-5 rounded-full overflow-hidden" style={{ backgroundColor: Colors.dream.surface }}>
            <View
              className="h-full rounded-full"
              style={{
                backgroundColor: item.color,
                width: `${Math.max((item.value / Math.max(maxValue, 1)) * 100, 5)}%`,
              }}
            />
          </View>
          <Text style={{ color: Colors.text.muted, fontSize: 12, width: 24, textAlign: "right" }}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function InsightsScreen() {
  const router = useRouter();
  const { stats, refreshStats, profile } = useApp();

  useFocusEffect(
    useCallback(() => {
      refreshStats();
    }, [refreshStats])
  );

  if (!stats || stats.totalDreams === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dream.bg }}>
        <View className="px-5 pt-4">
          <Text className="text-2xl font-bold" style={{ color: Colors.text.primary }}>
            📊 Dream Insights
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">📊</Text>
          <Text
            className="text-center"
            style={{ color: Colors.text.secondary, fontSize: 16, lineHeight: 24 }}
          >
            Log a few dreams to start seeing{"\n"}patterns and insights here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Prepare emotion chart data
  const emotionData = Object.entries(stats.emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key, count]) => ({
      label: `${getEmotionEmoji(key)} ${key.charAt(0).toUpperCase() + key.slice(1)}`,
      value: count,
      color: Colors.emotion[key] || Colors.dream.purple,
    }));

  const maxEmotionCount = Math.max(...emotionData.map((d) => d.value), 1);

  // Prepare symbol chart data
  const symbolData = stats.topSymbols.slice(0, 6).map((s) => ({
    label: `${s.emoji} ${s.name}`,
    value: s.count,
    color: Colors.dream.purple,
  }));
  const maxSymbolCount = Math.max(...symbolData.map((d) => d.value), 1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dream.bg }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View className="px-5 pt-4 mb-4">
          <Text className="text-2xl font-bold" style={{ color: Colors.text.primary }}>
            📊 Dream Insights
          </Text>
        </View>

        {/* Emotional Landscape */}
        <View className="mx-5 mb-5 p-4 rounded-xl" style={{ backgroundColor: Colors.dream.card }}>
          <Text className="text-lg font-bold mb-4" style={{ color: Colors.text.primary }}>
            😶 Emotional Landscape
          </Text>
          {emotionData.length > 0 ? (
            <BarChart data={emotionData} maxValue={maxEmotionCount} />
          ) : (
            <Text style={{ color: Colors.text.muted }}>Add emotions to your dreams to see trends.</Text>
          )}
        </View>

        {/* Top Recurring Symbols */}
        <View className="mx-5 mb-5 p-4 rounded-xl" style={{ backgroundColor: Colors.dream.card }}>
          <Text className="text-lg font-bold mb-4" style={{ color: Colors.text.primary }}>
            🔮 Top Recurring Symbols
          </Text>
          {symbolData.length > 0 ? (
            <BarChart data={symbolData} maxValue={maxSymbolCount} />
          ) : (
            <Text style={{ color: Colors.text.muted }}>
              Decode some dreams to see your recurring symbols.
            </Text>
          )}
        </View>

        {/* Premium: Weekly Report */}
        <Pressable
          onPress={() => {
            if (!profile?.isPremium) {
              router.push("/paywall");
            }
          }}
          className="mx-5 mb-5 p-4 rounded-xl overflow-hidden"
          style={{ backgroundColor: Colors.dream.card }}
        >
          <View className="flex-row items-center mb-2">
            <Text className="text-lg font-bold" style={{ color: Colors.text.primary }}>
              📝 Weekly Dream Report
            </Text>
            {!profile?.isPremium && (
              <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: Colors.dream.purple }}>
                <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "600" }}>PRO</Text>
              </View>
            )}
          </View>
          <Text style={{ color: Colors.text.secondary, fontSize: 14, lineHeight: 20 }}>
            AI-generated weekly summary connecting your dream patterns to your emotional state.
          </Text>
          {!profile?.isPremium && (
            <Text className="mt-3 font-semibold" style={{ color: Colors.dream.purple }}>
              Unlock with Premium →
            </Text>
          )}
        </Pressable>

        {/* Premium: Dream Personality */}
        <Pressable
          onPress={() => {
            if (!profile?.isPremium) {
              router.push("/paywall");
            }
          }}
          className="mx-5 mb-5 p-4 rounded-xl"
          style={{ backgroundColor: Colors.dream.card }}
        >
          <View className="flex-row items-center mb-2">
            <Text className="text-lg font-bold" style={{ color: Colors.text.primary }}>
              🧭 Dream Personality
            </Text>
            {!profile?.isPremium && (
              <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: Colors.dream.purple }}>
                <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "600" }}>PRO</Text>
              </View>
            )}
          </View>
          <Text style={{ color: Colors.text.secondary, fontSize: 14, lineHeight: 20 }}>
            {stats.totalDreams >= 5
              ? `Based on ${stats.totalDreams} dreams, discover your dream personality type.`
              : `Log at least 5 dreams to unlock your dream personality profile.`}
          </Text>
          {!profile?.isPremium && (
            <Text className="mt-3 font-semibold" style={{ color: Colors.dream.purple }}>
              Unlock with Premium →
            </Text>
          )}
        </Pressable>

        {/* Dream Stats */}
        <View className="mx-5 mb-5 p-4 rounded-xl" style={{ backgroundColor: Colors.dream.card }}>
          <Text className="text-lg font-bold mb-4" style={{ color: Colors.text.primary }}>
            📈 Dream Stats
          </Text>
          <View className="gap-3">
            <StatRow label="Total dreams" value={String(stats.totalDreams)} />
            <StatRow label="Current streak" value={`${stats.currentStreak} days`} />
            <StatRow label="Longest streak" value={`${stats.longestStreak} days`} />
            <StatRow label="Most active" value={stats.mostActiveDay} />
            <StatRow
              label="Avg mood"
              value={`${getEmotionEmoji(stats.averageMood)} ${stats.averageMood.charAt(0).toUpperCase() + stats.averageMood.slice(1)}`}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text style={{ color: Colors.text.secondary, fontSize: 14 }}>{label}</Text>
      <Text className="font-semibold" style={{ color: Colors.text.primary, fontSize: 14 }}>
        {value}
      </Text>
    </View>
  );
}
