import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "../app/context/ThemeContext";

export default function BottomFloatingBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, theme } = useTheme();

  const active = (path: string) => pathname === path;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, shadowColor: theme === 'dark' ? '#000' : '#64748B' }]}>
      <Pressable
        style={[styles.item, active("/dashboard") && { backgroundColor: theme === 'light' ? colors.accent : colors.surface }]}
        onPress={() => router.replace("/dashboard")}
      >
        <Ionicons name="home-outline" size={24} color={active("/dashboard") ? colors.primary : colors.textSecondary} />
      </Pressable>

      <Pressable
        style={[styles.item, active("/cases") && { backgroundColor: theme === 'light' ? colors.accent : colors.surface }]}
        onPress={() => router.push("/cases")}
      >
        <Ionicons name="briefcase-outline" size={24} color={active("/cases") ? colors.primary : colors.textSecondary} />
      </Pressable>

      <Pressable
        style={[styles.item, active("/calendar") && { backgroundColor: theme === 'light' ? colors.accent : colors.surface }]}
        onPress={() => router.push("/calendar")}
      >
        <Ionicons name="calendar-outline" size={24} color={active("/calendar") ? colors.primary : colors.textSecondary} />
      </Pressable>

      <Pressable
        style={[styles.item, active("/ai") && { backgroundColor: theme === 'light' ? colors.accent : colors.surface }]}
        onPress={() => router.push("/ai")}
      >
        <Ionicons name="sparkles-outline" size={24} color={active("/ai") ? colors.primary : colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30, // Higher up
    alignSelf: 'center',
    width: '85%', // Not full width, pill shape
    height: 64,
    borderRadius: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,

    // Shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  item: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
