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
import { useRouter } from "expo-router";

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
  const router = useRouter();

  if (!requests.length) return null;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.floatingCard}>
        {/* HEADER */}
        <Pressable onPress={toggle} style={styles.header}>
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

        {/* BOOKINGS LIST */}
        {expanded && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {requests.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  router.push({
                    pathname: "/bookings/booking-details",
                    params: {
                      client: item.client,
                      caseType: item.caseType,
                    },
                  })
                }
                style={({ pressed }) => [
                  styles.row,
                  index !== requests.length - 1 && styles.divider,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.info}>
                  <Text style={styles.client}>{item.client}</Text>
                  <Text style={styles.caseType}>{item.caseType}</Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#94A3B8"
                />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

/* =====================
   STYLES
===================== */
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 28,
    paddingHorizontal: 12,
  },

  floatingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
    elevation: 12,
  },

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

  scrollContent: {
    maxHeight: 220,
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

  pressed: {
    opacity: 0.6,
  },
});
