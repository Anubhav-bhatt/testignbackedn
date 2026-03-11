import {
  Alert,
  FlatList,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Calendar } from "react-native-calendars";
import {
  closeCase,
  createNote,
  createPayment,
  deleteDocument,
  deleteNote,
  deletePayment,
  getCaseById,
  getDocuments,
  getFileUrl,
  getNotes,
  getPayments,
  updateCaseDeal,
  updateHearingDate,
  uploadDocument
} from "../../api";
import AIAssistantCard from "../../components/AIAssistantCard";
import { useTheme } from "../context/ThemeContext";

export default function CaseDetailsScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();

  const { id: caseIdParam, title, client, hearingDate } =
    useLocalSearchParams<{
      id?: string;
      title?: string;
      client?: string;
      hearingDate?: string;
    }>();

  const [newHearingDate, setNewHearingDate] = useState("");
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [isUpdatingHearing, setIsUpdatingHearing] = useState(false);

  const [caseData, setCaseData] = useState<any>(null);
  const [loadingCase, setLoadingCase] = useState(true);

  // Documents State
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSizes, setUploadSizes] = useState({ loaded: 0, total: 0 });
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  // Notes State
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Payments State
  const [payments, setPayments] = useState<any[]>([]);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [dealAmount, setDealAmount] = useState("");
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentDesc, setNewPaymentDesc] = useState("");

  // Scroll Support
  const scrollRef = useRef<ScrollView>(null);
  const [timelineY, setTimelineY] = useState(0);

  const scrollToTimeline = () => {
    if (scrollRef.current && timelineY > 0) {
      scrollRef.current.scrollTo({ y: timelineY - 10, animated: true });
    } else {
      Alert.alert("Timeline", "Scroll down to view detailed case activity.");
    }
  };

  useEffect(() => {
    if (caseIdParam) {
      fetchCaseDetails();
      fetchDocuments();
      fetchNotes();
      fetchPayments();
    }
  }, [caseIdParam]);

  const fetchCaseDetails = async () => {
    try {
      setLoadingCase(true);
      const data = await getCaseById(caseIdParam || "default");
      setCaseData(data);
    } catch (e) {
      console.log("Error fetching case details", e);
    } finally {
      setLoadingCase(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const data = await getPayments(caseIdParam || "default");
      setPayments(data);
    } catch (e) {
      console.log("Error fetching payments", e);
    }
  };

  const fetchDocuments = async () => {
    try {
      const docs = await getDocuments(caseIdParam || "default");
      setDocuments(docs);
    } catch (e) {
      console.log("Error fetching documents", e);
    }
  };

  const fetchNotes = async () => {
    try {
      const n = await getNotes(caseIdParam || "default");
      setNotes(n);
    } catch (e) {
      console.log("Error fetching notes", e);
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocumentToDelete(id);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;
    try {
      await deleteDocument(documentToDelete);
      fetchDocuments(); // refresh list
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert("Could not remove the document.");
      } else {
        Alert.alert("Error", "Could not remove the document.");
      }
    } finally {
      setShowDeleteConfirmModal(false);
      setDocumentToDelete(null);
    }
  };

  const handleDocumentUpload = async (fileType: string = "*/*") => {
    let interval: any = null;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: fileType,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const totalSize = file.size || 5 * 1024 * 1024; // Default 5MB if unknown

      setIsUploading(true);
      setUploadProgress(0);
      setUploadSizes({ loaded: 0, total: totalSize });

      // Simulated progress for better UX
      interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          const newProgress = prev + 10;
          const newLoaded = Math.floor((newProgress / 100) * totalSize);
          setUploadSizes({ loaded: newLoaded, total: totalSize });
          return newProgress;
        });
      }, 200);

      await uploadDocument(
        file,
        caseIdParam || "default",
        undefined, // docType
        (progress, loaded, total) => {
          setUploadProgress(prev => Math.max(prev, progress));
          setUploadSizes({ loaded, total: total || totalSize });
        }
      );

      if (interval) clearInterval(interval);
      setUploadProgress(100);
      setUploadSizes({ loaded: totalSize, total: totalSize });

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadSizes({ loaded: 0, total: 0 });
        Alert.alert("Success", "Document uploaded successfully!");
        fetchDocuments();
      }, 500);

    } catch (error) {
      if (interval) clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadSizes({ loaded: 0, total: 0 });
      Alert.alert("Error", "Failed to upload document");
      console.error(error);
    }
  };

  const handleAddPayment = async (status: 'Paid' | 'Pending') => {
    if (!newPaymentAmount.trim()) {
      Alert.alert("Error", "Please enter an amount");
      return;
    }

    try {
      setIsAddingPayment(true);
      await createPayment({
        amount: parseFloat(newPaymentAmount),
        status,
        description: newPaymentDesc,
        caseId: caseIdParam || "default"
      });
      setNewPaymentAmount("");
      setNewPaymentDesc("");
      fetchPayments();
      Alert.alert("Success", "Payment details added");
    } catch (error) {
      Alert.alert("Error", "Failed to add payment");
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleUpdateDeal = async () => {
    if (!dealAmount || isNaN(parseFloat(dealAmount))) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    try {
      await updateCaseDeal(caseIdParam as string, parseFloat(dealAmount));
      fetchCaseDetails();
      setShowDealModal(false);
      setDealAmount("");
      Alert.alert("Success", "Fixed Deal Updated");
    } catch (err) {
      Alert.alert("Error", "Could not update deal");
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      await deletePayment(id);
      fetchPayments();
    } catch (error) {
      Alert.alert("Error", "Failed to delete payment");
    }
  };

  // ... (notes handlers unchanged) ...

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setIsAddingNote(true);
      await createNote(newNote, caseIdParam || "default");
      setNewNote("");
      fetchNotes();
    } catch (error) {
      Alert.alert("Error", "Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  /* Close Case Handler */
  const [showCloseModal, setShowCloseModal] = useState(false);

  const handleCloseCase = () => {
    setShowCloseModal(true);
  };

  const confirmCloseCase = async () => {
    try {
      await closeCase(caseIdParam || "default");
      setShowCloseModal(false);
      // Navigate to dashboard after closing
      router.replace("/dashboard");
    } catch (e) {
      setShowCloseModal(false);
      if (Platform.OS === 'web') {
        alert("Error: Could not close case");
      } else {
        Alert.alert("Error", "Could not close case");
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      fetchNotes();
    } catch (error) {
      Alert.alert("Error", "Failed to delete note");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // SAFE DATE PARSING for Timeline
  const parseSafeDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    // Fallback for "DD Mon, YYYY" (e.g., "15 Feb, 2026")
    try {
      const parts = dateStr.replace(',', '').split(' ');
      if (parts.length >= 3) {
        const months: { [key: string]: number } = {
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };
        const day = parseInt(parts[0]);
        const month = months[parts[1].substring(0, 3)];
        const year = parseInt(parts[2]);
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
    } catch (e) { }
    return new Date(NaN);
  };

  const handleUpdateHearing = async (date: string) => {
    try {
      setIsUpdatingHearing(true);
      await updateHearingDate(caseIdParam || "default", date);
      setShowHearingModal(false);
      fetchCaseDetails(); // Refresh UI
      Alert.alert("Success", "Hearing rescheduled to " + date);
    } catch (error) {
      Alert.alert("Error", "Failed to update hearing date");
    } finally {
      setIsUpdatingHearing(false);
    }
  };

  // TIMELINE GENERATION
  const timelineEvents = [
    ...(caseData?.hearings || []).map((h: any) => ({
      id: 'hearing-' + h.id,
      date: parseSafeDate(h.date),
      title: `${h.status} Hearing`,
      description: h.purpose,
      type: 'hearing',
      status: h.status,
      documents: h.documents || []
    })),
    ...documents.map(d => ({
      id: 'doc-' + d.id,
      date: new Date(d.createdAt),
      title: 'Document Uploaded',
      description: d.originalName,
      type: 'document'
    })),
    ...notes.map(n => ({
      id: 'note-' + n.id,
      date: new Date(n.createdAt),
      title: 'Note Added',
      description: n.content,
      type: 'note'
    })),
    ...payments.map(p => ({
      id: 'pay-' + p.id,
      date: new Date(p.date),
      title: `Payment ${p.status}`,
      description: `${p.description ? p.description + ': ' : ''}$${p.amount}`,
      type: 'payment'
    }))
  ]
    .filter(event => !isNaN(event.date.getTime()))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* ... (rest of the UI unchanged until Modal) ... */}
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
            { backgroundColor: theme === 'dark' ? colors.surface : 'transparent' }
          ]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER CARD */}
        <View style={[styles.headerCard, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF', shadowColor: theme === 'dark' ? "#000" : undefined }]}>
          <View style={[styles.caseTypePill, { backgroundColor: theme === "dark" ? colors.primary + "20" : "#EEF2FF" }]}>
            <Ionicons
              name="briefcase-outline"
              size={14}
              color={colors.primary}
            />
            <Text style={[styles.caseTypeText, { color: colors.primary }]}>
              {caseData?.category?.toUpperCase() || "LEGAL CASE"}
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {caseData?.title ?? title ?? "Loading Case..."}
          </Text>

          <View style={styles.clientRow}>
            <Ionicons
              name="person-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.clientText, { color: colors.textSecondary }]}>
              {caseData?.clientName ?? client ?? "Loading..."}
            </Text>
          </View>

          {caseData?.caseId && (
            <View style={[styles.caseIdBadge, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.caseIdText, { color: colors.primary }]}>{caseData.caseId}</Text>
            </View>
          )}
        </View>


        {/* NEXT HEARING */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Next Hearing</Text>
            <TouchableOpacity onPress={() => setShowHearingModal(true)}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.hearingCard, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF', borderLeftColor: colors.danger, shadowColor: theme === 'dark' ? "#000" : undefined }]}>
            <Ionicons
              name="calendar-outline"
              size={22}
              color={colors.danger}
            />
            <View>
              <Text style={[styles.hearingDate, { color: colors.danger }]}>
                {caseData?.nextHearing ?? hearingDate ?? "Not scheduled"}
              </Text>
              <Text style={[styles.hearingSub, { color: colors.textSecondary }]}>
                {caseData?.court || "Jurisdiction Pending"}
              </Text>
            </View>
          </View>
        </View>

        {/* FINANCIAL DEAL BREAKER */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Financial Deal Status</Text>
            <TouchableOpacity onPress={() => setShowDealModal(true)}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Fix Money</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.dealCard, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF' }]}>
            <View style={styles.dealRow}>
              <View style={styles.dealStat}>
                <Text style={[styles.dealLabel, { color: colors.textSecondary }]}>FIXED DEAL</Text>
                <Text style={[styles.dealValue, { color: colors.text }]}>₹{caseData?.totalFixedAmount?.toLocaleString() || '---'}</Text>
              </View>
              <View style={[styles.dealDivider, { backgroundColor: colors.border }]} />
              <View style={styles.dealStat}>
                <Text style={[styles.dealLabel, { color: colors.textSecondary }]}>PAID</Text>
                <Text style={[styles.dealValue, { color: colors.success }]}>₹{caseData?.totalPaid?.toLocaleString() || '0'}</Text>
              </View>
              <View style={[styles.dealDivider, { backgroundColor: colors.border }]} />
              <View style={styles.dealStat}>
                <Text style={[styles.dealLabel, { color: colors.textSecondary }]}>PENDING</Text>
                <Text style={[styles.dealValue, { color: colors.danger }]}>₹{caseData?.pendingAmount?.toLocaleString() || '0'}</Text>
              </View>
            </View>

            {/* PROGRESS BAR */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBarBg, { backgroundColor: theme === 'dark' ? colors.background : '#F1F5F9' }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: colors.success,
                      width: `${caseData?.totalFixedAmount ? Math.min((caseData.totalPaid / caseData.totalFixedAmount) * 100, 100) : 0}%`
                    }
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {caseData?.totalFixedAmount
                  ? `${Math.round((caseData.totalPaid / caseData.totalFixedAmount) * 100)}% Recovered`
                  : 'Deal amount not fixed yet'}
              </Text>
            </View>
          </View>
        </View>

        {/* AI INSIGHTS CARD */}
        <View style={styles.section}>
          <AIAssistantCard caseId={caseIdParam || "default"} />
        </View>

        {/* AI SUMMARY */}
        <View style={styles.section}>
          <Pressable
            onPress={() => router.push({
              pathname: "/ai",
              params: {
                caseId: caseIdParam,
                title: caseData?.title || title,
                client: caseData?.clientName || client,
              }
            })}
            style={({ pressed }) => [
              styles.aiCard,
              { backgroundColor: theme === 'dark' ? colors.surface : '#F1F5F9', borderColor: colors.border },
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
            ]}
          >
            <View style={styles.aiHeader}>
              <Ionicons
                name="sparkles"
                size={18}
                color={theme === 'dark' ? "#A78BFA" : "#7C3AED"}
              />
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                AI Case Summary
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
            </View>

            <Text style={[styles.aiText, { color: colors.text, marginTop: 12 }]}>
              {caseData ? `Strategic analysis ready for this ${caseData.category} matter. Tap to view detailed risks and action plans.` : "Loading intelligence summary..."}
            </Text>
          </Pressable>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF', borderColor: colors.border }]}
              onPress={() => setShowDocumentsModal(true)}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.actionText, { color: colors.primary }]}>Documents</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF', borderColor: colors.border }]}
              onPress={scrollToTimeline}
            >
              <Ionicons
                name="time-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.actionText, { color: colors.primary }]}>Timeline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF', borderColor: colors.border }]}
              onPress={() => setShowPaymentsModal(true)}
            >
              <Ionicons
                name="card-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.actionText, { color: colors.primary }]}>Payments</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF', borderColor: colors.border }]}
              onPress={() => setShowNotesModal(true)}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.actionText, { color: colors.primary }]}>Notes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme === 'dark' ? colors.surface : '#FEF2F2', borderColor: '#FECACA' }]}
              onPress={handleCloseCase}
            >
              <Ionicons
                name="archive-outline"
                size={20}
                color={colors.danger}
              />
              <Text style={[styles.actionText, { color: colors.danger }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FINANCIAL OVERVIEW */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Financial Overview</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[styles.actionCard, { flex: 1, backgroundColor: theme === 'dark' ? colors.surface : '#F1F5F9', borderColor: colors.border, padding: 12, alignItems: 'flex-start' }]}>
              <Text style={{ fontSize: 10, color: colors.textSecondary }}>Total Billed</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                ${payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
              </Text>
            </View>
            <View style={[styles.actionCard, { flex: 1, backgroundColor: theme === 'dark' ? colors.surface : '#ECFDF5', borderColor: '#10B981', padding: 12, alignItems: 'flex-start' }]}>
              <Text style={{ fontSize: 10, color: '#059669' }}>Received</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#059669' }}>
                ${payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* TIMELINE SECTION */}
        <View
          style={styles.section}
          onLayout={(e) => setTimelineY(e.nativeEvent.layout.y)}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Activity Timeline</Text>
          <View style={{ marginLeft: 6 }}>
            {timelineEvents.length === 0 ? (
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontStyle: 'italic' }}>No activity recorded yet.</Text>
            ) : (
              timelineEvents.map((event, index) => (
                <View key={event.id} style={{ flexDirection: 'row', gap: 12 }}>
                  {/* Line & Circle */}
                  <View style={{ alignItems: 'center' }}>
                    <View style={{
                      width: 26, height: 26, borderRadius: 13,
                      backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF',
                      borderWidth: 2,
                      borderColor: event.type === 'hearing' ? (event.status === 'Past' ? colors.textSecondary : colors.danger) : colors.primary,
                      alignItems: 'center', justifyContent: 'center',
                      zIndex: 2
                    }}>
                      <Ionicons
                        name={
                          event.type === 'hearing' ? 'calendar' :
                            event.type === 'document' ? 'document-text' :
                              event.type === 'payment' ? 'cash' :
                                'chatbubble-ellipses'
                        }
                        size={12}
                        color={event.type === 'hearing' ? (event.status === 'Past' ? colors.textSecondary : colors.danger) : colors.primary}
                      />
                    </View>
                    {index !== timelineEvents.length - 1 && (
                      <View style={{
                        width: 2, flex: 1,
                        backgroundColor: colors.border,
                        marginVertical: -2
                      }} />
                    )}
                  </View>

                  {/* Content */}
                  <View style={{ flex: 1, paddingBottom: 24 }}>
                    <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: '600', marginBottom: 2 }}>
                      {event.date.toLocaleDateString()} • {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 2 }}>{event.title}</Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary }} numberOfLines={2}>{event.description}</Text>

                    {/* DOCUMENTS ATTACHED TO EVENT */}
                    {event.type === 'hearing' && event.documents?.length > 0 && (
                      <View style={{ marginTop: 10, gap: 8 }}>
                        {event.documents.map((doc: any) => (
                          <View key={doc.id} style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            backgroundColor: theme === 'dark' ? colors.background : '#F8FAFC',
                            padding: 8,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: colors.border
                          }}>
                            <Ionicons name="document-text-outline" size={14} color={colors.primary} />
                            <Text style={{ fontSize: 12, color: colors.text, flex: 1 }} numberOfLines={1}>{doc.originalName}</Text>
                            <TouchableOpacity onPress={() => {
                              const url = getFileUrl(doc.filename);
                              Linking.openURL(url).catch(err => Alert.alert("Error", "Cannot open file"));
                            }}>
                              <Ionicons name="eye-outline" size={16} color={colors.primary} />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* RECENT DOCUMENTS PREVIEW */}
        {documents.length > 0 && (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Recent Documents</Text>
              <TouchableOpacity onPress={() => setShowDocumentsModal(true)}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>See All</Text>
              </TouchableOpacity>
            </View>

            {documents.slice(0, 3).map((doc) => (
              <View key={doc.id} style={[styles.documentItem, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF', marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 } }]}>
                <Ionicons name="document-text" size={24} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.docName, { color: colors.text }]} numberOfLines={1}>{doc.originalName}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 10, color: colors.textSecondary }}>{new Date(doc.createdAt).toLocaleDateString()}</Text>
                    <Text style={{ fontSize: 10, color: colors.textSecondary }}>•</Text>
                    <Text style={{ fontSize: 10, color: colors.textSecondary }}>{doc.size ? formatBytes(doc.size) : 'Unknown size'}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => {
                    const url = getFileUrl(doc.filename);
                    Linking.openURL(url).catch(err => Alert.alert("Error", "Cannot open file"));
                  }}>
                    <Ionicons name="eye-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    const url = getFileUrl(doc.filename);
                    Linking.openURL(url).catch(err => Alert.alert("Error", "Cannot download file"));
                  }}>
                    <Ionicons name="download-outline" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteDocument(doc.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* RECENT NOTES PREVIEW */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Recent Notes</Text>
            <TouchableOpacity onPress={() => setShowNotesModal(true)}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>See All</Text>
            </TouchableOpacity>
          </View>

          {notes.length === 0 ? (
            <View style={[styles.noteItem, { backgroundColor: theme === 'dark' ? colors.surface : '#F1F5F9', padding: 20, alignItems: 'center' }]}>
              <Text style={{ color: colors.textSecondary }}>No notes yet. Tap above to add one.</Text>
            </View>
          ) : (
            notes.slice(0, 2).map((note) => (
              <View key={note.id} style={[styles.noteItem, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF', marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 } }]}>
                <Text style={[styles.noteContent, { color: colors.text, fontSize: 13 }]} numberOfLines={3}>{note.content}</Text>
                <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 4 }}>{new Date(note.createdAt).toLocaleString()}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* DOCUMENTS MODAL - Custom Half Window */}
      <Modal
        visible={showDocumentsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDocumentsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowDocumentsModal(false)}
          />
          <View style={[styles.halfModalContent, { backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Documents</Text>
              <TouchableOpacity onPress={() => setShowDocumentsModal(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {isUploading ? (
                <View style={[styles.progressContainer, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF' }]}>
                  <Text style={[styles.progressText, { color: colors.text }]}>
                    Uploading... {uploadProgress}% ({formatBytes(uploadSizes.loaded)} / {formatBytes(uploadSizes.total)})
                  </Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${uploadProgress}%`, backgroundColor: colors.primary }]} />
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={[styles.uploadButton, { flex: 1, backgroundColor: colors.primary }]}
                    onPress={() => handleDocumentUpload()}
                  >
                    <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
                    <Text style={styles.uploadButtonText}>Upload Document</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.uploadButton, { flex: 1, backgroundColor: '#EC4899' }]}
                    onPress={() => handleDocumentUpload("video/*")}
                  >
                    <Ionicons name="videocam-outline" size={20} color="#FFF" />
                    <Text style={styles.uploadButtonText}>Upload Video</Text>
                  </TouchableOpacity>
                </View>
              )}

              <FlatList
                data={documents}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ marginTop: 20, paddingBottom: 40 }}
                renderItem={({ item }) => (
                  <View style={[styles.documentItem, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF' }]}>
                    <Ionicons name="document-text" size={24} color={colors.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.docName, { color: colors.text }]} numberOfLines={1}>{item.originalName}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 10, color: colors.textSecondary }}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                        <Text style={{ fontSize: 10, color: colors.textSecondary }}>•</Text>
                        <Text style={{ fontSize: 10, color: colors.textSecondary }}>{item.size ? formatBytes(item.size) : 'Unknown size'}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      {/* Preview / View */}
                      <TouchableOpacity onPress={() => {
                        const url = getFileUrl(item.filename);
                        Linking.openURL(url).catch(err => Alert.alert("Error", "Cannot open file"));
                      }}>
                        <Ionicons name="eye-outline" size={22} color={colors.primary} />
                      </TouchableOpacity>

                      {/* Download */}
                      <TouchableOpacity onPress={() => {
                        const url = getFileUrl(item.filename);
                        Linking.openURL(url).catch(err => Alert.alert("Error", "Cannot download file"));
                      }}>
                        <Ionicons name="download-outline" size={22} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteDocument(item.id)}>
                        <Ionicons name="trash-outline" size={22} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textSecondary }}>No documents uploaded yet.</Text>
                }
              />
            </View>
          </View>
        </View>
      </Modal>


      {/* HEARING DATE MODAL */}
      <Modal
        visible={showHearingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHearingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFF', margin: 20, borderRadius: 20, padding: 10 }]}>
            <Calendar
              onDayPress={(day: any) => handleUpdateHearing(day.dateString)}
              markedDates={(() => {
                const d = parseSafeDate(caseData?.nextHearing || "");
                if (!isNaN(d.getTime())) {
                  return { [d.toISOString().split('T')[0]]: { selected: true, marked: true, selectedColor: colors.danger } };
                }
                return {};
              })()}
              theme={{
                calendarBackground: theme === 'dark' ? '#1E293B' : '#FFF',
                textSectionTitleColor: colors.textSecondary,
                dayTextColor: colors.text,
                todayTextColor: colors.primary,
                selectedDayBackgroundColor: colors.danger,
                selectedDayTextColor: '#ffffff',
                arrowColor: colors.primary,
                monthTextColor: colors.text
              }}
            />
            <TouchableOpacity
              onPress={() => setShowHearingModal(false)}
              style={{ padding: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, marginTop: 10 }}
            >
              <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PAYMENTS MODAL */}
      <Modal
        visible={showPaymentsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaymentsModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC' }}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Payments & Billing</Text>
            <TouchableOpacity onPress={() => setShowPaymentsModal(false)}>
              <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={[styles.noteInputContainer, { flexDirection: 'column', padding: 16, backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF', borderColor: colors.border }]}>
              <TextInput
                style={[styles.noteInput, { color: colors.text, width: '100%', borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 12 }]}
                placeholder="Amount (e.g. 500)"
                placeholderTextColor={colors.textSecondary}
                value={newPaymentAmount}
                onChangeText={setNewPaymentAmount}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.noteInput, { color: colors.text, width: '100%', marginBottom: 12 }]}
                placeholder="Description (e.g. Consultation Fee)"
                placeholderTextColor={colors.textSecondary}
                value={newPaymentDesc}
                onChangeText={setNewPaymentDesc}
              />
              <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                <TouchableOpacity
                  style={[styles.uploadButton, { flex: 1, backgroundColor: '#64748B', marginBottom: 0 }]}
                  onPress={() => handleAddPayment('Pending')}
                  disabled={isAddingPayment}
                >
                  <Text style={styles.uploadButtonText}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.uploadButton, { flex: 1, backgroundColor: '#10B981', marginBottom: 0 }]}
                  onPress={() => handleAddPayment('Paid')}
                  disabled={isAddingPayment}
                >
                  <Text style={styles.uploadButtonText}>Paid</Text>
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={payments}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ marginTop: 20, paddingBottom: 40 }}
              renderItem={({ item }) => (
                <View style={[styles.documentItem, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF' }]}>
                  <Ionicons name="cash-outline" size={24} color={item.status === 'Paid' ? '#10B981' : '#64748B'} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.docName, { color: colors.text }]}>${item.amount.toLocaleString()}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>{item.description || "No description"}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <View style={{
                        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
                        backgroundColor: item.status === 'Paid' ? '#ECFDF5' : '#F1F5F9'
                      }}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: item.status === 'Paid' ? '#059669' : '#64748B' }}>
                          {item.status.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 10, color: colors.textSecondary, marginLeft: 8 }}>
                        {new Date(item.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeletePayment(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textSecondary }}>No payment records found.</Text>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* NOTES MODAL */}
      <Modal
        visible={showNotesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC' }}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Case Notes</Text>
            <TouchableOpacity onPress={() => setShowNotesModal(false)}>
              <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={[styles.noteInputContainer, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF', borderColor: colors.border }]}>
              <TextInput
                style={[styles.noteInput, { color: colors.text }]}
                placeholder="Add a new note..."
                placeholderTextColor={colors.textSecondary}
                value={newNote}
                onChangeText={setNewNote}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: isAddingNote ? colors.border : colors.primary }]}
                onPress={handleAddNote}
                disabled={isAddingNote}
              >
                <Ionicons name="arrow-up" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={notes}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ marginTop: 20, paddingBottom: 40 }}
              renderItem={({ item }) => (
                <View style={[styles.noteItem, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF' }]}>
                  <Text style={[styles.noteContent, { color: colors.text }]}>{item.content}</Text>
                  <View style={styles.noteFooter}>
                    <Text style={{ fontSize: 10, color: colors.textSecondary }}>{new Date(item.createdAt).toLocaleString()}</Text>
                    <TouchableOpacity onPress={() => handleDeleteNote(item.id)}>
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textSecondary }}>No notes added yet.</Text>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* CLOSE CASE MODAL */}
      <Modal
        visible={showCloseModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCloseModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{
            backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
            borderRadius: 28,
            padding: 24,
            width: '85%',
            maxWidth: 320,
            alignItems: 'center',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
          }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{
                width: 64, height: 64, borderRadius: 32,
                backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
                alignItems: 'center', justifyContent: 'center', marginBottom: 16
              }}>
                <Ionicons name="archive" size={32} color={colors.danger} />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>
                Archive Case?
              </Text>
              <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 4 }}>
                Are you sure you want to officially close <Text style={{ fontWeight: '700', color: colors.text }}>"{caseData?.title || "this case"}"</Text>? This will cancel all pending hearings.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme === 'dark' ? colors.surface : '#F1F5F9',
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme === 'dark' ? '#334155' : 'transparent'
                }}
                onPress={() => setShowCloseModal(false)}
              >
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.danger,
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: 'center',
                  shadowColor: colors.danger,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={confirmCloseCase}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Yes, Archive</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FIX DEAL MONEY MODAL */}
      <Modal
        visible={showDealModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDealModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{
            backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
            borderRadius: 24,
            padding: 24,
            width: '85%',
            maxWidth: 320,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
          }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 8 }}>Fix Deal Amount</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20 }}>Enter the total agreed amount for this case. Pending money will be calculated automatically.</Text>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme === 'dark' ? colors.background : '#F1F5F9',
              borderRadius: 12,
              paddingHorizontal: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textSecondary }}>₹</Text>
              <TextInput
                style={{
                  flex: 1,
                  height: 48,
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.text,
                  marginLeft: 8
                }}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={dealAmount}
                onChangeText={setDealAmount}
                autoFocus={true}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: theme === 'dark' ? colors.surface : '#E2E8F0',
                }}
                onPress={() => setShowDealModal(false)}
              >
                <Text style={{ fontWeight: '600', color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: colors.primary,
                }}
                onPress={handleUpdateDeal}
              >
                <Text style={{ fontWeight: '700', color: '#FFF' }}>Fix Deal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DELETE DOCUMENT CONFIRMATION MODAL */}
      <Modal
        visible={showDeleteConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowDeleteConfirmModal(false);
          setDocumentToDelete(null);
        }}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={[styles.modalContentCenter, { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF' }]}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="warning" size={48} color={colors.danger} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text, textAlign: 'center', marginBottom: 8 }]}>Remove Document</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>Are you sure you want to remove this file permanently? This action cannot be undone.</Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={[styles.uploadButton, { flex: 1, backgroundColor: theme === 'dark' ? '#334155' : '#E2E8F0', marginBottom: 0 }]}
                onPress={() => {
                  setShowDeleteConfirmModal(false);
                  setDocumentToDelete(null);
                }}
              >
                <Text style={[styles.uploadButtonText, { color: theme === 'dark' ? '#FFF' : '#1E293B' }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadButton, { flex: 1, backgroundColor: colors.danger, marginBottom: 0 }]}
                onPress={confirmDeleteDocument}
              >
                <Text style={[styles.uploadButtonText, { color: '#FFF' }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

/* =====================
   STYLES
===================== */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  topBar: {
    paddingHorizontal: 12,
    paddingTop: Platform.OS === "ios" ? 6 : 10,
    paddingBottom: 6,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
  },

  backText: {
    fontSize: 14,
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.6,
  },

  scroll: {
    padding: 16,
    paddingBottom: 180,
  },

  headerCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    elevation: 5,
  },

  caseTypePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },

  caseTypeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  caseIdBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  dealCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  dealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dealStat: {
    flex: 1,
    alignItems: 'center',
  },
  dealLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dealValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  dealDivider: {
    width: 1,
    height: '100%',
    marginHorizontal: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },

  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  clientText: {
    fontSize: 14,
  },

  section: {
    marginBottom: 26,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },

  hearingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 18,
    borderLeftWidth: 4,
  },

  hearingDate: {
    fontSize: 15,
    fontWeight: "700",
  },

  hearingSub: {
    fontSize: 12,
    marginTop: 2,
  },

  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  aiCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },

  aiText: {
    fontSize: 14,
    lineHeight: 20,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  actionCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
  },

  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },

  /* MODAL STYLES */
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentCenter: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
      }
    }),
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    gap: 12,
  },
  docName: {
    fontSize: 14,
    fontWeight: '500',
  },

  /* NOTE STYLES */
  noteInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  noteInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    fontSize: 14,
    paddingTop: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  noteItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9', // subtle divider
    paddingTop: 8,
  },

  /* PROGRESS STYLES */
  progressContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  /* HALF MODAL STYLES */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  halfModalContent: {
    height: '60%', // Adjust for "half window" feel
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  caseIdText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
