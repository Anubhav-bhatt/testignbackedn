import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usePriorityCases } from "../app/context/PriorityContext";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

/* =====================
   TYPES
===================== */
type CaseItem = {
  id: number;
  title: string;
  client: string;
  caseDate: string;
  category: string;
  court: string;
  nextHearing: string;
  moneyPending: string;
  moneyReceived: string;
};

/* =====================
   COMPONENT
===================== */
export default function CaseFullCard({
  caseItem,
}: {
  caseItem: CaseItem;
}) {
  const [expanded, setExpanded] = useState(false);
  const [justPrioritised, setJustPrioritised] = useState(false);

  const router = useRouter();
  const { addPriorityCase, isPriority } = usePriorityCases();

  const alreadyPriority = isPriority(caseItem.id);

  const toggle = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut
    );
    setExpanded((prev) => !prev);
  };

  const openAI = () => {
    router.push({
      pathname: "/cases/ai",
      params: {
        caseId: caseItem.id,
        title: caseItem.title,
        client: caseItem.client,
      },
    });
  };

  const markAsPriority = () => {
    if (alreadyPriority) return;

    addPriorityCase({
      id: caseItem.id,
      title: caseItem.title,
      client: caseItem.client,
      hearingDate: caseItem.nextHearing,
      reason: "Referral",
    });

    // ✅ UI feedback only
    setJustPrioritised(true);
  };

  return (
    <View style={styles.card}>
      {/* =====================
          PRIMARY ROW
      ====================== */}
      <Pressable onPress={toggle} style={styles.primaryRow}>
        <View style={styles.leftBlock}>
          <Text style={styles.clientName} numberOfLines={1}>
            {caseItem.client}
          </Text>

          <Text style={styles.meta} numberOfLines={1}>
            {caseItem.caseDate} • {caseItem.category} • {caseItem.court}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={openAI}
            hitSlop={10}
            style={({ pressed }) => [
              styles.aiChip,
              pressed && styles.aiPressed,
            ]}
          >
            <Ionicons name="sparkles" size={14} color="#4338CA" />
            <Text style={styles.aiText}>AI</Text>
          </Pressable>

          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#475569"
          />
        </View>
      </Pressable>

      {/* =====================
          DROPDOWN
      ====================== */}
      {expanded && (
        <View style={styles.dropdown}>
          <TwoColItem
            icon="alert-circle-outline"
            label="Money Pending"
            value={`₹ ${caseItem.moneyPending}`}
            danger
          />
          <TwoColItem
            icon="calendar-outline"
            label="Next Hearing"
            value={caseItem.nextHearing}
          />
          <TwoColItem
            icon="checkmark-circle-outline"
            label="Money Received"
            value={`₹ ${caseItem.moneyReceived}`}
            success
          />
          <TwoColItem
            icon="document-text-outline"
            label="Documents"
            value="Submitted"
          />

          {/* =====================
              PRIORITY ACTION
          ====================== */}
          <Pressable
            onPress={markAsPriority}
            disabled={justPrioritised}
            style={[
              styles.priorityCard,
              justPrioritised && styles.priorityDone,
            ]}
          >
            <Ionicons
              name={justPrioritised ? "checkmark-circle" : "star"}
              size={18}
              color={justPrioritised ? "#15803D" : "#F59E0B"}
            />

            <View>
              <Text
                style={[
                  styles.priorityTitle,
                  justPrioritised && styles.priorityTitleDone,
                ]}
              >
                {justPrioritised
                  ? "Prioritised"
                  : "Mark as Priority"}
              </Text>

              <Text
                style={[
                  styles.prioritySub,
                  justPrioritised && styles.prioritySubDone,
                ]}
              >
                {justPrioritised
                  ? "Case successfully prioritised"
                  : "Highlight this case on dashboard"}
              </Text>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* =====================
   SUB COMPONENT
===================== */
function TwoColItem({
  icon,
  label,
  value,
  danger,
  success,
}: {
  icon: any;
  label: string;
  value: string;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <View style={styles.twoColItem}>
      <Ionicons
        name={icon}
        size={18}
        color={
          danger ? "#B91C1C" : success ? "#15803D" : "#1E293B"
        }
      />
      <View>
        <Text style={styles.twoColLabel}>{label}</Text>
        <Text
          style={[
            styles.twoColValue,
            danger && { color: "#B91C1C" },
            success && { color: "#15803D" },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/* =====================
   STYLES
===================== */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 16,
    elevation: 4,
    overflow: "hidden",
  },

  primaryRow: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
  },

  leftBlock: {
    flex: 1,
    marginRight: 12,
  },

  clientName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#020617",
  },

  meta: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  aiChip: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
  },

  aiText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4338CA",
  },

  aiPressed: {
    transform: [{ scale: 0.96 }],
  },

  dropdown: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 14,
    columnGap: 12,
  },

  twoColItem: {
    width: "48%",
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 14,
  },

  twoColLabel: {
    fontSize: 11,
    color: "#64748B",
  },

  twoColValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#020617",
  },

  priorityCard: {
    width: "100%",
    marginTop: 8,
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  priorityDone: {
    backgroundColor: "#DCFCE7",
  },

  priorityTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#92400E",
  },

  priorityTitleDone: {
    color: "#15803D",
  },

  prioritySub: {
    fontSize: 12,
    color: "#B45309",
    marginTop: 2,
  },

  prioritySubDone: {
    color: "#166534",
  },
});
