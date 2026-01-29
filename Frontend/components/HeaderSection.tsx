import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  lawyerName: string;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export default function HeaderSection({ lawyerName }: Props) {
  return (
    <View style={styles.container}>
      {/* LEFT CONTENT */}
      <View>
        <View style={styles.greetingPill}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
        </View>

        <Text style={styles.name}>{lawyerName}</Text>
        <Text style={styles.date}>{getFormattedDate()}</Text>
      </View>

      {/* AVATAR */}
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color="#1E3A8A" />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    marginBottom: 12, // ⬅️ REDUCED (was 28)
    paddingHorizontal: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  greetingPill: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,

    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,

    marginBottom: 4,
  },

  greetingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A8A",
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#020617",
    marginBottom: 3, // tighter
  },

  date: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2, // ⬅️ tighter alignment
  },
});
