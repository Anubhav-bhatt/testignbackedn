import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getCases } from "../../api";
import CaseFullCard from "../../components/CaseFullCard";
import { useTheme } from "../context/ThemeContext";

const CATEGORIES = ["Civil", "Criminal", "Closed"];

export default function AllCasesScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [casesList, setCasesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Civil");

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await getCases();
      setCasesList(data);
    } catch (err) {
      console.error("Error fetching cases", err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCases();
    }, [fetchCases])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCases();
  };

  const filteredCases = useMemo(() => {
    return casesList.filter((c) => {
      const title = c.title || "";
      const clientName = c.clientName || "";
      const caseId = c.caseId || "";
      const category = c.category || "";

      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseId.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedCategory === "Closed") {
        return matchesSearch && c.status === "Closed";
      }

      const matchesCategory =
        category.toLowerCase().includes(selectedCategory.toLowerCase());

      const isActive = c.status !== "Closed";

      return matchesSearch && matchesCategory && isActive;
    });
  }, [casesList, searchQuery, selectedCategory]);

  const renderHeader = () => (
    <View style={styles.topSection}>
      <View style={styles.heroHeader}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Case Vault</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {casesList.length} total matters archived
          </Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.primary + '15' }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <View style={[styles.searchWrapper, { backgroundColor: theme === 'dark' ? colors.surface : '#FFF', borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          placeholder="Search laws, clients, or case IDs..."
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categoriesList}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedCategory(item)}
            style={[
              styles.categoryChip,
              { backgroundColor: theme === 'dark' ? colors.surface : '#FFF', borderColor: colors.border },
              selectedCategory === item && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
          >
            <Text style={[
              styles.categoryText,
              { color: colors.textSecondary },
              selectedCategory === item && { color: '#FFF' }
            ]}>
              {item}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Accessing Secure Vault...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCases}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyVault}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name="folder-open-outline" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Vault Empty</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>No cases match your current filter settings.</Text>
              <Pressable
                style={[styles.resetBtn, { backgroundColor: colors.primary }]}
                onPress={() => { setSearchQuery(""); setSelectedCategory("Civil"); }}
              >
                <Text style={styles.resetBtnText}>Clear All Filters</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <CaseFullCard
              caseItem={{
                id: item.id,
                title: item.title,
                client: item.clientName,
                clientImage: item.clientImage,
                caseDate: item.caseId || "N/A",
                category: item.category,
                court: item.court,
                stage: item.status || "In Progress",
                courtRoom: item.court || "Bench TBD",
                nextHearing: item.nextHearing || "TBD",
                documentCount: item.documentCount,
                moneyPending: (item.pendingAmount || 0).toLocaleString(),
                moneyReceived: (item.totalPaid || 0).toLocaleString(),
              }}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  topSection: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  headerSub: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.8,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  categoriesList: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: 150,
  },
  emptyVault: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  resetBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  resetBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  }
});
