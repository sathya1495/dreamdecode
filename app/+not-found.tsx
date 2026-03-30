import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";
import { Colors } from "@/constants/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          backgroundColor: Colors.dream.bg,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: Colors.text.primary }}>
          This screen doesn't exist.
        </Text>
        <Link href="/" style={{ marginTop: 15, paddingVertical: 15 }}>
          <Text style={{ fontSize: 14, color: Colors.dream.purple }}>
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}
