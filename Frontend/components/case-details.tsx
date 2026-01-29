import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CaseDetailsScreen() {
  const { title, client, hearingDate } =
    useLocalSearchParams<{
      title?: string;
      client?: string;
      hearingDate?: string;
    }>();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{title ?? "Case Details"}</Text>

      <View style={styles.meta}>
        <Ionicons name="person-outline" size={16} color="#475569" />
        <Text style={styles.metaText}>{client ?? "-"}</Text>
      </View>

      <View style={styles.meta}>
        <Ionicons name="calendar-outline" size={16} color="#B91C1C" />
        <Text style={styles.metaText}>
          Next Hearing: {hearingDate ?? "-"}
        </Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>AI Case Summary</Text>

      <View style={styles.aiCard}>
        <Text style={styles.aiText}>
          AI-generated explanation of the case will appear here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 14,
    color: "#475569",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  aiCard: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  aiText: {
    fontSize: 14,
    color: "#334155",
  },
});
