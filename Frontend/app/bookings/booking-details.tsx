import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function BookingDetailsScreen() {
  const router = useRouter();
  const { client, caseType } =
    useLocalSearchParams<{
      client?: string;
      caseType?: string;
    }>();

  return (
    <SafeAreaView style={styles.safe}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color="#1E3A8A" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NEW BOOKING</Text>
        </View>

        <Text style={styles.client}>{client}</Text>

        <Text style={styles.label}>Case Type</Text>
        <Text style={styles.value}>{caseType}</Text>

        <View style={styles.divider} />

        {/* CHAT */}
        <Pressable style={styles.chatBtn}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color="#fff"
          />
          <Text style={styles.chatText}>Chat with Client</Text>
        </Pressable>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <Pressable style={[styles.actionBtn, styles.accept]}>
            <Text style={styles.acceptText}>Accept</Text>
          </Pressable>

          <Pressable style={[styles.actionBtn, styles.reject]}>
            <Text style={styles.rejectText}>Reject</Text>
          </Pressable>
        </View>
      </View>
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

  topBar: {
    padding: 12,
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E3A8A",
  },

  card: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 20,
    borderRadius: 22,
    elevation: 4,
  },

  badge: {
    backgroundColor: "#EEF2FF",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1E3A8A",
  },

  client: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
  },

  label: {
    fontSize: 12,
    color: "#64748B",
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 16,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 20,
  },

  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1E3A8A",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 14,
  },

  chatText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },

  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  accept: {
    backgroundColor: "#DCFCE7",
  },

  reject: {
    backgroundColor: "#FEE2E2",
  },

  acceptText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
  },

  rejectText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#991B1B",
  },
});
