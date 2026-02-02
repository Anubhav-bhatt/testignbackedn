import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CaseFullCard from "../../components/CaseFullCard";
import { cases } from "../data/cases";

export default function AllCasesScreen() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
          <Text style={styles.backText}>Dashboard</Text>
        </Pressable>
      </View>

      {/* CASE LIST */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {cases.map((item) => (
          <CaseFullCard
            key={item.id}
            caseItem={{
              client: item.client,
              caseDate: item.startDate,
              category: item.category,
              court: item.court,
              moneyPending: item.moneyPending,
              moneyReceived: item.moneyReceived,
              nextHearing: item.nextHearing,
            }}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* =====================
   STYLES
===================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
  },

  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },

  pressed: {
    opacity: 0.6,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },
});
