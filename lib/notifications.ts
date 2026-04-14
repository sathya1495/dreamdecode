import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getReminderTime } from "./storage";

// Configure notification handler (native only) — wrapped in try/catch
if (Platform.OS !== "web") {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.warn("Failed to set notification handler:", e);
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("dream-reminder", {
        name: "Dream Reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    return true;
  } catch (e) {
    console.error("Notification permission error:", e);
    return false;
  }
}

export async function scheduleMorningReminder(): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    // Cancel existing reminders
    await Notifications.cancelAllScheduledNotificationsAsync();

    const timeStr = await getReminderTime();
    const [hours, minutes] = timeStr.split(":").map(Number);

    const messages = [
      "🌙 What did you dream last night?",
      "🔮 Your dreams are waiting to be decoded...",
      "✨ Don't let your dream fade — capture it now!",
      "🌟 Your subconscious has something to tell you.",
      "📖 Start your day with dream insights.",
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "DreamDecode",
        body: randomMessage,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });
  } catch (e) {
    console.error("Failed to schedule reminder:", e);
  }
}

export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
