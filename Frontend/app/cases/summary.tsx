import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getCaseById, getFileUrl } from "../../api";
import { useTheme } from "../context/ThemeContext";

export default function CaseSummaryScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors, theme } = useTheme();
    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCase = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await getCaseById(id as string);
                if (!data) throw new Error("Case not found");
                setCaseData(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching case summary", err);
                setError("Could not load case details. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchCase();
    }, [id]);

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 12, color: colors.textSecondary }}>Fetching Intel...</Text>
            </View>
        );
    }

    if (error || !caseData) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background, padding: 20 }]}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
                <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '700', color: colors.text }}>Oops!</Text>
                <Text style={{ marginTop: 8, textAlign: 'center', color: colors.textSecondary }}>{error || "Case details not found"}</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ marginTop: 24, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: 10 }}
                >
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Case Intelligence Summary</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* HERO SECTION */}
                <View style={[
                    styles.heroCard, 
                    { 
                        backgroundColor: theme === 'dark' ? colors.surface : '#FFF',
                        borderColor: colors.border 
                    }
                ]}>
                    <View style={[styles.statusBadge, { backgroundColor: colors.primary + '15' }]}>
                        <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
                        <Text style={[styles.statusText, { color: colors.primary }]}>{caseData.status}</Text>
                    </View>

                    <Text style={[styles.title, { color: colors.text }]}>{caseData.title}</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{caseData.clientName} • {caseData.caseId}</Text>
                </View>

                {/* FINANCIAL HEALTH SECTION */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Financial Health (Payments)</Text>
                </View>
                <View style={styles.grid}>
                    <InsightCard
                        icon="diamond-outline"
                        label="Fixed Deal"
                        value={`₹${caseData.totalFixedAmount || '---'}`}
                        color="#8B5CF6"
                        bg="#F5F3FF"
                    />
                    <InsightCard
                        icon="cash-outline"
                        label="Pending"
                        value={`₹${caseData.pendingAmount}`}
                        color="#EF4444"
                        bg="#FEF2F2"
                    />
                    <InsightCard
                        icon="checkmark-done-circle-outline"
                        label="Received"
                        value={`₹${caseData.totalPaid}`}
                        color="#10B981"
                        bg="#ECFDF5"
                    />
                </View>

                {/* RECENT TRANSACTIONS */}
                <View style={[
                    styles.card, 
                    { 
                        backgroundColor: theme === 'dark' ? colors.surface : '#FFF',
                        borderColor: colors.border
                    }
                ]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Recent Billing Activity</Text>
                    {caseData.payments?.length > 0 ? (
                        caseData.payments.slice(0, 3).map((p: any) => (
                            <View key={p.id} style={styles.miniItem}>
                                <Ionicons name="receipt-outline" size={16} color={colors.textSecondary} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.itemLabel, { color: colors.text }]}>{p.description || 'Professional Fee'}</Text>
                                    <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{new Date(p.date).toLocaleDateString()}</Text>
                                </View>
                                <Text style={[styles.itemValue, { color: p.status === 'Paid' ? '#10B981' : colors.text }]}>₹{p.amount}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No recent payments recorded.</Text>
                    )}
                </View>

                {/* DOCUMENT TIMELINE */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Document Audit Timeline</Text>
                </View>
                <View style={[
                    styles.card, 
                    { 
                        backgroundColor: theme === 'dark' ? colors.surface : '#FFF',
                        borderColor: colors.border
                    }
                ]}>
                    {caseData.documents?.length > 0 ? (
                        caseData.documents.slice(0, 3).map((d: any, index: number) => (
                            <View key={d.id} style={styles.timelineItem}>
                                <View style={styles.timelineLeading}>
                                    <View style={[styles.timelineDot, { backgroundColor: colors.primary }]} />
                                    {index !== caseData.documents.slice(0, 3).length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
                                </View>
                                <View style={styles.timelineContent}>
                                    <Text style={[styles.itemLabel, { color: colors.text }]}>{d.originalName}</Text>
                                    <Text style={[styles.itemSub, { color: colors.textSecondary }]}>Uploaded: {new Date(d.createdAt).toLocaleString()}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <TouchableOpacity onPress={() => {
                                        const url = getFileUrl(d.filename);
                                        Linking.openURL(url).catch(err => Alert.alert("Error", "Cannot open file"));
                                    }}>
                                        <Ionicons name="eye-outline" size={18} color={colors.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        const url = getFileUrl(d.filename);
                                        Linking.openURL(url).catch(err => Alert.alert("Error", "Cannot download file"));
                                    }}>
                                        <Ionicons name="download-outline" size={18} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No documents uploaded yet.</Text>
                    )}
                </View>

            </ScrollView>

            {/* FOOTER ACTION */}
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.manageBtn, { backgroundColor: colors.primary }]}
                    onPress={() => router.push({ pathname: "/cases/case-details", params: { id: caseData.id } })}
                >
                    <Text style={styles.manageBtnText}>Open Management Deep-Dive</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFF" />
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

function InsightCard({ icon, label, value, color, bg }: any) {
    const { colors, theme } = useTheme();
    return (
        <View style={[
            styles.insightCard, 
            { 
                backgroundColor: theme === 'dark' ? colors.surface : bg,
                borderColor: colors.border
            }
        ]}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>{label}</Text>
            <Text style={[styles.insightValue, { color: colors.text }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: { padding: 8, borderRadius: 12 },
    headerTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.5 },
    scrollContent: { padding: 16, paddingBottom: 180 },
    heroCard: { 
        padding: 20, 
        borderRadius: 24, 
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)', // Fallback
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
    subtitle: { fontSize: 14, fontWeight: '600', opacity: 0.7 },
    grid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    insightCard: { 
        flex: 1, 
        padding: 16, 
        borderRadius: 20, 
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    iconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    insightLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    insightValue: { fontSize: 18, fontWeight: '800' },
    card: { 
        padding: 20, 
        borderRadius: 24, 
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardTitle: { fontSize: 14, fontWeight: '800', marginBottom: 16, textTransform: 'uppercase', opacity: 0.6 },
    miniItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    itemLabel: { fontSize: 14, fontWeight: '700' },
    itemSub: { fontSize: 12, fontWeight: '500', opacity: 0.6 },
    itemValue: { fontSize: 14, fontWeight: '800' },
    emptyText: { fontSize: 13, fontStyle: 'italic', textAlign: 'center' },
    timelineItem: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    timelineLeading: { alignItems: 'center', width: 12 },
    timelineDot: { width: 10, height: 10, borderRadius: 5 },
    timelineLine: { width: 2, flex: 1, marginVertical: 4 },
    timelineContent: { flex: 1 },
    sectionHeader: { marginBottom: 12, marginTop: 12 },
    sectionTitle: { fontSize: 15, fontWeight: '800', textTransform: 'uppercase', opacity: 0.6 },
    aiSection: { 
        padding: 20, 
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)', // Thematic purple border
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    aiTitle: { fontSize: 13, fontWeight: '800' },
    aiText: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
    footer: { position: 'absolute', bottom: 110, left: 0, right: 0, padding: 16, borderTopWidth: 0, backgroundColor: 'transparent' },
    manageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 18, gap: 10, marginHorizontal: 16 },
    manageBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    aiChatBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 8 },
    aiChatBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' }
});
