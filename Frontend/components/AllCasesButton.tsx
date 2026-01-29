import { Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AllCasesButton() {
  const router = useRouter();

  return (
    <Pressable
      style={styles.button}
      onPress={() => router.push("/cases")}
    >
      <Text style={styles.text}>Open All Cases</Text>
      <Ionicons name="arrow-forward" size={18} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1E3A8A",
    padding: 16,
    borderRadius: 14,
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
