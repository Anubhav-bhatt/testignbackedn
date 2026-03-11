import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProfile } from "../../api";
import { useTheme } from "../context/ThemeContext";

export default function PersonalDetails() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const InfoRow = ({ label, value, icon }: { label: string, value: string, icon: any }) => (
    <View style={[styles.infoRow, { borderColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{value || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme === 'dark' ? '#000000' : '#F2F5F8' }]} edges={["top"]}>
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : profile ? (
          <>
            {/* Top Profile Card */}
            <View style={[styles.profileCard, { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF', borderColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarLetter}>{profile.name ? profile.name[0] : 'U'}</Text>
                </View>
              )}
              <View style={styles.profileHeaderInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{profile.name}</Text>
                <View style={[styles.roleBadge, { backgroundColor: profile.role === 'admin' ? '#8B5CF620' : '#3B82F620' }]}>
                  <Text style={[styles.roleText, { color: profile.role === 'admin' ? '#8B5CF6' : '#3B82F6' }]}>
                    {profile.role ? profile.role.toUpperCase() : 'CLIENT'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Info Sections */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CONTACT INFORMATION</Text>
              <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF', borderColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                <InfoRow label="Email Address" value={profile.email} icon="mail-outline" />
                <InfoRow label="Phone Number" value={profile.phone} icon="call-outline" />
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PROFESSIONAL INFO</Text>
              <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF', borderColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                <InfoRow label="Firm / Company Name" value={profile.firm_name} icon="business-outline" />
                <InfoRow label="Bar ID / Verification" value={profile.bar_id} icon="shield-checkmark-outline" />
                <InfoRow label="Specialization" value={profile.specialization} icon="briefcase-outline" />
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT STATUS</Text>
              <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF', borderColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                <InfoRow label="Account Verification" value={profile.status ? profile.status.toUpperCase() : 'PENDING'} icon="checkmark-circle-outline" />
              </View>
            </View>

            <Pressable style={[styles.editBtn, { backgroundColor: colors.primary }]}>
              <Ionicons name="pencil" size={16} color="#FFF" />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </Pressable>

            <View style={{ height: 40 }} />
          </>
        ) : (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Could not fetch profile details.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  content: {
    padding: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    gap: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },
  profileHeaderInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 10,
  },
  editBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  }
});
