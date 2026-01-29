import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";

/* =====================
   TYPES
===================== */
export interface PriorityCase {
  id: number;
  title: string;
  client: string;
  hearingDate: string;
}

interface Props {
  cases: PriorityCase[];
}

/* =====================
   COMPONENT
===================== */
export default function PriorityCases({ cases }: Props) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const primaryCase = cases[0];
  const otherCases = cases.slice(1);

  const openCaseDetails = (item: PriorityCase) => {
    router.push({
      pathname: "/cases/case-details", // ✅ EXACT ROUTE
      params: {
        title: item.title,
        client: item.client,
        hearingDate: item.hearingDate,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>High Priority</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cases.length}</Text>
        </View>
      </View>

      {/* PRIMARY CASE */}
      {primaryCase && (
        <Pressable
          onPress={() => openCaseDetails(primaryCase)}
          style={({ pressed }) => [
            styles.focusCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.topRow}>
            <View style={styles.caseTypePill}>
              <Text style={styles.caseTypeText}>PRIORITY</Text>
            </View>

            <View style={styles.urgentPill}>
              <Ionicons name="alert-circle" size={14} color="#fff" />
              <Text style={styles.urgentText}>HIGH</Text>
            </View>
          </View>

          <Text style={styles.caseTitle}>{primaryCase.title}</Text>

          <View style={styles.clientRow}>
            <Ionicons name="person-outline" size={14} color="#475569" />
            <Text style={styles.client}>{primaryCase.client}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.footerRow}>
            <View style={styles.hearingInfo}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color="#B91C1C"
              />
              <View>
                <Text style={styles.hearingLabel}>Next Hearing</Text>
                <Text style={styles.hearingDate}>
                  {primaryCase.hearingDate}
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#1E3A8A"
            />
          </View>
        </Pressable>
      )}

      {/* DROPDOWN */}
      {otherCases.length > 0 && (
        <Pressable
          onPress={() => setExpanded(!expanded)}
          style={({ pressed }) => [
            styles.dropdownButton,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.dropdownContent}>
            <View>
              <Text style={styles.dropdownLabel}>
                Other Priority Cases ({otherCases.length})
              </Text>
              <Text style={styles.dropdownSubtext}>
                {expanded ? "Tap to collapse" : "Tap to expand"}
              </Text>
            </View>

            <Ionicons
              name="chevron-down"
              size={20}
              color="#1E3A8A"
              style={{
                transform: [{ rotate: expanded ? "180deg" : "0deg" }],
              }}
            />
          </View>
        </Pressable>
      )}

      {/* SECONDARY CASES */}
      {expanded &&
        otherCases.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => openCaseDetails(item)}
            style={({ pressed }) => [
              styles.secondaryCard,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryTitle}>{item.title}</Text>
            <Text style={styles.client}>{item.client}</Text>
            <Text style={styles.secondaryDate}>
              Hearing: {item.hearingDate}
            </Text>
          </Pressable>
        ))}
    </View>
  );
}

/* =====================
   STYLES
===================== */
const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingLeft: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  focusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    elevation: 6,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  caseTypePill: {
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  caseTypeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  urgentPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#B91C1C",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  urgentText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  caseTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  client: {
    fontSize: 14,
    color: "#475569",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 14,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hearingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  hearingLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  hearingDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B91C1C",
  },
  dropdownButton: {
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dropdownContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  dropdownSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  secondaryCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  secondaryTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  secondaryDate: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748B",
  },
  pressed: {
    opacity: 0.85,
  },
});
