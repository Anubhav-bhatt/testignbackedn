import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getCaseAnalysis, queryAI } from "../api";
import { useTheme } from "./context/ThemeContext";

type AnalysisSection = {
    title: string;
    icon: any;
    content: string;
    color: string;
};

export default function CaseAIScreen() {
    const router = useRouter();
    const { colors, theme } = useTheme();
    const { caseId, title, client } = useLocalSearchParams<{
        caseId?: string;
        title?: string;
        client?: string;
    }>();

    const isGlobal = !caseId;
    const [activeTab, setActiveTab] = useState<'analysis' | 'chat'>('analysis');
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [sections, setSections] = useState<AnalysisSection[]>([]);

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (isGlobal) {
                // Global AI Knowledge Base
                setSections([
                    {
                        title: "Legal Knowledge Base",
                        icon: "library",
                        content: "I have access to the latest Indian Penal Code (IPC), Civil Procedure Code (CPC), and recent Supreme Court citations from 2024-25.",
                        color: "#6366F1"
                    },
                    {
                        title: "Firm Standards",
                        icon: "business",
                        content: "All drafts follow Bhatt & Associates' internal standards for formatting and professional tone.",
                        color: "#0EA5E9"
                    }
                ]);
                setIsAnalyzing(false);
                return;
            }

            try {
                setIsAnalyzing(true);
                const data = await getCaseAnalysis(caseId as string);
                setSections([
                    {
                        title: "Case Intelligence Summary",
                        icon: "document-text",
                        content: data.summary,
                        color: "#4F46E5"
                    },
                    {
                        title: "Evidence & Audit Risks",
                        icon: "warning",
                        content: data.risks,
                        color: "#F59E0B"
                    },
                    {
                        title: "Strategic Action Plan",
                        icon: "bulb",
                        content: data.actions,
                        color: "#10B981"
                    },
                    {
                        title: "Relevant Case Citations",
                        icon: "bookmark",
                        content: data.precedents,
                        color: "#EC4899"
                    }
                ]);
            } catch (err) {
                console.error("AI Analysis fetch error:", err);
            } finally {
                setIsAnalyzing(false);
            }
        };
        fetchAnalysis();
    }, [caseId, isGlobal]);

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<any[]>([
        {
            id: '1',
            role: 'ai',
            text: isGlobal
                ? "Welcome to the Global Legal Assistant. I can help with general law queries, drafting templates, or looking up universal precedents. How can I assist you today?"
                : `Active Intelligence mapping for ${client}'s case is ready. I've scanned the document Audit Timeline. What's our next move?`,
            timestamp: new Date()
        }
    ]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        const queryText = input;
        setInput("");

        try {
            const response = await queryAI(queryText, caseId);
            const aiMsg = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: response.answer,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error("AI Chat Error:", err);
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: "I'm having trouble connecting to the intelligence engine. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

            {/* HEADER */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </Pressable>
                <View style={styles.headerInfo}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        {isGlobal ? "Global Assistant" : "Case Intel Engine"}
                    </Text>
                    <Text style={[styles.headerSub, { color: colors.textSecondary }]} numberOfLines={1}>
                        {isGlobal ? "Knowledge Base v2.4" : (title || "Mapped Case Context")}
                    </Text>
                </View>
                <View style={[styles.aiBadge, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="sparkles" size={12} color={colors.primary} />
                    <Text style={[styles.aiBadgeText, { color: colors.primary }]}>PRO</Text>
                </View>
            </View>

            {/* TABS */}
            <View style={[styles.tabBar, { backgroundColor: theme === 'dark' ? colors.surface : '#F1F5F9' }]}>
                <Pressable
                    onPress={() => setActiveTab('analysis')}
                    style={[styles.tab, activeTab === 'analysis' && { backgroundColor: theme === 'dark' ? colors.primary : '#FFF' }]}
                >
                    <Ionicons name="analytics" size={18} color={activeTab === 'analysis' ? (theme === 'dark' ? '#FFF' : colors.primary) : colors.textSecondary} />
                    <Text style={[styles.tabText, { color: activeTab === 'analysis' ? (theme === 'dark' ? '#FFF' : colors.text) : colors.textSecondary }]}>
                        {isGlobal ? "Knowledge Base" : "Analysis"}
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setActiveTab('chat')}
                    style={[styles.tab, activeTab === 'chat' && { backgroundColor: theme === 'dark' ? colors.primary : '#FFF' }]}
                >
                    <Ionicons name="chatbubbles" size={18} color={activeTab === 'chat' ? (theme === 'dark' ? '#FFF' : colors.primary) : colors.textSecondary} />
                    <Text style={[styles.tabText, { color: activeTab === 'chat' ? (theme === 'dark' ? '#FFF' : colors.text) : colors.textSecondary }]}>
                        {isGlobal ? "Query AI" : "Strategic Chat"}
                    </Text>
                </Pressable>
            </View>

            {activeTab === 'analysis' ? (
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {isAnalyzing ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Analyzing case strategy...</Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.analysisHeader}>
                                <Text style={[styles.analysisTitle, { color: colors.text }]}>Strategic Briefing</Text>
                                <Text style={[styles.analysisSub, { color: colors.textSecondary }]}>{client || "Rakesh Sharma"} • Property Dispute</Text>
                            </View>

                            {sections.map((sec, idx) => (
                                <View key={idx} style={[styles.sectionBlock, { backgroundColor: theme === 'dark' ? colors.surface : '#FFF', borderColor: colors.border }]}>
                                    <View style={styles.sectionHead}>
                                        <View style={[styles.iconBox, { backgroundColor: sec.color + '15' }]}>
                                            <Ionicons name={sec.icon} size={20} color={sec.color} />
                                        </View>
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{sec.title}</Text>
                                    </View>
                                    <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>{sec.content}</Text>
                                </View>
                            ))}

                            <TouchableOpacity
                                onPress={() => {
                                    setActiveTab('chat');
                                    setInput("Draft the Commission Application for property survey as identified in the risk analysis.");
                                }}
                                style={[styles.draftCard, { backgroundColor: colors.primary }]}
                            >
                                <View style={styles.draftContent}>
                                    <Text style={styles.draftTitle}>Need a Legal Draft?</Text>
                                    <Text style={styles.draftSub}>I can generate the Commission Application based on identified risks.</Text>
                                </View>
                                <View style={styles.draftIcon}>
                                    <Ionicons name="flash" size={24} color="#FFF" />
                                </View>
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            ) : (
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                >
                    <ScrollView contentContainerStyle={styles.chatScroll}>
                        {messages.map(msg => (
                            <View key={msg.id} style={[styles.msgRow, msg.role === 'user' ? styles.userRow : styles.aiRow]}>
                                <View style={[styles.bubble, msg.role === 'user' ? [styles.userBubble, { backgroundColor: colors.primary }] : [styles.aiBubble, { backgroundColor: theme === 'dark' ? colors.surface : '#FFF', borderColor: colors.border }]]}>
                                    <Text style={[styles.msgText, { color: msg.role === 'user' ? '#FFF' : colors.text }]}>{msg.text}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                    <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme === 'dark' ? colors.surface : '#F1F5F9', color: colors.text }]}
                            placeholder="Ask follow-up..."
                            placeholderTextColor={colors.textSecondary}
                            value={input}
                            onChangeText={setInput}
                        />
                        <TouchableOpacity onPress={handleSend} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
                            <Ionicons name="send" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, justifyContent: 'space-between' },
    backBtn: { padding: 4 },
    headerInfo: { flex: 1, marginLeft: 12 },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    headerSub: { fontSize: 12, fontWeight: '600', opacity: 0.6 },
    aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    aiBadgeText: { fontSize: 10, fontWeight: '800' },

    tabBar: { flexDirection: 'row', padding: 6, margin: 16, borderRadius: 14, gap: 6 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 10 },
    tabText: { fontSize: 13, fontWeight: '700' },

    scroll: { padding: 16, paddingBottom: 110 },
    loaderContainer: { alignItems: 'center', marginTop: 100 },
    loaderText: { marginTop: 16, fontSize: 14, fontWeight: '600' },

    analysisHeader: { marginBottom: 20 },
    analysisTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
    analysisSub: { fontSize: 14, marginTop: 4, fontWeight: '500' },

    sectionBlock: { padding: 20, borderRadius: 24, marginBottom: 16, borderWidth: 1 },
    sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: '800' },
    sectionContent: { fontSize: 14, lineHeight: 22, fontWeight: '500' },

    draftCard: { flexDirection: 'row', padding: 24, borderRadius: 28, marginTop: 8, alignItems: 'center' },
    draftContent: { flex: 1 },
    draftTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 4 },
    draftSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 18 },
    draftIcon: { marginLeft: 16 },

    chatScroll: { padding: 16, paddingBottom: 110 },
    msgRow: { marginBottom: 16, flexDirection: 'row' },
    userRow: { justifyContent: 'flex-end' },
    aiRow: { justifyContent: 'flex-start' },
    bubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
    userBubble: { borderBottomRightRadius: 4 },
    aiBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
    msgText: { fontSize: 15, lineHeight: 22 },

    inputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, gap: 12, alignItems: 'center', marginBottom: 100 },
    input: { flex: 1, height: 48, borderRadius: 24, paddingHorizontal: 16, fontSize: 14 },
    sendBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }
});
