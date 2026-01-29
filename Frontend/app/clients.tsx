import { View, Text, StyleSheet, FlatList } from "react-native";

const clients = [
  {
    id: "1",
    name: "Rohit Sharma",
    age: 42,
    matter: "Property Dispute",
    hearing: "12 Feb 2026",
  },
  {
    id: "2",
    name: "Anita Verma",
    age: 35,
    matter: "Divorce Case",
    hearing: "18 Feb 2026",
  },
  {
    id: "3",
    name: "Suresh Rao",
    age: 51,
    matter: "Cyber Fraud",
    hearing: "22 Feb 2026",
  },
];

export default function Clients() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clients</Text>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name} ({item.age})</Text>
            <Text style={styles.detail}>Matter: {item.matter}</Text>
            <Text style={styles.detail}>Hearing: {item.hearing}</Text>
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
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    color: "#6B7280",
  },
});
