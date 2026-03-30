import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Share,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { Colors, EMOTIONS } from "@/constants/theme";
import { getDreamById, deleteDream, updateDreamInterpretation, getInterpretationsToday } from "@/lib/database";
import { interpretDream } from "@/lib/ai";
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

function getEmotionEmoji(key: string): string {
  return EMOTIONS.find((e) => e.key === key)?.emoji || "🌙";
}

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { refreshAll, profile } = useApp();
  const [dream, setDream] = useState<Dream | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    async function load() {
      if (id) {
        const d = await getDreamById(id);
        setDream(d);
      }
    }
    load();
  }, [id]);

  async function handleRetryInterpretation() {
    if (!dream) return;

    // Check daily limit for free users
    if (!profile?.isPremium) {
      const todayCount = await getInterpretationsToday();
      if (todayCount >= 1) {
        Alert.alert(
          "Daily Limit Reached",
          "Free users get 1 dream interpretation per day. Upgrade to Premium for unlimited decodes!",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Go Premium", onPress: () => router.push("/paywall") },
          ]
        );
        return;
      }
    }

    setIsRetrying(true);
    try {
      const interpretation = await interpretDream(
        dream.content,
        dream.emotions,
        dream.tags
      );
      await updateDreamInterpretation(dream.id, interpretation);
      const updated = await getDreamById(dream.id);
      setDream(updated);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Error", "Could not decode dream. Please check your internet connection.");
    } finally {
      setIsRetrying(false);
    }
  }

  async function handleDelete() {
    Alert.alert("Delete Dream", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (dream) {
            await deleteDream(dream.id);
            await refreshAll();
            router.back();
          }
        },
      },
    ]);
  }

  async function handleShare() {
    if (!dream) return;
    const text = dream.interpretation
      ? `🌙 My Dream Decoded\n\n${dream.interpretation.overview}\n\nDecode your dreams → DreamDecode AI`
      : `🌙 Dream: "${dream.content.slice(0, 100)}..."\n\nDecode your dreams → DreamDecode AI`;
    try {
      await Share.share({ message: text });
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

  const interp = dream.interpretation;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dream.bg }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: Colors.text.secondary, fontSize: 16 }}>← Back</Text>
        </Pressable>
        <View className="flex-row gap-4">
          <Pressable onPress={handleShare}>
            <Text style={{ fontSize: 18 }}>📤</Text>
          </Pressable>
          <Pressable onPress={handleDelete}>
            <Text style={{ fontSize: 18 }}>🗑️</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Date & Emotions */}
        <Text className="mt-2" style={{ color: Colors.text.muted, fontSize: 13 }}>
          {formatDate(dream.createdAt)}
        </Text>
        {dream.emotions.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-2">
            {dream.emotions.map((e) => (
              <Text key={e} style={{ fontSize: 14 }}>
                {getEmotionEmoji(e)}{" "}
                <Text style={{ color: Colors.text.secondary }}>
                  {e.charAt(0).toUpperCase() + e.slice(1)}
                </Text>
              </Text>
            ))}
          </View>
        )}

        {/* Dream Content */}
        <View
          className="mt-4 p-4 rounded-xl"
          style={{ backgroundColor: Colors.dream.card }}
        >
          <Text
            style={{
              color: Colors.text.primary,
              fontSize: 16,
              lineHeight: 26,
              fontStyle: "italic",
            }}
          >
            "{dream.content}"
          </Text>
        </View>

        {/* Tags */}
        {dream.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {dream.tags.map((tag) => (
              <View
                key={tag}
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: Colors.dream.card }}
              >
                <Text style={{ color: Colors.text.muted, fontSize: 12 }}>🏷️ {tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Interpretation */}
        {interp ? (
          <View className="mt-6">
            <Text className="text-lg font-bold mb-3" style={{ color: Colors.text.primary }}>
              🔮 Dream Analysis
            </Text>

            {/* Overview */}
            <Text
              className="mb-4"
              style={{ color: Colors.text.primary, fontSize: 15, lineHeight: 24 }}
            >
              {interp.overview}
            </Text>

            {/* Symbols */}
            {interp.symbols.length > 0 && (
              <View className="mb-4">
                <Text className="font-semibold mb-2" style={{ color: Colors.text.primary }}>
                  🗝️ Key Symbols
                </Text>
                <View className="gap-2">
                  {interp.symbols.map((s, i) => (
                    <View
                      key={i}
                      className="flex-row items-start p-3 rounded-lg"
                      style={{ backgroundColor: Colors.dream.surface }}
                    >
                      <Text className="text-xl mr-3">{s.emoji}</Text>
                      <View className="flex-1">
                        <Text className="font-semibold" style={{ color: Colors.text.primary, fontSize: 14 }}>
                          {s.name}
                        </Text>
                        <Text style={{ color: Colors.text.secondary, fontSize: 13, marginTop: 2 }}>
                          {s.meaning}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Full Text */}
            <Text
              className="mb-4"
              style={{ color: Colors.text.primary, fontSize: 15, lineHeight: 24 }}
            >
              {interp.interpretation}
            </Text>

            {/* Reflection */}
            <View
              className="p-4 rounded-xl mb-4"
              style={{ backgroundColor: Colors.dream.purple + "15" }}
            >
              <Text className="font-semibold mb-1" style={{ color: Colors.dream.lightPurple }}>
                🌱 Reflection
              </Text>
              <Text
                style={{
                  color: Colors.dream.lightPurple,
                  fontSize: 14,
                  lineHeight: 22,
                  fontStyle: "italic",
                }}
              >
                {interp.reflection}
              </Text>
            </View>
          </View>
        ) : (
          <View className="mt-6 items-center">
            <Text className="text-3xl mb-3">🔮</Text>
            <Text className="mb-4 text-center" style={{ color: Colors.text.secondary, fontSize: 15 }}>
              This dream hasn't been decoded yet.
            </Text>
            <Pressable
              onPress={handleRetryInterpretation}
              className="px-6 py-3 rounded-xl"
              style={{ backgroundColor: Colors.dream.purple }}
              disabled={isRetrying}
            >
              <Text className="font-bold" style={{ color: "#FFFFFF", fontSize: 15 }}>
                {isRetrying ? "Decoding..." : "Decode Now 🔮"}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
