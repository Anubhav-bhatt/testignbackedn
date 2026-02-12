import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from "react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

/* =====================
   TYPES
===================== */
type CaseItem = {
  id: string | number;
  title: string;
  client: string;
  caseDate: string;
  category: string;
  court: string;
  nextHearing: string;
  stage: string;
  courtRoom: string;
  documentCount?: number;
  moneyPending?: string;
  moneyReceived?: string;
};

/* =====================
   COMPONENT
===================== */
import { useTheme } from "../app/context/ThemeContext";

export default function CaseFullCard({
  caseItem,
}: {
  caseItem: CaseItem;
}) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const { colors, theme } = useTheme();

  const openSummary = () => {
    router.push({
      pathname: "/cases/summary",
      params: { id: caseItem.id }
    });
  };

  const openAI = () => {
    router.push({
      pathname: "/ai",
      params: {
        caseId: caseItem.id,
        title: caseItem.title,
        client: caseItem.client,
      },
    });
  };

  return (
    <View style={[styles.card, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF', shadowColor: theme === 'dark' ? "#000" : "#000" }]}>
      {/* =====================
          PRIMARY ROW
      ====================== */}
      <Pressable onPress={openSummary} style={styles.primaryRow}>
        <View style={styles.leftBlock}>
          <View style={styles.clientRow}>
            <Text style={[styles.clientName, { color: colors.text }]} numberOfLines={1}>
              {caseItem.client}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: caseItem.category === 'Criminal' ? '#FEF2F2' : '#F0F9FF', borderColor: caseItem.category === 'Criminal' ? '#FECACA' : '#BAE6FD' }]}>
              <Text style={[styles.typeBadgeText, { color: caseItem.category === 'Criminal' ? '#DC2626' : '#0369A1' }]}>
                {caseItem.category.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
            {caseItem.caseDate} • {caseItem.court}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={openAI}
            hitSlop={10}
            style={({ pressed }) => [
              styles.aiChip,
              pressed && styles.aiPressed,
              { backgroundColor: theme === 'dark' ? colors.primary + '20' : '#EEF2FF' }
            ]}
          >
            <Ionicons name="sparkles" size={14} color={colors.primary} />
            <Text style={[styles.aiText, { color: colors.primary }]}>AI</Text>
          </Pressable>

          <TouchableOpacity onPress={() => setExpanded(!expanded)} hitSlop={10}>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </Pressable>

      {/* =====================
          DROPDOWN
      ====================== */}
      {expanded && (
        <View style={[styles.dropdown, { backgroundColor: theme === 'dark' ? colors.background : '#F8FAFC' }]}>
          <TwoColItem
            icon="layers-outline"
            label="Case Stage"
            value={caseItem.stage}
          />
          <TwoColItem
            icon="calendar-outline"
            label="Next Hearing"
            value={caseItem.nextHearing}
          />
          <TwoColItem
            icon="business-outline"
            label="Court / Bench"
            value={caseItem.courtRoom}
          />
          <TwoColItem
            icon="document-text-outline"
            label="Documents"
            value={`${caseItem.documentCount ?? 0} Files`}
          />
          <TwoColItem
            icon="cash-outline"
            label="Pending"
            value={`₹${caseItem.moneyPending ?? '0'}`}
            danger={parseFloat(caseItem.moneyPending?.replace(/,/g, '') || '0') > 0}
          />
          <TwoColItem
            icon="checkmark-circle-outline"
            label="Received"
            value={`₹${caseItem.moneyReceived ?? '0'}`}
            success
          />
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
  const { colors, theme } = useTheme();

  return (
    <View style={[styles.twoColItem, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF' }]}>
      <Ionicons
        name={icon}
        size={18}
        color={
          danger ? colors.danger : success ? colors.success : colors.textSecondary
        }
      />
      <View>
        <Text style={[styles.twoColLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text
          style={[
            styles.twoColValue,
            { color: colors.text },
            danger && { color: colors.danger },
            success && { color: colors.success },
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
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  meta: {
    fontSize: 12,
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
  },

  aiText: {
    fontSize: 11,
    fontWeight: "700",
  },

  aiPressed: {
    transform: [{ scale: 0.96 }],
  },

  dropdown: {
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
    padding: 12,
    borderRadius: 14,
  },

  twoColLabel: {
    fontSize: 11,
  },

  twoColValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});
