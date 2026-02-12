import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../app/context/ThemeContext";

interface Props {
  lawyerName: string;
  onProfilePress: () => void;
  isProfileOpen: boolean;
}

export default function HeaderSection({
  lawyerName,
  onProfilePress,
  isProfileOpen,
}: Props) {
  const { theme, toggleTheme, colors } = useTheme();

  const hours = new Date().getHours();
  const greeting =
    hours < 12
      ? "Good Morning"
      : hours < 17
        ? "Good Afternoon"
        : "Good Evening";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <View style={styles.wrapper}>
      {/* LEFT TEXT BLOCK */}
      <View style={styles.textBlock}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
        <Text style={[styles.name, { color: colors.text }]}>{lawyerName}</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{today}</Text>
      </View>

      <View style={styles.actions}>
        {/* THEME TOGGLE */}
        <Pressable
          onPress={toggleTheme}
          style={[styles.iconButton, { backgroundColor: theme === 'light' ? colors.accent : colors.surface }]}
        >
          <Ionicons name={theme === 'light' ? "moon-outline" : "sunny-outline"} size={20} color={colors.text} />
        </Pressable>

        {/* RIGHT USER AVATAR */}
        <Pressable
          onPress={onProfilePress}
          style={({ pressed }) => [
            styles.userButton,
            { backgroundColor: theme === 'light' ? colors.accent : colors.surface },
            isProfileOpen && { borderColor: colors.primary, borderWidth: 1 },
            pressed && styles.userButtonPressed,
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {lawyerName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

/* =====================
   STYLES
===================== */
const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 24,
  },

  textBlock: {
    flex: 1,
  },

  greeting: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
  },

  name: {
    fontSize: 24,
    fontWeight: "800",
  },

  date: {
    fontSize: 12,
    marginTop: 4,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* USER BUTTON */
  userButton: {
    padding: 4,
    borderRadius: 999,
  },

  userButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
