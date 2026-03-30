import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Haptics from "expo-haptics";

import { useApp } from "@/context/AppContext";
import { Colors, EMOTIONS } from "@/constants/theme";
import { Dream } from "@/types";
import { searchDreams, deleteDream } from "@/lib/database";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function getEmotionEmoji(key: string): string {
  return EMOTIONS.find((e) => e.key === key)?.emoji || "🌙";
}

function getEmotionColor(key: string): string {
  return Colors.emotion[key] || Colors.dream.purple;
}

export default function JournalScreen() {
  const router = useRouter();
  const { dreams, refreshDreams } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDreams, setFilteredDreams] = useState<Dream[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshDreams();
    }, [refreshDreams])
  );

  const displayDreams = isSearching ? filteredDreams : dreams;

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      setIsSearching(true);
      const results = await searchDreams(query.trim());
      setFilteredDreams(results);
    } else {
      setIsSearching(false);
      setFilteredDreams([]);
    }
  }

  function handleDelete(dream: Dream) {
    Alert.alert("Delete Dream", "Are you sure you want to delete this dream?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDream(dream.id);
          await refreshDreams();
        },
      },
    ]);
  }

  function renderDream({ item }: { item: Dream }) {
    const mainEmotion = item.emotions[0] || "calm";
    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({ pathname: "/dream-detail", params: { id: item.id } });
        }}
        onLongPress={() => handleDelete(item)}
        className="mx-5 mb-3 rounded-xl p-4"
        style={{
          backgroundColor: Colors.dream.card,
          borderLeftWidth: 3,
          borderLeftColor: getEmotionColor(mainEmotion),
        }}
      >
        <View className="flex-row items-center justify-between">
          <Text style={{ color: Colors.text.muted, fontSize: 12 }}>
            {formatDate(item.createdAt)}
          </Text>
          <Text>
            {getEmotionEmoji(mainEmotion)}{" "}
            <Text style={{ color: Colors.text.secondary, fontSize: 12 }}>
              {mainEmotion.charAt(0).toUpperCase() + mainEmotion.slice(1)}
            </Text>
          </Text>
        </View>
        <Text
          className="mt-2 font-medium"
          style={{ color: Colors.text.primary, fontSize: 15, lineHeight: 22 }}
          numberOfLines={2}
        >
          "{item.content.slice(0, 120)}{item.content.length > 120 ? "..." : ""}"
        </Text>
        {item.tags.length > 0 && (
          <View className="flex-row flex-wrap mt-2 gap-1.5">
            {item.tags.slice(0, 4).map((tag) => (
              <Text
                key={tag}
                className="px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: Colors.dream.surface,
                  color: Colors.text.muted,
                  fontSize: 11,
                }}
              >
                🏷️ {tag}
              </Text>
            ))}
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dream.bg }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold" style={{ color: Colors.text.primary }}>
          📖 Dream Journal
        </Text>
      </View>

      {/* Search */}
      <View className="mx-5 mb-3">
        <View
          className="flex-row items-center rounded-xl px-4 py-3"
          style={{ backgroundColor: Colors.dream.card }}
        >
          <FontAwesome name="search" size={16} color={Colors.text.muted} />
          <TextInput
            className="flex-1 ml-3"
            style={{ color: Colors.text.primary, fontSize: 15 }}
            placeholder="Search your dreams..."
            placeholderTextColor={Colors.text.muted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => handleSearch("")}>
              <FontAwesome name="times-circle" size={18} color={Colors.text.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Stats bar */}
      <View className="mx-5 mb-3 flex-row items-center justify-between">
        <Text style={{ color: Colors.text.secondary, fontSize: 13 }}>
          {displayDreams.length} dream{displayDreams.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Dream List */}
      <FlatList
        data={displayDreams}
        keyExtractor={(item) => item.id}
        renderItem={renderDream}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="items-center mt-16 px-8">
            <Text className="text-5xl mb-4">📖</Text>
            <Text
              className="text-center"
              style={{ color: Colors.text.secondary, fontSize: 16, lineHeight: 24 }}
            >
              {isSearching
                ? "No dreams match your search."
                : "Your dream journal is empty.\nRecord your first dream from the home screen!"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
