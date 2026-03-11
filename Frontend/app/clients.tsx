import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getCases, getFileUrl, getProfile } from "../api";
import { useTheme } from "./context/ThemeContext";

export default function ClientsScreen() {
  const { colors, theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [casesData, profileData] = await Promise.all([
          getCases(),
          getProfile()
        ]);
        
        setUserProfile(profileData);
        
        // Map cases to clients
        const mappedClients = casesData.map((c: any) => ({
          id: c.id,
          name: c.clientName,
          image: c.clientImage,
          matter: `${c.category}: ${c.title}`,
          hearing: c.nextHearing,
          status: c.status,
          initials: c.clientName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2),
        }));
        setClients(mappedClients);
      } catch (err) {
        console.log("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.matter.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Client Directory</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Managed legal relations</Text>
        </View>
        <View style={styles.headerRight}>
          {userProfile?.selfie_url ? (
            <Image 
              source={{ uri: getFileUrl(userProfile.selfie_url) }} 
              style={styles.userAvatar} 
            />
          ) : (
            <Ionicons name="people-circle" size={40} color={colors.primary} />
          )}
        </View>
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme === 'dark' ? colors.surface : '#FFF', borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          placeholder="Search by name or matter..."
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF', borderColor: colors.border }]}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.clientImage} />
                ) : (
                  <Text style={[styles.avatarText, { color: colors.primary }]}>{item.initials}</Text>
                )}
              </View>

              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: item.status === 'Cross-Examination' ? '#FEF2F2' : '#F0FDF4' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'Cross-Examination' ? '#EF4444' : '#10B981' }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={[styles.matterText, { color: colors.textSecondary }]}>{item.matter}</Text>

                <View style={styles.footer}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.hearingText, { color: colors.textSecondary }]}>Hearing: {item.hearing}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    marginBottom: 20,
    marginTop: 10,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600' },
  headerRight: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  clientImage: {
    width: 56,
    height: 56,
    borderRadius: 18,
  },
  listContent: { padding: 24, paddingBottom: 140 },
  card: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800' },
  info: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 17, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  matterText: { fontSize: 13, fontWeight: '500', opacity: 0.8 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  hearingText: { fontSize: 12, fontWeight: '600', opacity: 0.6 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
