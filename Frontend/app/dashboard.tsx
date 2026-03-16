import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCases, getProfile, updateProfile, uploadDocument, closeCase } from "../api";
import HeaderSection from "../components/HeaderSection";
import ProfileSidebar from "../components/ProfileSidebar";
import SwipeableRow from "../components/SwipeableRow";
import { useTheme } from "./context/ThemeContext";

const INITIAL_CASES = [
  {
    id: 1,
    caseId: "CIV-2024-001",
    title: "Boundary Dispute: Sharma vs. Municipal Corp",
    category: "Civil",
    court: "High Court, Delhi",
    clientName: "Rakesh Sharma",
    clientImage: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    status: "Evidence",
    nextHearing: "10 Feb, 2026",
    statusColor: "#3B82F6",
  },
  {
    id: 2,
    caseId: "CRI-2025-089",
    title: "State vs. Malhotra (302 IPC)",
    category: "Criminal",
    court: "Trial Court, Rohini",
    clientName: "Vivek Malhotra",
    clientImage: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    status: "Cross-Examination",
    nextHearing: "20 Feb, 2026",
    statusColor: "#EF4444",
  },
  {
    id: 3,
    caseId: "CIV-2025-012",
    title: "Recovery Suite: Zenith vs. Axis Bank",
    category: "Civil",
    court: "District Court, Noida",
    clientName: "Sunil Gupta (Zenith Ltd)",
    clientImage: "https://i.pravatar.cc/150?u=a042581f4e29026704e",
    status: "Arguments",
    nextHearing: "02 Mar, 2026",
    statusColor: "#3B82F6",
  },
  {
    id: 4,
    caseId: "CRI-2026-003",
    title: "NCB vs. Sameer Khan (NDPS Act)",
    category: "Criminal",
    court: "High Court, Mumbai",
    clientName: "Sameer Khan",
    clientImage: "https://i.pravatar.cc/150?u=a042581f4e29026704f",
    status: "Bail Hearing",
    nextHearing: "25 Feb, 2026",
    statusColor: "#EF4444",
  }
];

