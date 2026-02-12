import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../app/context/ThemeContext";

interface Props {
  visible: boolean;
  profile: any;
  onClose: () => void;
  onUploadImage: () => void;
  onPersonalDetails: () => void;
  onLogout: () => void;
}

export default function ProfileSidebar({
  visible,
  profile,
  onClose,
  onUploadImage,
  onPersonalDetails,
  onLogout,
}: Props) {
  const { colors, theme } = useTheme();
  if (!visible) return null;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <View style={[styles.sidebar, { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF' }]}>
        {/* ================= PROFILE ================= */}
        <View style={styles.profileBlock}>
          <Pressable style={styles.avatarWrapper} onPress={onUploadImage}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{profile?.name ? profile.name[0] : 'A'}</Text>
              </View>
            )}

            <View style={[styles.cameraBadge, { backgroundColor: colors.background, borderColor: theme === 'dark' ? colors.border : '#FFF' }]}>
              <Ionicons name="camera" size={14} color={colors.primary} />
            </View>
          </Pressable>

          <Text style={[styles.name, { color: colors.text }]}>{profile?.name || "Anubhav Bhatt"}</Text>
          <Text style={[styles.role, { color: colors.textSecondary }]}>{profile?.specialization || "Advocate • Legal-IQ"}</Text>
          <Text style={[styles.firm, { color: colors.primary }]}>{profile?.firmName}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* ================= SUMMARY STATS ================= */}
        <View style={styles.statsRow}>
          <StatItem label="Cases" value={profile?.summary?.totalCases || '0'} />
          <StatItem label="Clients" value={profile?.summary?.activeClients || '0'} />
          <StatItem label="Tasks" value={profile?.summary?.pendingTasks || '0'} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* ================= ACCOUNT ================= */}
        <Section title="Account" color={colors.textSecondary}>
          <Item
            icon="person-outline"
            label="Personal Details"
            onPress={onPersonalDetails}
            textColor={colors.text}
          />
          <Item
            icon="call-outline"
            label="Contact Information"
            onPress={() => { }}
            textColor={colors.text}
          />
          <Item
            icon="shield-checkmark-outline"
            label="Security & Bar ID"
            onPress={() => { }}
            textColor={colors.text}
          />
        </Section>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* ================= LOGOUT ================= */}
        <Pressable style={styles.logout} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Logout from Legal-IQ</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

/* ================= COMPONENTS ================= */

function StatItem({ label, value }: { label: string, value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{value}</Text>
      <Text style={{ fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '500' }}>{label}</Text>
    </View>
  );
}

function Section({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      {children}
    </View>
  );
}

function Item({
  icon,
  label,
  onPress,
  textColor,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  textColor: string;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        pressed && { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F1F5F9' },
      ]}
    >
      <Ionicons name={icon} size={20} color={textColor} />
      <Text style={[styles.itemText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
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
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
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
    width: 90,
    height: 90,
    borderRadius: 45,
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
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  role: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },

  firm: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase'
  },

  statsRow: {
    flexDirection: 'row',
    paddingVertical: 10,
  },

  /* SECTIONS */
  section: {
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: 'uppercase',
    marginBottom: 8,
    opacity: 0.6,
  },

  divider: {
    height: 1,
    marginVertical: 16,
    opacity: 0.5,
  },

  /* ITEMS */
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  itemText: {
    marginLeft: 14,
    fontSize: 15,
    fontWeight: "600",
  },

  /* LOGOUT */
  logout: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 20,
  },

  logoutText: {
    marginLeft: 14,
    fontSize: 15,
    fontWeight: "700",
    color: "#DC2626",
  },
});
