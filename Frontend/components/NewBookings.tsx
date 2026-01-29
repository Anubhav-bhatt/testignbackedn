import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

/* Enable layout animation on Android */
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export interface BookingRequest {
  id: number;
  client: string;
  caseType: string;
}

interface Props {
  requests: BookingRequest[];
}

export default function NewBookings({ requests }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!requests.length) return null;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.wrapper}>
      {/* FLOATING CONTAINER */}
      <View style={styles.floatingCard}>
        {/* HEADER / COLLAPSE TOGGLE */}
        <Pressable
          onPress={toggle}
          style={({ pressed }) => [
            styles.header,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.headerLeft}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color="#1E3A8A"
            />
            <View>
              <Text style={styles.title}>New Booking Requests</Text>
              <Text style={styles.subtitle}>
                {requests.length} pending
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{requests.length}</Text>
            </View>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#1E3A8A"
            />
          </View>
        </Pressable>

        {/* EXPANDED CONTENT */}
        {expanded && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {requests.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.row,
                  index !== requests.length - 1 && styles.divider,
                ]}
              >
                {/* INFO */}
                <View style={styles.info}>
                  <Text style={styles.client}>{item.client}</Text>
                  <Text style={styles.caseType}>{item.caseType}</Text>
                </View>

                {/* ACTIONS */}
                <View style={styles.actions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.accept,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#16A34A"
                    />
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.reject,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name="close"
                      size={18}
                      color="#DC2626"
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  /* FLOATING POSITION */
  wrapper: {
    marginTop: 28,
    paddingHorizontal: 12,
  },

  floatingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",

    /* FLOATING DEPTH */
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: "#F8FAFC",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#020617",
  },

  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  countBadge: {
    backgroundColor: "#1E3A8A",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  /* EXPANDED CONTENT */
  scrollContent: {
    maxHeight: 220, // ⬅️ notification stack height
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  info: {
    flex: 1,
    marginRight: 10,
  },

  client: {
    fontSize: 15,
    fontWeight: "600",
    color: "#020617",
  },

  caseType: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  accept: {
    backgroundColor: "#DCFCE7",
  },

  reject: {
    backgroundColor: "#FEE2E2",
  },

  pressed: {
    opacity: 0.65,
  },
});
