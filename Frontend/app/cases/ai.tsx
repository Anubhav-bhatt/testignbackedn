import { View, Text, StyleSheet } from "react-native";

export default function AI() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AI Assistant (Coming Soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
  },
});
