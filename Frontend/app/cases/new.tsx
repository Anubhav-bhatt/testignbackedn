import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { createCase, getFileUrl, uploadDocument } from "../../api";
import { useTheme } from "../context/ThemeContext";

const REQUIRED_DOCS = [
    { key: 'fir', label: 'FIR / Complaint Copy', mandatory: true },
    { key: 'aadhar', label: 'Aadhar Card', mandatory: true },
    { key: 'pancard', label: 'PAN Card', mandatory: true },
    { key: 'other1', label: 'Additional Evidence 1', mandatory: false },
    { key: 'other2', label: 'Additional Evidence 2', mandatory: false },
];

export default function NewCaseScreen() {
    const router = useRouter();
    const { colors, theme } = useTheme();

    const [form, setForm] = useState({
        title: "",
        clientName: "",
        caseId: "",
        category: "Civil",
        court: "",
        nextHearing: "",
        clientImage: "",
    });

    const [documents, setDocuments] = useState<Record<string, { name: string, url: string, filename: string, mimeType: string }>>({});

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handlePhotoUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "image/*",
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            const uploaded = await uploadDocument(file, "profile-temp");
            if (uploaded && uploaded.filename) {
                const url = getFileUrl(uploaded.filename);
                setForm({ ...form, clientImage: url });
            }
        } catch (err) {
            console.error("Photo upload error:", err);
            alert("Failed to upload photo");
        }
    };

    const handleDocUpload = async (key: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            const uploaded = await uploadDocument(file, "profile-temp", undefined);
            if (uploaded && uploaded.filename) {
                const url = getFileUrl(uploaded.filename);
                setDocuments(prev => ({
                    ...prev,
                    [key]: {
                        name: file.name,
                        url,
                        filename: uploaded.filename,
                        mimeType: uploaded.mimeType || 'application/octet-stream'
                    }
                }));
            }
        } catch (err) {
            console.error("Doc upload error:", err);
            alert("Failed to upload document");
        }
    };

    const isSubmitDisabled = !form.title || !form.clientName || !form.nextHearing ||
        !documents['fir'] || !documents['aadhar'] || !documents['pancard'] || loading;

    const handleSubmit = async () => {
        if (isSubmitDisabled) return;

        setLoading(true);
        try {
            // Include documents in metadata or handle them as separate uploads once case is created
            // For now, we'll just create the case.
            await createCase({ ...form, documents });
            router.back();
        } catch (err) {
            console.error("Create Case Error:", err);
            alert("Failed to create case. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* HEADER */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>New Case Intake</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.content}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>MATTER DETAILS</Text>

                        {/* PHOTO UPLOAD */}
                        <View style={styles.photoContainer}>
                            <TouchableOpacity onPress={handlePhotoUpload} style={[styles.avatarBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                {form.clientImage ? (
                                    <Image source={{ uri: form.clientImage }} style={styles.avatarImage} />
                                ) : (
                                    <View style={styles.emptyAvatar}>
                                        <Ionicons name="camera" size={32} color={colors.textSecondary} />
                                        <Text style={[styles.avatarLabel, { color: colors.textSecondary }]}>Upload Photo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            {form.clientImage && (
                                <TouchableOpacity onPress={() => setForm({ ...form, clientImage: "" })}>
                                    <Text style={[styles.removeText, { color: colors.danger }]}>Remove Photo</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Case Title</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                                placeholder="e.g. Sharma vs. State"
                                placeholderTextColor={colors.textSecondary}
                                value={form.title}
                                onChangeText={(v) => setForm({ ...form, title: v })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Client Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                                placeholder="Full Legal Name"
                                placeholderTextColor={colors.textSecondary}
                                value={form.clientName}
                                onChangeText={(v) => setForm({ ...form, clientName: v })}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Case ID</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                                    placeholder="CIV-2024-..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={form.caseId}
                                    onChangeText={(v) => setForm({ ...form, caseId: v })}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Category</Text>
                                <View style={styles.categoryRow}>
                                    {["Civil", "Criminal"].map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            onPress={() => setForm({ ...form, category: cat })}
                                            style={[
                                                styles.catBtn,
                                                { borderColor: colors.border },
                                                form.category === cat && { backgroundColor: colors.primary, borderColor: colors.primary }
                                            ]}
                                        >
                                            <Text style={[styles.catBtnText, { color: colors.textSecondary }, form.category === cat && { color: '#FFF' }]}>
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Court / Jurisdiction</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                                placeholder="e.g. High Court, Delhi"
                                placeholderTextColor={colors.textSecondary}
                                value={form.court}
                                onChangeText={(v) => setForm({ ...form, court: v })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>First Hearing Date (Required)</Text>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, justifyContent: 'center' }]}
                            >
                                <Text style={{ color: form.nextHearing ? colors.text : colors.textSecondary }}>
                                    {form.nextHearing
                                        ? new Date(form.nextHearing).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })
                                        : "Select Date"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 10 }]}>MANDATORY DOCUMENTS</Text>
                        <View style={styles.docsList}>
                            {REQUIRED_DOCS.map((doc) => (
                                <TouchableOpacity
                                    key={doc.key}
                                    onPress={() => handleDocUpload(doc.key)}
                                    style={[
                                        styles.docRow,
                                        { backgroundColor: colors.surface, borderColor: colors.border },
                                        documents[doc.key] && { borderColor: colors.primary + '40' }
                                    ]}
                                >
                                    <View style={styles.docInfo}>
                                        <Ionicons
                                            name={documents[doc.key] ? "checkbox" : "document-attach-outline"}
                                            size={20}
                                            color={documents[doc.key] ? colors.primary : colors.textSecondary}
                                        />
                                        <View>
                                            <Text style={[styles.docLabel, { color: colors.text }]}>
                                                {doc.label} {doc.mandatory && <Text style={{ color: colors.danger }}>*</Text>}
                                            </Text>
                                            {documents[doc.key] && (
                                                <Text style={[styles.docName, { color: colors.textSecondary }]} numberOfLines={1}>
                                                    {documents[doc.key].name}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    {documents[doc.key] ? (
                                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                    ) : (
                                        <Ionicons name="cloud-upload-outline" size={20} color={colors.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitBtn,
                                { backgroundColor: colors.primary },
                                isSubmitDisabled && { opacity: 0.6 }
                            ]}
                            onPress={handleSubmit}
                            disabled={isSubmitDisabled}
                        >
                            <Text style={styles.submitBtnText}>{loading ? "Archiving Case..." : "Archive & Open Vault"}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                transparent={true}
                visible={showDatePicker}
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFF' }]}>
                        <Calendar
                            onDayPress={(day: any) => {
                                setForm({ ...form, nextHearing: day.dateString }); // Sets YYYY-MM-DD
                                setShowDatePicker(false);
                            }}
                            theme={{
                                calendarBackground: theme === 'dark' ? '#1E293B' : '#FFF',
                                textSectionTitleColor: colors.textSecondary,
                                dayTextColor: colors.text,
                                todayTextColor: colors.primary,
                                selectedDayBackgroundColor: colors.primary,
                                selectedDayTextColor: '#ffffff',
                                arrowColor: colors.primary,
                                monthTextColor: colors.text
                            }}
                        />
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                            style={[styles.closeBtn, { borderTopColor: colors.border }]}
                        >
                            <Text style={{ color: colors.danger, fontWeight: '700' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    scroll: { paddingBottom: 40 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 10,
        opacity: 0.6,
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    emptyAvatar: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 4,
    },
    removeText: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
    },
    inputGroup: {
        marginBottom: 24,
    },
    docsList: {
        marginBottom: 30,
        gap: 12,
    },
    docRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1.5,
    },
    docInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    docLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    docName: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
    },
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 15,
        fontWeight: '500',
        borderWidth: 1.5,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    categoryRow: {
        flexDirection: 'row',
        gap: 8,
        height: 56,
    },
    catBtn: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    catBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    submitBtn: {
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    submitBtnText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '800',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        borderRadius: 20,
        overflow: 'hidden',
        padding: 10
    },
    closeBtn: {
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        marginTop: 10
    }
});
