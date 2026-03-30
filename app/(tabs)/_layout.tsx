import React from "react";
import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/theme";

function TabIcon({
  name,
  color,
  label,
  focused,
}: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View className="items-center justify-center pt-2">
      <FontAwesome name={name} size={22} color={color} />
      <Text
        className="mt-1"
        style={{
          fontSize: 10,
          color,
          fontWeight: focused ? "600" : "400",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.dream.surface,
          borderTopColor: Colors.dream.card,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
        },
        tabBarActiveTintColor: Colors.dream.purple,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="book" color={color} label="Journal" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bar-chart" color={color} label="Insights" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="cog" color={color} label="Settings" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
