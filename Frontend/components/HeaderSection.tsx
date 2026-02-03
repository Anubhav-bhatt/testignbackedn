import { View, Text, StyleSheet, Pressable } from "react-native";

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

      {/* RIGHT USER AVATAR */}
      <Pressable
        onPress={onProfilePress}
        style={({ pressed }) => [
          styles.userButton,
          isProfileOpen && styles.userButtonActive,
          pressed && styles.userButtonPressed,
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {lawyerName.charAt(0).toUpperCase()}
          </Text>
        </View>
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

  /* USER BUTTON */
  userButton: {
    padding: 4,
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
  },

  userButtonActive: {
    backgroundColor: "#E0E7FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },

  userButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
