import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Platform,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CaseDetailsScreen() {
  const router = useRouter();

  const { title, client, hearingDate } =
    useLocalSearchParams<{
      title?: string;
      client?: string;
      hearingDate?: string;
    }>();

  return (
    <SafeAreaView style={styles.safe}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="arrow-back" size={20} color="#1E3A8A" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER CARD */}
        <View style={styles.headerCard}>
          <View style={styles.caseTypePill}>
            <Ionicons
              name="briefcase-outline"
              size={14}
              color="#1E3A8A"
            />
            <Text style={styles.caseTypeText}>LEGAL CASE</Text>
          </View>

          <Text style={styles.title}>
            {title ?? "Case Details"}
          </Text>

          <View style={styles.clientRow}>
            <Ionicons
              name="person-outline"
              size={16}
              color="#475569"
            />
            <Text style={styles.clientText}>
              {client ?? "Client not available"}
            </Text>
          </View>
        </View>

        {/* NEXT HEARING */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Hearing</Text>

          <View style={styles.hearingCard}>
            <Ionicons
              name="calendar-outline"
              size={22}
              color="#B91C1C"
            />
            <View>
              <Text style={styles.hearingDate}>
                {hearingDate ?? "Not scheduled"}
              </Text>
              <Text style={styles.hearingSub}>
                Court appearance required
              </Text>
            </View>
          </View>
        </View>

        {/* AI SUMMARY */}
        <View style={styles.section}>
          <View style={styles.aiHeader}>
            <Ionicons
              name="sparkles"
              size={18}
              color="#7C3AED"
            />
            <Text style={styles.sectionTitle}>
              AI Case Summary
            </Text>
          </View>

          <View style={styles.aiCard}>
            <Text style={styles.aiText}>
              This section will contain an AI-generated explanation
              of the case, including background, legal risks, and
              recommended next actions.
            </Text>
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsRow}>
            <View style={styles.actionCard}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#1E3A8A"
              />
              <Text style={styles.actionText}>Documents</Text>
            </View>

            <View style={styles.actionCard}>
              <Ionicons
                name="time-outline"
                size={20}
                color="#1E3A8A"
              />
              <Text style={styles.actionText}>Timeline</Text>
            </View>

            <View style={styles.actionCard}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color="#1E3A8A"
              />
              <Text style={styles.actionText}>Notes</Text>
            </View>
          </View>
        </View>
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

  topBar: {
    paddingHorizontal: 12,
    paddingTop: Platform.OS === "ios" ? 6 : 10,
    paddingBottom: 6,
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
    color: "#1E3A8A",
  },

  pressed: {
    opacity: 0.6,
  },

  scroll: {
    padding: 16,
  },

  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    elevation: 5,
  },

  caseTypePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF2FF",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },

  caseTypeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1E3A8A",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#020617",
    marginBottom: 10,
  },

  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  clientText: {
    fontSize: 14,
    color: "#475569",
  },

  section: {
    marginBottom: 26,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#020617",
  },

  hearingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    borderLeftWidth: 4,
    borderLeftColor: "#B91C1C",
  },

  hearingDate: {
    fontSize: 15,
    fontWeight: "700",
    color: "#B91C1C",
  },

  hearingSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  aiCard: {
    backgroundColor: "#F1F5F9",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  aiText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E3A8A",
  },
});
