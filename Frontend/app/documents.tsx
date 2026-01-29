import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* ========= TYPES ========= */
type DocumentItem = {
  id: string;
  title: string;
  type: string;
};

export default function Dashboard() {
  const documents: DocumentItem[] = [
    { id: "1", title: "Client D", type: "PDF" },
    { id: "2", title: "Agreement", type: "DOC" },
    { id: "3", title: "Guilt #1", type: "TXT" },
    { id: "4", title: "Guilt #2", type: "TXT" },
    { id: "5", title: "Proof #3", type: "PDF" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>LegalIQ</Text>
        <View style={styles.bell}>
          <Ionicons name="notifications-outline" size={22} color="#111827" />
        </View>
      </View>

      {/* Daily Meeting */}
      <Text style={styles.sectionTitle}>Daily client meeting</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Prachi Goswami</Text>
            <Text style={styles.email}>prachigoswami@gmail.com</Text>
          </View>
          <View style={styles.callBtn}>
            <Ionicons name="call-outline" size={20} color="#2563EB" />
          </View>
        </View>
      </View>

      {/* Ask AI */}
      <Pressable style={[styles.card, styles.askAI]}>
        <View style={styles.row}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
            }}
            style={styles.aiIcon}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Ask AI</Text>
            <Text style={styles.subText}>
              Ready to help with any legal queries
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
        </View>
      </Pressable>

      {/* Recent Documents */}
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Recent documents</Text>

        {/* ONLY LOGIC CHANGE */}
        <Pressable onPress={() => router.push("/documents")}>
          <Text style={styles.link}>See all</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
      >
        {documents.map((doc) => (
          <Pressable
            key={doc.id}
            style={styles.docCard}
            onPress={() =>
              router.push({
                pathname: "/document",
                params: doc,
              })
            }
          >
            <Ionicons
              name="document-text-outline"
              size={22}
              color="#2563EB"
            />
            <Text style={styles.docText}>{doc.title}</Text>
            <Text style={styles.docType}>{doc.type}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Schedule */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
        Schedule legal service
      </Text>

      <View style={styles.scheduleCard}>
        <View style={styles.dateBox}>
          <Text style={styles.date}>16</Text>
          <Text style={styles.month}>Jan</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Urgent</Text>
          </View>
          <Text style={styles.name}>Client meeting</Text>
          <Text style={styles.subText}>7:30 PM - 8:00 PM</Text>
        </View>

        <View style={styles.joinBtn}>
          <Text style={styles.joinText}>Join</Text>
        </View>
      </View>
    </ScrollView>
  );
}

/* ========= STYLES (UNCHANGED LOOK) ========= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    fontSize: 26,
    fontWeight: "700",
    color: "#6366F1",
  },
  bell: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  email: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },
  callBtn: {
    backgroundColor: "#EFF6FF",
    padding: 10,
    borderRadius: 12,
  },
  askAI: {
    backgroundColor: "#F8FAFF",
  },
  aiIcon: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  subText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  link: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "500",
  },
  docCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginRight: 12,
    alignItems: "center",
    width: 90,
  },
  docText: {
    fontSize: 11,
    marginTop: 6,
    color: "#374151",
    fontWeight: "600",
  },
  docType: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  scheduleCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  dateBox: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 14,
    alignItems: "center",
    marginRight: 12,
    width: 56,
  },
  date: {
    fontSize: 20,
    fontWeight: "700",
  },
  month: {
    fontSize: 12,
    color: "#6B7280",
  },
  badge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    color: "#DC2626",
    fontWeight: "600",
  },
  joinBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  joinText: {
    color: "#6366F1",
    fontWeight: "600",
  },
});
