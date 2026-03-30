import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";

import { Colors, EMOTIONS, DREAM_TAGS, DREAM_QUOTES } from "@/constants/theme";
import { saveDream, getInterpretationsToday } from "@/lib/database";
import { interpretDream } from "@/lib/ai";
import { useApp } from "@/context/AppContext";

export default function DreamInputScreen() {
  const router = useRouter();
  const { profile, refreshAll } = useApp();
  const [step, setStep] = useState<"describe" | "tags">("describe");
  const [dreamText, setDreamText] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  function toggleEmotion(key: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEmotions((prev) =>
      prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]
    );
  }

  function toggleTag(key: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  }

  async function handleDecode() {
    if (isDecoding) return; // Guard against double-tap
    if (dreamText.trim().length < 10) {
      Alert.alert("Too Short", "Please describe your dream in at least a few words.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsDecoding(true);

    try {
      // Check daily limit for free users
      if (!profile?.isPremium) {
        const todayCount = await getInterpretationsToday();
        if (todayCount >= 1) {
          // Save dream without interpretation
          const dream = await saveDream({
            content: dreamText.trim(),
            emotions: selectedEmotions,
            tags: selectedTags,
            interpretation: null,
            createdAt: new Date().toISOString(),
            isPremium: false,
          });
          await refreshAll();
          setIsDecoding(false);
          Alert.alert(
            "Daily Limit Reached",
            "You've used your free daily interpretation. Your dream has been saved to your journal. Upgrade to Premium for unlimited interpretations!",
            [
              { text: "View Dream", onPress: () => router.replace({ pathname: "/dream-detail", params: { id: dream.id } }) },
              { text: "Go Premium", onPress: () => router.replace("/paywall") },
            ]
          );
          return;
        }
      }

      // Get AI interpretation
      const interpretation = await interpretDream(
        dreamText.trim(),
        selectedEmotions,
        selectedTags
      );

      // Save dream with interpretation
      const dream = await saveDream({
        content: dreamText.trim(),
        emotions: selectedEmotions,
        tags: selectedTags,
        interpretation,
        createdAt: new Date().toISOString(),
        isPremium: profile?.isPremium || false,
      });

      await refreshAll();

      // Navigate to result
      router.replace({
        pathname: "/dream-result",
        params: { id: dream.id },
      });
    } catch (error) {
      console.error("Decode error:", error);
      // Still save the dream even if AI fails
      try {
        const dream = await saveDream({
          content: dreamText.trim(),
          emotions: selectedEmotions,
          tags: selectedTags,
          interpretation: null,
          createdAt: new Date().toISOString(),
          isPremium: false,
        });
        await refreshAll();
        Alert.alert(
          "Connection Issue",
          "Your dream has been saved but we couldn't analyze it right now. You can try again from your journal.",
          [{ text: "OK", onPress: () => router.replace({ pathname: "/dream-detail", params: { id: dream.id } }) }]
        );
      } catch (saveError) {
        console.error("Save also failed:", saveError);
        Alert.alert("Error", "Could not save your dream. Please try again.");
        router.back();
      }
    } finally {
      setIsDecoding(false);
    }
  }

  // Voice input (simplified - uses Speech for TTS feedback, 
  // real implementation would use expo-av recording + speech-to-text API)
  async function toggleVoiceInput() {
    if (isRecording) {
      setIsRecording(false);
      // Stop recording
    } else {
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // In production, use expo-av to record audio and send to speech-to-text API
      // For now, show a helpful message
      Alert.alert(
        "Voice Input",
        "Voice recording will use on-device speech recognition. For now, please type your dream description.",
        [{ text: "OK", onPress: () => setIsRecording(false) }]
      );
    }
  }

  if (isDecoding) {
    return <DecodingScreen />;
  }

  if (step === "describe") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dream.bg }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center px-5 pt-4 pb-3">
            <Pressable onPress={() => router.back()}>
              <Text style={{ color: Colors.text.secondary, fontSize: 16 }}>← Back</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
            <Text
              className="text-xl font-bold mb-4"
              style={{ color: Colors.text.primary }}
            >
              Describe your dream...
            </Text>

            <TextInput
              ref={textInputRef}
              className="p-4 rounded-xl mb-3"
              style={{
                backgroundColor: Colors.dream.card,
                color: Colors.text.primary,
                fontSize: 16,
                lineHeight: 24,
                minHeight: 160,
                textAlignVertical: "top",
              }}
              placeholder="I was in a house, and then..."
              placeholderTextColor={Colors.text.muted}
              multiline
              maxLength={2000}
              value={dreamText}
              onChangeText={setDreamText}
              autoFocus
            />

            <View className="flex-row items-center justify-between mb-6">
              <Pressable
                onPress={toggleVoiceInput}
                className="flex-row items-center px-4 py-2.5 rounded-full"
                style={{
                  backgroundColor: isRecording ? Colors.dream.red + "30" : Colors.dream.card,
                }}
              >
                <Text style={{ fontSize: 16 }}>{isRecording ? "⏹️" : "🎤"}</Text>
                <Text className="ml-2" style={{ color: Colors.text.secondary, fontSize: 14 }}>
                  {isRecording ? "Stop recording" : "Tap to speak instead"}
                </Text>
              </Pressable>
              <Text style={{ color: Colors.text.muted, fontSize: 12 }}>
                {dreamText.length}/2000
              </Text>
            </View>
          </ScrollView>

          {/* Bottom button */}
          <View className="px-5 pb-6">
            <Pressable
              onPress={() => {
                if (dreamText.trim().length < 10) {
                  Alert.alert("Too Short", "Please describe your dream in more detail.");
                  return;
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setStep("tags");
              }}
              className="py-4 rounded-xl items-center"
              style={{
                backgroundColor:
                  dreamText.trim().length >= 10 ? Colors.dream.purple : Colors.dream.card,
              }}
            >
              <Text
                className="font-bold"
                style={{
                  color:
                    dreamText.trim().length >= 10 ? "#FFFFFF" : Colors.text.muted,
                  fontSize: 16,
                }}
              >
                Next →
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Step 2: Tags & Emotions
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dream.bg }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-3">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setStep("describe");
          }}
        >
          <Text style={{ color: Colors.text.secondary, fontSize: 16 }}>← Back</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Emotions */}
        <Text className="text-xl font-bold mb-1" style={{ color: Colors.text.primary }}>
          How did you feel?
        </Text>
        <Text className="mb-4" style={{ color: Colors.text.secondary, fontSize: 14 }}>
          Select all that apply
        </Text>

        <View className="flex-row flex-wrap gap-2.5 mb-8">
          {EMOTIONS.map((emotion) => {
            const selected = selectedEmotions.includes(emotion.key);
            return (
              <Pressable
                key={emotion.key}
                onPress={() => toggleEmotion(emotion.key)}
                className="flex-row items-center px-4 py-2.5 rounded-full"
                style={{
                  backgroundColor: selected ? emotion.color + "30" : Colors.dream.card,
                  borderWidth: selected ? 1.5 : 0,
                  borderColor: emotion.color,
                }}
              >
                <Text className="mr-1.5" style={{ fontSize: 16 }}>{emotion.emoji}</Text>
                <Text
                  style={{
                    color: selected ? Colors.text.primary : Colors.text.secondary,
                    fontSize: 14,
                    fontWeight: selected ? "600" : "400",
                  }}
                >
                  {emotion.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Tags */}
        <Text className="text-lg font-bold mb-1" style={{ color: Colors.text.primary }}>
          Dream had... <Text style={{ color: Colors.text.muted, fontSize: 13, fontWeight: "400" }}>(optional)</Text>
        </Text>

        <View className="flex-row flex-wrap gap-2.5 mb-8 mt-3">
          {DREAM_TAGS.map((tag) => {
            const selected = selectedTags.includes(tag.key);
            return (
              <Pressable
                key={tag.key}
                onPress={() => toggleTag(tag.key)}
                className="flex-row items-center px-4 py-2.5 rounded-full"
                style={{
                  backgroundColor: selected ? Colors.dream.purple + "30" : Colors.dream.card,
                  borderWidth: selected ? 1.5 : 0,
                  borderColor: Colors.dream.purple,
                }}
              >
                <Text className="mr-1.5" style={{ fontSize: 14 }}>{tag.emoji}</Text>
                <Text
                  style={{
                    color: selected ? Colors.text.primary : Colors.text.secondary,
                    fontSize: 14,
                  }}
                >
                  {tag.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom buttons */}
      <View className="px-5 pb-6 flex-row gap-3">
        <Pressable
          onPress={() => {
            // Skip tags, still decode
            handleDecode();
          }}
          className="py-4 px-6 rounded-xl"
          style={{ backgroundColor: Colors.dream.card }}
        >
          <Text className="font-semibold" style={{ color: Colors.text.muted, fontSize: 16 }}>
            Skip
          </Text>
        </Pressable>
        <Pressable
          onPress={handleDecode}
          className="flex-1 py-4 rounded-xl items-center"
          style={{ backgroundColor: Colors.dream.purple }}
        >
          <Text className="font-bold" style={{ color: "#FFFFFF", fontSize: 16 }}>
            Decode 🔮
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// Loading/Decoding screen with animation
function DecodingScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [quoteIndex] = useState(Math.floor(Math.random() * DREAM_QUOTES.length));

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ backgroundColor: Colors.dream.bg }}
    >
      <Animated.Text
        style={{
          fontSize: 60,
          transform: [{ scale: pulseAnim }],
        }}
      >
        🔮
      </Animated.Text>
      <Text
        className="text-xl font-bold mt-6 mb-2"
        style={{ color: Colors.text.primary }}
      >
        Decoding your dream...
      </Text>
      <ActivityIndicator
        size="small"
        color={Colors.dream.purple}
        style={{ marginVertical: 12 }}
      />
      <Text
        className="text-center italic mt-4"
        style={{ color: Colors.text.secondary, fontSize: 14, lineHeight: 22 }}
      >
        "{DREAM_QUOTES[quoteIndex].text}"
      </Text>
      <Text className="mt-2" style={{ color: Colors.text.muted, fontSize: 12 }}>
        — {DREAM_QUOTES[quoteIndex].author}
      </Text>
    </View>
  );
}
