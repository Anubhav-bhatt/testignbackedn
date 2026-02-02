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
      pathname: "/cases/case-details",
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
        <View style={styles.headerLeft}>
          <Text style={styles.heading}>High Priority</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cases.length}</Text>
          </View>
        </View>

        {/* ✅ SEE ALL */}
        {cases.length > 1 && (
          <Pressable onPress={() => router.push("/priority-cases")}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        )}
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

      {/* DROPDOWN FOR EXTRA CASES */}
      {otherCases.length > 0 && (
        <Pressable
          onPress={() => setExpanded(!expanded)}
          style={styles.dropdownButton}
        >
          <View style={styles.dropdownContent}>
            <Text style={styles.dropdownLabel}>
              Other Priority Cases ({otherCases.length})
            </Text>
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

      {expanded &&
        otherCases.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => openCaseDetails(item)}
            style={styles.secondaryCard}
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  focusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    elevation: 5,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    marginVertical: 6,
  },
  clientRow: {
    flexDirection: "row",
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
  },
  hearingInfo: {
    flexDirection: "row",
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
    padding: 14,
    marginBottom: 12,
  },
  dropdownContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  secondaryTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  secondaryDate: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  pressed: {
    opacity: 0.85,
  },
});
