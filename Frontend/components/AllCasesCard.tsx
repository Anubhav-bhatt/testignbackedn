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

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function AllCasesCard({ caseItem }: any) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.row}>
        <Text style={styles.title}>{caseItem.title}</Text>

        <Pressable onPress={toggleExpand}>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={22}
            color="#444"
          />
        </Pressable>
      </View>

      {/* BASIC INFO */}
      <Text style={styles.meta}>Category: {caseItem.category}</Text>
      <Text style={styles.meta}>Court: {caseItem.court}</Text>
      <Text style={styles.meta}>Start Date: {caseItem.startDate}</Text>

      {/* EXPANDABLE INFO */}
      {expanded && (
        <View style={styles.expand}>
          <Text style={styles.expandText}>
            Client: {caseItem.clientName}
          </Text>
          <Text style={styles.expandText}>
            Opponent: {caseItem.opponent}
          </Text>
          <Text style={styles.expandText}>
            Next Hearing: {caseItem.nextHearing}
          </Text>
          <Text style={styles.expandText}>
            Stage: {caseItem.stage}
          </Text>

          {/* VIEW DETAILS */}
          <Pressable
            style={styles.detailsBtn}
            onPress={() =>
              router.push({
                pathname: "/cases/case-details",
                params: { id: caseItem.id },
              })
            }
          >
            <Text style={styles.detailsText}>View Case Details</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  meta: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },
  expand: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  expandText: {
    fontSize: 13,
    color: "#333",
    marginBottom: 4,
  },
  detailsBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  detailsText: {
    color: "#1E3A8A",
    fontWeight: "600",
    fontSize: 13,
  },
});
