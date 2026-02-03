import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
  onUploadImage: () => void;
  onPersonalDetails: () => void;
  onLogout: () => void;
}

export default function ProfileSidebar({
  visible,
  onClose,
  onUploadImage,
  onPersonalDetails,
  onLogout,
}: Props) {
  if (!visible) return null;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <View style={styles.sidebar}>
        {/* ================= PROFILE ================= */}
        <View style={styles.profileBlock}>
          <Pressable style={styles.avatarWrapper} onPress={onUploadImage}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>A</Text>
            </View>

            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </Pressable>

          <Text style={styles.name}>Anubhav Bhatt</Text>
          <Text style={styles.role}>Advocate • Legal-IQ</Text>
        </View>

        <Divider />

        {/* ================= ACCOUNT ================= */}
        <Section title="Account">
          <Item
            icon="person-outline"
            label="Personal Details"
            onPress={onPersonalDetails}
          />
          <Item
            icon="call-outline"
            label="Contact Information"
            onPress={() => {}}
          />
          <Item
            icon="lock-closed-outline"
            label="Security"
            onPress={() => {}}
          />
        </Section>

        <Divider />

        {/* ================= PREFERENCES ================= */}
        <Section title="Preferences">
          <Item
            icon="settings-outline"
            label="App Settings"
            onPress={() => {}}
          />
          <Item
            icon="notifications-outline"
            label="Notifications"
            onPress={() => {}}
          />
        </Section>

        <Divider />

        {/* ================= LOGOUT ================= */}
        <Pressable style={styles.logout} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

/* ================= COMPONENTS ================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Item({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        pressed && styles.itemPressed,
      ]}
    >
      <Ionicons name={icon} size={20} color="#334155" />
      <Text style={styles.itemText}>{label}</Text>
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(2,6,23,0.45)",
    flexDirection: "row",
    justifyContent: "flex-end",
    zIndex: 200,
  },

  sidebar: {
    width: 320,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 28,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    elevation: 30,
  },

  /* PROFILE */
  profileBlock: {
    alignItems: "center",
    marginBottom: 12,
  },

  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  cameraBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#020617",
  },

  role: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  /* SECTIONS */
  section: {
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },

  /* ITEMS */
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },

  itemPressed: {
    backgroundColor: "#F1F5F9",
  },

  itemText: {
    marginLeft: 14,
    fontSize: 15,
    fontWeight: "500",
    color: "#1E293B",
  },

  /* LOGOUT */
  logout: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
  },

  logoutText: {
    marginLeft: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
  },
});
