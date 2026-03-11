import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
} from "react-native";
import { deleteUserAccount, getAllUsers, getFileUrl, updateUserStatus, createUserAdmin } from "../../api";
import { useTheme } from "../context/ThemeContext";

function UserCard({ item, processingId, onUpdateStatus, onUpdateRole, onDelete, colors, theme }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isProcessing = processingId === item.id;

  return (
    <View style={[styles.card, { backgroundColor: theme === "dark" ? "#0F2742" : "#FFFFFF", borderColor: colors.border }]}>
      <Pressable 
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.cardHeader}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          {item.selfie_url ? (
            <Image 
              source={{ uri: getFileUrl(item.selfie_url) }} 
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#E2E8F0' }} 
            />
          ) : (
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '10', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.name, { color: colors.text, marginBottom: 0 }]}>{item.name}</Text>
              {item.role === 'admin' && <Ionicons name="shield-checkmark" size={14} color={colors.primary} />}
            </View>
            <Text style={[styles.email, { color: colors.textSecondary }]}>{item.email} • {item.phone}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'approved' ? '#10B98120' : '#F59E0B20' }]}>
            <Text style={[styles.statusText, { color: item.status === 'approved' ? '#10B981' : '#F59E0B' }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
        </View>
      </Pressable>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator color="#1D4ED8" />
        </View>
      )}

      {isExpanded && (
        <View style={{ marginTop: 16 }}>
          <View style={[styles.divider, { backgroundColor: colors.border, marginTop: 0 }]} />
          
          {/* Professional Stats */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={[styles.statBox, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
              <Text style={{ fontSize: 10, color: colors.textSecondary, marginBottom: 4 }}>Total Cases</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>{item.total_cases || 0}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
              <Text style={{ fontSize: 10, color: colors.textSecondary, marginBottom: 4 }}>Total Earnings</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#10B981' }}>₹{item.total_earnings?.toLocaleString() || 0}</Text>
            </View>
          </View>

          {item.documents && item.documents.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Verification Documents</Text>
              {item.documents.map((doc: any, i: number) => {
                const docLabels: any = {
                  'selfie': 'Live Verification Selfie',
                  'sanad': 'Bar Enrollment (Sanad)',
                  'id_card': 'Bar ID Card',
                  'cop': 'Certificate of Practice',
                  'llb': 'LLB Degree',
                  'aibe': 'AIBE Result',
                  'firm': 'Firm Registration',
                  'ecourts': 'Court Records'
                };
                const label = docLabels[doc.doc_type] || doc.doc_type || 'Document';
                
                return (
                  <Pressable 
                    key={i} 
                    onPress={() => Linking.openURL(getFileUrl(doc.filename))} 
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC', padding: 10, borderRadius: 10 }}
                  >
                    <Ionicons name="document-text" size={18} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>{label}</Text>
                      <Text style={{ fontSize: 10, color: colors.textSecondary }} numberOfLines={1}>{doc.original_name}</Text>
                    </View>
                    <Ionicons name="eye-outline" size={18} color={colors.primary} />
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.actions}>
            {item.status !== "approved" && (
              <>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, styles.approveBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => onUpdateStatus(item, "approved")}
                  disabled={isProcessing}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.actionText}>Approve</Text>
                </Pressable>
                
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, styles.rejectBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => onUpdateStatus(item, "rejected")}
                  disabled={isProcessing}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.actionText}>Reject</Text>
                </Pressable>
              </>
            )}

            {item.status === "approved" && item.role !== "admin" && (
              <Pressable
                style={({ pressed }) => [styles.actionBtn, styles.adminBtn, pressed && { opacity: 0.8 }]}
                onPress={() => onUpdateRole(item, "admin")}
                disabled={isProcessing}
              >
                <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
                <Text style={styles.actionText}>Make Admin</Text>
              </Pressable>
            )}

            {item.status === "approved" && item.role === "admin" && (
              <Pressable
                style={({ pressed }) => [styles.actionBtn, styles.clientBtn, pressed && { opacity: 0.8 }]}
                onPress={() => onUpdateRole(item, "client")}
                disabled={isProcessing}
              >
                <Ionicons name="person-outline" size={16} color="#FFFFFF" />
                <Text style={styles.actionText}>Make Client</Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [styles.actionBtn, styles.deleteBtn, pressed && { opacity: 0.8 }]}
              onPress={() => onDelete(item.id, item.name)}
              disabled={isProcessing}
            >
              <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
              <Text style={styles.actionText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

export default function UserManagement() {
  const router = useRouter();
  const { colors, theme } = useTheme();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [searchQuery, setSearchQuery] = useState("");

  // Add User State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', role: 'client' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (user: any, newRole: string) => {
    try {
      setProcessingId(user.id);
      await updateUserStatus(user.id, user.status, newRole);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
    } catch (e) {
      Alert.alert("Error", "Failed to update role");
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateStatus = async (user: any, newStatus: string) => {
    try {
      setProcessingId(user.id);
      await updateUserStatus(user.id, newStatus, user.role);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
    } catch (e) {
      Alert.alert("Error", "Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete User", `Are you sure you want to delete ${name}? This action cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setProcessingId(id);
            await deleteUserAccount(id);
            setUsers((prev) => prev.filter((u) => u.id !== id));
          } catch (e) {
            Alert.alert("Error", "Could not delete user.");
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  };

  const handleAddUser = async () => {
    if (!addForm.name || !addForm.email || !addForm.phone) {
      Alert.alert("Error", "Required fields: Name, Email, Phone.");
      return;
    }
    try {
      setIsAdding(true);
      const newUser = await createUserAdmin({ ...addForm, status: 'approved' });
      setUsers([newUser, ...users]);
      setShowAddModal(false);
      setAddForm({ name: '', email: '', phone: '', role: 'client' });
      setActiveTab('approved'); // Because added user is instantly approved
    } catch (e: any) {
      Alert.alert("Error", typeof e === 'string' ? e : "Could not add user.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>User Management</Text>
        </View>
        <Pressable 
          onPress={() => setShowAddModal(true)} 
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 }}
        >
          <Ionicons name="add" size={16} color="#FFF" />
          <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>New User</Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10 }}>
        {(() => {
          const pendingCount = users.filter(u => u.status !== 'approved').length;
          const activeCount = users.filter(u => u.status === 'approved').length;
          
          return (
            <>
              <Pressable 
                style={{ flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: activeTab === 'pending' ? colors.primary : 'transparent', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                onPress={() => setActiveTab('pending')}
              >
                <Text style={{ fontWeight: '600', color: activeTab === 'pending' ? colors.primary : colors.textSecondary }}>Requests</Text>
                {pendingCount > 0 && (
                  <View style={{ backgroundColor: activeTab === 'pending' ? colors.primary : colors.textSecondary + '40', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>{pendingCount}</Text>
                  </View>
                )}
              </Pressable>
              <Pressable 
                style={{ flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: activeTab === 'approved' ? colors.primary : 'transparent', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                onPress={() => setActiveTab('approved')}
              >
                <Text style={{ fontWeight: '600', color: activeTab === 'approved' ? colors.primary : colors.textSecondary }}>Active Users</Text>
                <View style={{ backgroundColor: activeTab === 'approved' ? colors.primary + '20' : 'transparent', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                  <Text style={{ color: activeTab === 'approved' ? colors.primary : colors.textSecondary, fontSize: 10, fontWeight: '800' }}>{activeCount}</Text>
                </View>
              </Pressable>
            </>
          );
        })()}
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <View style={[styles.searchContainer, { backgroundColor: theme === 'dark' ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={`Search ${activeTab} users...`}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* List */}
      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#1D4ED8" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={users.filter(u => {
              const matchesTab = activeTab === 'pending' ? u.status !== 'approved' : u.status === 'approved';
              const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                   u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                   u.phone.includes(searchQuery);
              return matchesTab && matchesSearch;
            })}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <UserCard 
                item={item} 
                processingId={processingId}
                onUpdateStatus={handleUpdateStatus}
                onUpdateRole={handleUpdateRole}
                onDelete={handleDelete}
                colors={colors}
                theme={theme}
              />
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No users found.</Text>
            }
          />
        )}
      </View>

      {/* Add User Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme === 'dark' ? '#0F2742' : '#FFF', borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New User</Text>
            
            <TextInput
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={addForm.name}
              onChangeText={(txt) => setAddForm(prev => ({ ...prev, name: txt }))}
            />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={addForm.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(txt) => setAddForm(prev => ({ ...prev, email: txt }))}
            />
            <TextInput
              placeholder="Phone Number (ex: 1231231234)"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={addForm.phone}
              keyboardType="phone-pad"
              onChangeText={(txt) => setAddForm(prev => ({ ...prev, phone: txt }))}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 20 }}>
              <Pressable 
                onPress={() => setAddForm(prev => ({ ...prev, role: 'client' }))}
                style={[styles.roleSelectBtn, addForm.role === 'client' && styles.roleSelectBtnActive]}
              >
                <Text style={[styles.roleSelectText, addForm.role === 'client' && styles.roleSelectTextActive]}>Client</Text>
              </Pressable>
              <Pressable 
                onPress={() => setAddForm(prev => ({ ...prev, role: 'admin' }))}
                style={[styles.roleSelectBtn, addForm.role === 'admin' && styles.roleSelectBtnActive]}
              >
                <Text style={[styles.roleSelectText, addForm.role === 'admin' && styles.roleSelectTextActive]}>Admin</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <Pressable 
                onPress={() => setShowAddModal(false)}
                style={[styles.modalBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border }]}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={handleAddUser}
                disabled={isAdding}
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              >
                {isAdding ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: '600' }}>Save User</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginTop: 16,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  approveBtn: {
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#F59E0B',
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
  },
  adminBtn: {
    backgroundColor: '#8B5CF6',
  },
  clientBtn: {
    backgroundColor: '#64748B',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  roleSelectBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#64748B',
    alignItems: 'center',
  },
  roleSelectBtnActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  roleSelectText: {
    color: '#64748B',
    fontWeight: '600',
  },
  roleSelectTextActive: {
    color: '#FFF',
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
  },
});
