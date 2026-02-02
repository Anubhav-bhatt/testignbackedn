import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  lawyerName: string;
}

export default function HeaderSection({ lawyerName }: Props) {
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
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.name}>{lawyerName}</Text>
        <Text style={styles.date}>{today}</Text>
      </View>

      {/* RIGHT AVATAR (INTERACTIVE) */}
      <Pressable
        style={({ pressed }) => [
          styles.avatar,
          pressed && styles.avatarPressed,
        ]}
      >
        <Ionicons name="person-outline" size={22} color="#1E3A8A" />
      </Pressable>
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
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 2,
  },

  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#020617",
  },

  date: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  avatarPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
});
