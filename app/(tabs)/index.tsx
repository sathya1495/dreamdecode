import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useApp } from "@/context/AppContext";
import { Colors, EMOTIONS } from "@/constants/theme";

const { width } = Dimensions.get("window");

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

function getGradientColors(): readonly [string, string, string] {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return ["#0A0E27", "#1a1145", "#2d1b69"] as const;
  if (hour >= 9 && hour < 18) return ["#0A0E27", "#151A3A", "#1C2145"] as const;
  return ["#0A0E27", "#0d0a1f", "#150e30"] as const;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function getEmotionColor(emotionKey: string): string {
  return Colors.emotion[emotionKey] || Colors.dream.purple;
}

function getEmotionEmoji(emotionKey: string): string {
  const found = EMOTIONS.find((e) => e.key === emotionKey);
  return found?.emoji || "🌙";
}

export default function HomeScreen() {
  const router = useRouter();
  const { profile, dreams, refreshAll } = useApp();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Refresh data when screen comes into focus (e.g. after adding a dream)
  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [refreshAll])
  );

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const displayName = profile?.displayName || "Dreamer";
  const today = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const dateStr = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`;
  const recentDreams = dreams.slice(0, 5);

  return (
    <LinearGradient colors={getGradientColors()} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Greeting */}
          <View className="mt-4 mb-2">
            <Text className="text-2xl font-bold" style={{ color: Colors.text.primary }}>
              {getGreeting()}, {displayName} ☀️
            </Text>
            <Text className="mt-1" style={{ color: Colors.text.secondary, fontSize: 15 }}>
              {dateStr}
            </Text>
          </View>

          {/* Main CTA */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/dream-input");
              }}
              className="mt-6 rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={["#7C5CFC", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-6 rounded-2xl"
              >
                <Text className="text-4xl text-center mb-2">🌙</Text>
                <Text
                  className="text-xl font-bold text-center"
                  style={{ color: "#FFFFFF" }}
                >
                  What did you dream{"\n"}last night?
                </Text>
                <View className="mt-4 flex-row justify-center gap-4">
                  <View className="bg-white/20 rounded-full px-5 py-2.5">
                    <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                      ✏️ Tap to record
                    </Text>
                  </View>
                  <View className="bg-white/20 rounded-full px-5 py-2.5">
                    <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                      🎤 Speak it
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Streak */}
          {(profile?.streakDays ?? 0) > 0 && (
            <View className="mt-5 flex-row items-center">
              <Text className="text-lg">🔥</Text>
              <Text className="ml-2 font-semibold" style={{ color: Colors.dream.gold }}>
                {profile?.streakDays}-day streak
              </Text>
            </View>
          )}

          {/* Recent Dreams */}
          {recentDreams.length > 0 && (
            <View className="mt-6">
              <Text
                className="text-lg font-bold mb-3"
                style={{ color: Colors.text.primary }}
              >
                Recent Dreams
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {recentDreams.map((dream) => {
                  const mainEmotion = dream.emotions[0] || "calm";
                  return (
                    <Pressable
                      key={dream.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push({ pathname: "/dream-detail", params: { id: dream.id } });
                      }}
                      className="rounded-xl p-4"
                      style={{
                        backgroundColor: Colors.dream.card,
                        width: width * 0.42,
                        borderLeftWidth: 3,
                        borderLeftColor: getEmotionColor(mainEmotion),
                      }}
                    >
                      <Text style={{ color: Colors.text.muted, fontSize: 12 }}>
                        {formatDate(dream.createdAt)}
                      </Text>
                      <Text
                        className="mt-1.5 font-medium"
                        style={{ color: Colors.text.primary, fontSize: 14 }}
                        numberOfLines={3}
                      >
                        "{dream.content.slice(0, 60)}
                        {dream.content.length > 60 ? "..." : ""}"
                      </Text>
                      <Text className="mt-2" style={{ fontSize: 13 }}>
                        {getEmotionEmoji(mainEmotion)}{" "}
                        <Text style={{ color: Colors.text.secondary, fontSize: 12 }}>
                          {mainEmotion.charAt(0).toUpperCase() + mainEmotion.slice(1)}
                        </Text>
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Empty state */}
          {recentDreams.length === 0 && (
            <View className="mt-10 items-center">
              <Text className="text-5xl mb-4">🌌</Text>
              <Text
                className="text-center font-medium"
                style={{ color: Colors.text.secondary, fontSize: 16, lineHeight: 24 }}
              >
                Your dream journal is empty.{"\n"}
                Record your first dream to get started!
              </Text>
            </View>
          )}

          {/* Quick Stats */}
          {(profile?.totalDreams ?? 0) > 0 && (
            <View className="mt-6 mb-4">
              <Text
                className="text-lg font-bold mb-3"
                style={{ color: Colors.text.primary }}
              >
                This Week
              </Text>
              <View className="flex-row gap-3">
                <View
                  className="flex-1 rounded-xl p-4 items-center"
                  style={{ backgroundColor: Colors.dream.card }}
                >
                  <Text className="text-2xl font-bold" style={{ color: Colors.dream.purple }}>
                    {profile?.totalDreams ?? 0}
                  </Text>
                  <Text style={{ color: Colors.text.secondary, fontSize: 12, marginTop: 2 }}>
                    Total Dreams
                  </Text>
                </View>
                <View
                  className="flex-1 rounded-xl p-4 items-center"
                  style={{ backgroundColor: Colors.dream.card }}
                >
                  <Text className="text-2xl font-bold" style={{ color: Colors.dream.gold }}>
                    {profile?.streakDays ?? 0}
                  </Text>
                  <Text style={{ color: Colors.text.secondary, fontSize: 12, marginTop: 2 }}>
                    Day Streak
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
