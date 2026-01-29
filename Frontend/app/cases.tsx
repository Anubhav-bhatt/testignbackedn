import { View, Text, StyleSheet, FlatList } from "react-native";

const cases = [
  { id: "1", title: "State vs Sharma", court: "District Court" },
  { id: "2", title: "Rao Property Dispute", court: "High Court" },
  { id: "3", title: "Cyber Fraud Case", court: "Sessions Court" },
];

export default function Cases() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Cases</Text>

      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.caseTitle}>{item.title}</Text>
            <Text style={styles.court}>{item.court}</Text>
          </View>
        )}
      />
    </View>
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
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    marginBottom: 12,
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  court: {
    marginTop: 6,
    color: "#6B7280",
  },
});