const StatCard = ({ title, value, icon, color, onPress }: { title: string; value: string | number; icon: any; color: string; onPress?: () => void }) => {
  const { colors, theme } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.statCard, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF' }]}
    >
      <View style={[styles.statIconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cases, setCases] = useState(INITIAL_CASES);
  const [activeFilter, setActiveFilter] = useState<'all' | 'hearings'>('all');

  const todayStr = "10 Feb, 2026";
  const activeCases = cases.filter(c => c.status !== "Closed");
  const hearingsToday = activeCases.filter(c => c.nextHearing === todayStr);

  const filteredCases = activeCases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseId.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'hearings') {
      return matchesSearch && c.nextHearing === todayStr;
    }
    return matchesSearch;
  });

  const handleCloseCase = async (id: number) => {
    Alert.alert(
      "Close Case",
      "Are you sure you want to mark this case as closed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Close Case", 
          style: "destructive",
          onPress: async () => {
             try {
               await closeCase(id.toString());
               fetchData();
             } catch (error) {
               console.error(error);
               Alert.alert("Error", "Failed to close the case");
             }
          }
        }
      ]
    );
  };

  const [userProfile, setUserProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [uploadingProfile, setUploadingProfile] = useState(false);

  const handleUpdateProfileImage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Camera access is needed to change your profile picture.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setUploadingProfile(true);
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          name: `profile_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any;

        // 1. Upload the image
        const uploadRes = await uploadDocument(file, "profile-temp", "selfie");
        
        // 2. Update user profile with new selfie_url
        await updateProfile({ selfie_url: uploadRes.filename });
        
        // 3. Refresh data
        await fetchData();
        Alert.alert("Success", "Profile picture updated successfully!");
      }
    } catch (error) {
      console.error("Profile Update Error:", error);
      Alert.alert("Error", "Failed to update profile picture.");
    } finally {
      setUploadingProfile(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [casesData, profileData] = await Promise.all([
        getCases(),
        getProfile()
      ]);
      setCases(casesData);
      setUserProfile(profileData);
    } catch (err) {
      console.error("Dashboard: Error fetching data", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme === 'dark' ? '#000000' : '#F2F5F8' }]}>
      {/* Background color tweaked for card contrast */}

      <FlatList
        data={filteredCases}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onRefresh={fetchData}
        refreshing={refreshing}
        ListHeaderComponent={() => (
          <>
            <HeaderSection
              lawyerName={userProfile?.name?.split(' ')[0] || "User"}
              isProfileOpen={showProfile}
              onProfilePress={() => setShowProfile((v) => !v)}
              selfieUrl={userProfile?.selfie_url}
            />

            {/* PRO SEARCH - Floating Style */}
            <View style={[
              styles.searchContainer,
              {
                backgroundColor: theme === 'dark' ? colors.surface : "#FFFFFF",
                borderColor: theme === 'dark' ? colors.border : 'transparent',
                shadowColor: "#64748B",
                shadowOpacity: theme === 'dark' ? 0 : 0.08,
              }
            ]}>
              <Ionicons name="search" size={20} color={colors.primary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search matters, clients, or IDs..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* EXECUTIVE STATS */}
            <View style={styles.statsContainer}>
              <StatCard
                title="Active Matters"
                value={activeCases.length}
                icon="briefcase"
                color="#4F46E5"
                onPress={() => setActiveFilter('all')}
              />
              <StatCard
                title="Hearings Today"
                value={String(hearingsToday.length).padStart(2, '0')}
                icon="calendar"
                color="#EF4444"
                onPress={() => setActiveFilter('hearings')}
              />
              <StatCard
                title="Total Clients"
                value={String(new Set(activeCases.map(c => c.clientName)).size).padStart(2, '0')}
                icon="people"
                color="#10B981"
                onPress={() => router.push("/clients")}
              />
            </View>

            {/* HEADER & QUICK ACTION */}
            <View style={styles.listHeader}>
              <View>
                <Text style={[styles.listTitle, { color: colors.text }]}>Cases Overview</Text>
                <Text style={[styles.listSub, { color: colors.textSecondary }]}>Manage your active legal portfolio</Text>
              </View>
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/cases/new")}
              >
                <Ionicons name="add" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </>
        )}
        renderItem={({ item }: { item: any }) => (
          <View style={[styles.cardContainer, {
            marginBottom: 16,
            shadowColor: theme === 'dark' ? '#000' : '#94A3B8',
            shadowOpacity: theme === 'dark' ? 0.3 : 0.08,
          }]}>
            <SwipeableRow
              onCloseCase={() => handleCloseCase(item.id)}
            >
              <Pressable
                style={[
                  styles.card,
                  {
                    backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                  }
                ]}
                onPress={() => router.push({
                  pathname: "/cases/summary",
                  params: { id: item.id }
                })}
              >
                <View style={styles.rowContent}>

                  {/* PHOTO & LEFT */}
                  <View style={styles.leftSection}>
                    <TouchableOpacity onPress={() => setSelectedImage(item.clientImage)}>
                      {item.clientImage ? (
                        <Image source={{ uri: item.clientImage }} style={styles.clientAvatar} />
                      ) : (
                        <View style={[styles.clientAvatar, { backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }]}>
                          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>
                            {item.clientName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || "?"}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <View style={styles.mainInfo}>
                      {/* Title First for better hierarchy */}
                      <Text style={[styles.caseTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.title}
                      </Text>

                      <View style={styles.subInfoRow}>
                        {/* Type Badge */}
                        <View style={[styles.categoryBadge, { backgroundColor: item.category === 'Criminal' ? '#FEF2F2' : '#F0F9FF', borderColor: item.category === 'Criminal' ? '#FECACA' : '#BAE6FD' }]}>
                          <Text style={[styles.categoryBadgeText, { color: item.category === 'Criminal' ? '#DC2626' : '#0369A1' }]}>
                            {item.category ? item.category.toUpperCase() : 'UNKNOWN'}
                          </Text>
                        </View>
                        {/* Case ID Badge */}
                        <View style={[styles.idTag, { backgroundColor: theme === 'dark' ? '#0F172A' : '#F1F5F9' }]}>
                          <Text style={[styles.idText, { color: colors.textSecondary }]}>{item.caseId}</Text>
                        </View>
                      </View>

                      <Text style={[styles.clientText, { color: colors.textSecondary, marginTop: 4 }]}>
                        {item.clientName}
                      </Text>

                      {/* Location / Court */}
                      <View style={styles.locationRow}>
                        <Ionicons name="location-sharp" size={10} color={colors.textSecondary} style={{ marginRight: 2, marginTop: 1 }} />
                        <Text style={[styles.courtText, { color: colors.textSecondary }]}>{item.court}</Text>
                      </View>

                    </View>
                  </View>

                  {/* RIGHT / META */}
                  <View style={styles.metaInfo}>
                    <View style={styles.statusGroup}>
                      <View style={[styles.statusBadge, { backgroundColor: item.statusColor + '10', borderColor: item.statusColor + '30' }]}>
                        <View style={[styles.statusDot, { backgroundColor: item.statusColor }]} />
                        <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
                      </View>
                    </View>

                    <View style={styles.hearingGroup}>
                      <Text style={[styles.hearingLabel, { color: colors.textSecondary }]}>NEXT HEARING</Text>
                      <View style={styles.dateRow}>
                        <Ionicons name="calendar" size={12} color="#EF4444" />
                        <Text style={[styles.dateText, { color: colors.text }]}>{item.nextHearing}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            </SwipeableRow>
          </View>
        )}
      />

      {/* 🔥 RIGHT SIDEBAR */}
      <ProfileSidebar
        visible={showProfile}
        profile={userProfile}
        onClose={() => setShowProfile(false)}
        onUploadImage={handleUpdateProfileImage}
        uploading={uploadingProfile}
        onPersonalDetails={() => {
          setShowProfile(false);
          router.push("/profile/personal-details");
        }}
        onLogout={async () => {
          setShowProfile(false);
          await AsyncStorage.removeItem("userToken");
          router.replace("/auth/login");
        }}
      />

      {/* IMAGE MODAL */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
        >
          <View style={styles.modalContent}>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="cover" />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: 20, // Slightly reduced padding
    paddingBottom: 140,
  },
  searchContainer: {
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,  // Rounded
    paddingHorizontal: 16,
    height: 50,        // Taller
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 12,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  listSub: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    opacity: 0.7,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  listContainer: {
    gap: 16, // Spacing between cards
  },

  /* CARD STYLES */
  cardContainer: {
    borderRadius: 20, // More rounded
    shadowOffset: { width: 0, height: 8 }, // Deeper shadow
    shadowRadius: 16,
    elevation: 6,
    backgroundColor: 'transparent',
  },
  card: {
    padding: 18, // More padding
    borderRadius: 20,
    borderWidth: 1, // Subtle border
    borderColor: 'rgba(255,255,255,0.1)', // Especially for dark mode
  },
  rowContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Keep centered for vertical balance
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  clientAvatar: {
    width: 64, // Even larger
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  mainInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 4, // Use gap for consistent spacing
  },

  /* TYPOGRAPHY hierarchy */
  caseTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
    lineHeight: 22, // Better line height
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', // Prevent overflow
    gap: 6, // Use gap instead of margin
  },
  idTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  idText: {
    fontSize: 11,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  dotSeparator: {
    fontSize: 10,
    marginHorizontal: 0, // Handled by gap
    display: 'none', // Remove dot, use spacing/badges instead
  },
  clientText: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.9,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  courtText: {
    fontSize: 13,
    fontWeight: "500",
    opacity: 0.7,
  },

  /* RIGHT SIDE */
  metaInfo: {
    alignItems: "flex-end",
    justifyContent: 'space-between',
    height: 70,
    paddingVertical: 4,
  },
  statusGroup: {
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: 'uppercase',
  },
  hearingGroup: {
    alignItems: 'flex-end',
    gap: 2,
  },
  hearingLabel: {
    fontSize: 8,
    fontWeight: '800',
    opacity: 0.5,
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "700",
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 300,
    height: 300,
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  fullImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
});
