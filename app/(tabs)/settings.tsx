import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useApp } from "@/context/AppContext";
import { Colors } from "@/constants/theme";
import {
  requestNotificationPermissions,
  scheduleMorningReminder,
  cancelAllReminders,
} from "@/lib/notifications";
import { getReminderTime, setReminderTime, isReminderEnabled as getIsReminderEnabled, setReminderEnabled as saveReminderEnabled } from "@/lib/storage";
import { restorePurchases } from "@/lib/purchases";
import { getDreams } from "@/lib/database";

export default function SettingsScreen() {
  const router = useRouter();
  const { profile } = useApp();
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTimeStr, setReminderTimeStr] = useState("07:00");

  useEffect(() => {
    async function load() {
      const time = await getReminderTime();
      setReminderTimeStr(time);
      const enabled = await getIsReminderEnabled();
      setReminderEnabled(enabled);
    }
    load();
  }, []);

  async function toggleReminder(value: boolean) {
    setReminderEnabled(value);
    if (value) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleMorningReminder();
        await saveReminderEnabled(true);
      } else {
        setReminderEnabled(false);
        await saveReminderEnabled(false);
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to get dream reminders."
        );
      }
    } else {
      await cancelAllReminders();
      await saveReminderEnabled(false);
    }
  }

  async function handleRestore() {
    const success = await restorePurchases();
    if (success) {
      Alert.alert("Success", "Your premium subscription has been restored!");
    } else {
      Alert.alert("No Purchases", "No previous purchases found to restore.");
    }
  }

  async function handleExport() {
    try {
      const allDreams = await getDreams(10000, 0);
      if (allDreams.length === 0) {
        Alert.alert("No Dreams", "You haven't logged any dreams yet.");
        return;
      }
      const json = JSON.stringify(allDreams, null, 2);
      const FileSystem = require('expo-file-system');
      const Sharing = require('expo-sharing');
      const fileUri = FileSystem.documentDirectory + 'dreamdecode_export.json';
      await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Export Dreams' });
      } else {
        Alert.alert("Exported", `${allDreams.length} dreams saved to app storage.`);
      }
    } catch (e) {
      console.warn('Export error:', e);
      Alert.alert("Error", "Failed to export dreams. Please try again.");
    }
  }

  function handleDeleteAll() {
    Alert.alert(
      "Delete All Data",
      "This will permanently delete all your dreams and data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: async () => {
            try {
              const { getDb } = require('@/lib/database');
              const db = await getDb();
              await db.runAsync('DELETE FROM dreams');
              await db.runAsync('DELETE FROM user_profile');
              Alert.alert("Deleted", "All data has been cleared. Please restart the app for a fresh start.");
            } catch (e) {
              console.warn('Delete all error:', e);
              Alert.alert("Error", "Failed to delete data. Please try again.");
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dream.bg }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-5 pt-4 mb-4">
          <Text className="text-2xl font-bold" style={{ color: Colors.text.primary }}>
            ⚙️ Settings
          </Text>
        </View>

        {/* Reminders */}
        <SectionHeader title="Reminders" />
        <SettingsRow
          label="Morning reminder"
          subtitle={`Daily at ${reminderTimeStr}`}
          right={
            <Switch
              value={reminderEnabled}
              onValueChange={toggleReminder}
              trackColor={{ false: Colors.dream.card, true: Colors.dream.purple }}
              thumbColor="#FFFFFF"
            />
          }
        />

        {/* Premium */}
        <SectionHeader title="Premium" />
        <Pressable onPress={() => router.push("/paywall")}>
          <SettingsRow
            label={profile?.isPremium ? "✨ Premium Active" : "Upgrade to Premium ✨"}
            subtitle={
              profile?.isPremium
                ? "You have full access to all features"
                : "Unlimited interpretations, no ads, and more"
            }
            right={
              !profile?.isPremium ? (
                <Text style={{ color: Colors.dream.purple, fontWeight: "600" }}>→</Text>
              ) : null
            }
          />
        </Pressable>
        <Pressable onPress={handleRestore}>
          <SettingsRow label="Restore purchases" subtitle="Restore a previous subscription" />
        </Pressable>

        {/* About */}
        <SectionHeader title="About" />
        <Pressable onPress={() => Linking.openURL("https://apps.apple.com/app/dreamdecode-ai")}>
          <SettingsRow label="Rate DreamDecode ⭐" subtitle="Help us reach more dreamers" />
        </Pressable>
        <SettingsRow label="Privacy Policy" subtitle="How we handle your data" />
        <SettingsRow label="Terms of Service" subtitle="Usage terms" />
        <SettingsRow label="Version" subtitle="1.0.0" />

        {/* Data */}
        <SectionHeader title="Data" />
        <Pressable onPress={handleExport}>
          <SettingsRow label="Export my dreams" subtitle="Download as JSON" />
        </Pressable>
        <Pressable onPress={handleDeleteAll}>
          <SettingsRow
            label="Delete all data"
            subtitle="Permanently remove everything"
            danger
          />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View className="px-5 mt-5 mb-2">
      <Text className="font-semibold uppercase tracking-wider" style={{ color: Colors.text.muted, fontSize: 12 }}>
        {title}
      </Text>
    </View>
  );
}

function SettingsRow({
  label,
  subtitle,
  right,
  danger,
}: {
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <View
      className="mx-5 mb-1 px-4 py-3.5 rounded-xl flex-row items-center justify-between"
      style={{ backgroundColor: Colors.dream.card }}
    >
      <View className="flex-1 mr-3">
        <Text
          className="font-medium"
          style={{
            color: danger ? Colors.dream.red : Colors.text.primary,
            fontSize: 15,
          }}
        >
          {label}
        </Text>
        {subtitle && (
          <Text className="mt-0.5" style={{ color: Colors.text.muted, fontSize: 12 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}
