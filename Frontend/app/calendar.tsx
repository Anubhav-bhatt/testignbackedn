import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function Calendar() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📅 Calendar</Text>
      <Text style={styles.subTitle}>Upcoming hearings & meetings</Text>

      <View style={styles.card}>
        <Text style={styles.date}>16 Jan 2026</Text>
        <Text style={styles.event}>Client Meeting – Prachi Goswami</Text>
        <Text style={styles.time}>7:30 PM – 8:00 PM</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.date}>18 Jan 2026</Text>
        <Text style={styles.event}>Court Hearing – Civil Case</Text>
        <Text style={styles.time}>11:00 AM – 1:00 PM</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  subTitle: {
    color: "#6B7280",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  date: {
    fontWeight: "600",
    marginBottom: 6,
  },
  event: {
    fontSize: 15,
    color: "#111827",
  },
  time: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },
});
