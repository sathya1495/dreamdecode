import "@/global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { Platform, View, ActivityIndicator, LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Sentry from "@sentry/react-native";

import { AppProvider, useApp } from "@/context/AppContext";
import { Colors } from "@/constants/theme";

// ── Initialize Sentry FIRST — before anything else ──
Sentry.init({
  dsn: "https://cc268e98a184bd706c72ae9948fc9df2@o879802.ingest.us.sentry.io/4511146334289920",
  // Enable performance monitoring
  tracesSampleRate: 1.0,
  // Capture 100% of errors in production
  sampleRate: 1.0,
  // Add device context, breadcrumbs, etc.
  enableAutoSessionTracking: true,
  attachStacktrace: true,
  // Only send in production builds
  enabled: !__DEV__,
  debug: false,
});

// Suppress noisy warnings in production
LogBox.ignoreLogs(["Reanimated", "NativeWind"]);

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Wrap in try/catch — some devices crash if called too early
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  console.warn("SplashScreen.preventAutoHideAsync failed:", e);
}

// Global error handlers — catch + REPORT unhandled errors to Sentry
if (!__DEV__) {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    // Report to Sentry with full context
    Sentry.captureException(error, {
      tags: { isFatal: String(isFatal) },
      level: isFatal ? "fatal" : "error",
    });
    console.error("Global error caught:", error, "isFatal:", isFatal);
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { onboardingDone, isLoading } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === "onboarding";

    if (!onboardingDone && !inOnboarding) {
      router.replace("/onboarding");
    }
  }, [onboardingDone, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.dream.bg }}>
        <ActivityIndicator size="large" color={Colors.dream.purple} />
      </View>
    );
  }

  return <>{children}</>;
}

function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Safely initialize NavigationBar AFTER React Native bridge is ready
  useEffect(() => {
    if (Platform.OS === "android") {
      // Delay to ensure native modules are fully initialized
      const timer = setTimeout(async () => {
        try {
          const NavigationBar = require("expo-navigation-bar");
          await NavigationBar.setVisibilityAsync("hidden");
          await NavigationBar.setBehaviorAsync("overlay-swipe");
          await NavigationBar.setBackgroundColorAsync("transparent");
        } catch (e) {
          // Silently fail — nav bar just won't auto-hide on unsupported devices
          console.warn("NavigationBar setup failed (device may not support it):", e);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
      // Don't throw — just continue without custom font
    }
  }, [error]);

  useEffect(() => {
    if (loaded || error) {
      try {
        SplashScreen.hideAsync();
      } catch (e) {
        console.warn("SplashScreen.hideAsync failed:", e);
      }
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <StatusBar style="light" />
        <NavigationGuard>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.dream.bg },
              animation: "fade",
            }}
          >
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="dream-input"
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="dream-result"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="dream-detail"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="paywall"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
          </Stack>
        </NavigationGuard>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
