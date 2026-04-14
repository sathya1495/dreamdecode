import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  Animated,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { Colors, ONBOARDING_FREQUENCIES, ONBOARDING_INTERESTS } from "@/constants/theme";
import { setOnboardingComplete } from "@/lib/storage";
import { updateUserProfile } from "@/lib/database";
import { requestNotificationPermissions, scheduleMorningReminder } from "@/lib/notifications";
import { useApp } from "@/context/AppContext";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingDone } = useApp();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  function goNext() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (currentPage < 2) {
      const next = currentPage + 1;
      setCurrentPage(next);
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      finishOnboarding();
    }
  }

  async function finishOnboarding() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    try {
      // Save preferences
      await updateUserProfile({
        dreamFrequency: selectedFrequency,
        interests: selectedInterests,
        onboardingCompleted: true,
      });
      await setOnboardingComplete();
    } catch (e) {
      console.error("Failed to save onboarding preferences:", e);
    }

    setOnboardingDone(true);

    // Request notification permission & schedule (non-blocking)
    try {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleMorningReminder();
      }
    } catch (e) {
      console.warn("Notification setup failed:", e);
    }

    router.replace("/(tabs)");
  }

  function toggleInterest(interest: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      }
      if (prev.length >= 3) return prev;
      return [...prev, interest];
    });
  }

  const pages = [
    // Page 1: Welcome
    <View key="welcome" style={{ width }} className="flex-1 items-center justify-center px-8">
      <Animated.View style={{ opacity: fadeAnim }} className="items-center">
        <Text className="text-6xl mb-6">🌙</Text>
        <Text
          className="text-3xl font-bold text-center mb-4"
          style={{ color: Colors.text.primary }}
        >
          Your dreams have{"\n"}stories to tell
        </Text>
        <Text
          className="text-center mb-10"
          style={{ color: Colors.text.secondary, fontSize: 16, lineHeight: 24 }}
        >
          DreamDecode uses AI to help you{"\n"}understand what your subconscious{"\n"}is trying to say.
        </Text>
      </Animated.View>
    </View>,

    // Page 2: Frequency
    <View key="frequency" style={{ width }} className="flex-1 px-8 pt-20">
      <Text
        className="text-2xl font-bold text-center mb-2"
        style={{ color: Colors.text.primary }}
      >
        How often do you{"\n"}remember dreams?
      </Text>
      <Text
        className="text-center mb-8"
        style={{ color: Colors.text.secondary, fontSize: 14 }}
      >
        This helps us personalize your experience
      </Text>
      <View className="gap-3">
        {ONBOARDING_FREQUENCIES.map((freq) => (
          <Pressable
            key={freq.key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setSelectedFrequency(freq.key);
            }}
            className="flex-row items-center p-4 rounded-xl"
            style={{
              backgroundColor:
                selectedFrequency === freq.key ? Colors.dream.purple + "30" : Colors.dream.card,
              borderWidth: selectedFrequency === freq.key ? 1.5 : 0,
              borderColor: Colors.dream.purple,
            }}
          >
            <Text className="text-2xl mr-4">{freq.emoji}</Text>
            <Text
              className="font-medium"
              style={{
                color:
                  selectedFrequency === freq.key ? Colors.text.primary : Colors.text.secondary,
                fontSize: 16,
              }}
            >
              {freq.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>,

    // Page 3: Interests
    <View key="interests" style={{ width }} className="flex-1 px-8 pt-20">
      <Text
        className="text-2xl font-bold text-center mb-2"
        style={{ color: Colors.text.primary }}
      >
        What interests you most?
      </Text>
      <Text
        className="text-center mb-8"
        style={{ color: Colors.text.secondary, fontSize: 14 }}
      >
        Pick up to 3
      </Text>
      <View className="flex-row flex-wrap justify-center gap-3">
        {ONBOARDING_INTERESTS.map((interest) => {
          const selected = selectedInterests.includes(interest);
          return (
            <Pressable
              key={interest}
              onPress={() => toggleInterest(interest)}
              className="px-5 py-3 rounded-full"
              style={{
                backgroundColor: selected ? Colors.dream.purple : Colors.dream.card,
              }}
            >
              <Text
                className="font-medium"
                style={{
                  color: selected ? "#FFFFFF" : Colors.text.secondary,
                  fontSize: 14,
                }}
              >
                {interest}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>,
  ];

  return (
    <LinearGradient
      colors={["#0A0E27", "#1a1145", "#0A0E27"]}
      style={{ flex: 1 }}
    >
      <FlatList
        ref={flatListRef}
        data={pages}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => item}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />

      {/* Bottom area: dots + button */}
      <View className="px-8 pb-12">
        {/* Page dots */}
        <View className="flex-row justify-center mb-6 gap-2">
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              className="rounded-full"
              style={{
                width: i === currentPage ? 24 : 8,
                height: 8,
                backgroundColor:
                  i === currentPage ? Colors.dream.purple : Colors.dream.card,
              }}
            />
          ))}
        </View>

        {/* Continue / Skip */}
        <View className="flex-row gap-3">
          {currentPage > 0 && currentPage < 2 && (
            <Pressable
              onPress={finishOnboarding}
              className="py-4 px-6 rounded-xl"
              style={{ backgroundColor: Colors.dream.card }}
            >
              <Text className="font-semibold" style={{ color: Colors.text.muted, fontSize: 16 }}>
                Skip
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={goNext}
            className="flex-1 py-4 rounded-xl items-center"
            style={{ backgroundColor: Colors.dream.purple }}
          >
            <Text className="font-bold" style={{ color: "#FFFFFF", fontSize: 16 }}>
              {currentPage === 2 ? "Start Dreaming ✨" : "Continue"}
            </Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}
