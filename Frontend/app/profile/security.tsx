import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProfile, updateProfile } from "../../api";
import { useTheme } from "../context/ThemeContext";

export default function SecurityScreen() {
    const router = useRouter();
    const { colors, theme } = useTheme();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [barId, setBarId] = useState("");
    
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const [biometricsEnabled, setBiometricsEnabled] = useState(false);

    useEffect(() => {
        checkBiometrics();
        fetchProfile();
        loadBiometricPreference();
    }, []);

    const checkBiometrics = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricAvailable(hasHardware && isEnrolled);
    };

    const loadBiometricPreference = async () => {
        const val = await AsyncStorage.getItem("biometricsEnabled");
        setBiometricsEnabled(val === "true");
    };

    const fetchProfile = async () => {
        try {
            const data = await getProfile();
            setProfile(data);
            setBarId(data.bar_id || "");
            
            // Sync local preference with server if needed
            if (data.biometrics_enabled !== undefined) {
                setBiometricsEnabled(data.biometrics_enabled);
                await AsyncStorage.setItem("biometricsEnabled", data.biometrics_enabled ? "true" : "false");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBarId = async () => {
        if (!barId.trim()) return;
        setSaving(true);
        try {
            await updateProfile({ barId: barId.trim() });
            Alert.alert("Success", "Bar ID updated successfully.");
        } catch (e) {
            Alert.alert("Error", "Failed to update Bar ID.");
        } finally {
            setSaving(false);
        }
    };

    const toggleBiometrics = async (value: boolean) => {
        if (value) {
            // Test it first
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: "Confirm Biometrics to Enable",
                fallbackLabel: "Use Passcode",
            });

            if (result.success) {
                setBiometricsEnabled(true);
                await AsyncStorage.setItem("biometricsEnabled", "true");
                await updateProfile({ biometrics_enabled: true });
                Alert.alert("Security Enabled", "Biometric unlock is now active for your account.");
            } else {
                setBiometricsEnabled(false);
            }
        } else {
            setBiometricsEnabled(false);
            await AsyncStorage.setItem("biometricsEnabled", "false");
            await updateProfile({ biometrics_enabled: false });
        }
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme === 'dark' ? '#000000' : '#F2F5F8' }]} edges={["top"]}>
            <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF' }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Security & Bar ID</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* Bar ID Section */}
                        <View style={styles.sectionContainer}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>LEGAL CREDENTIALS</Text>
                            <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF', borderColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                                <View style={styles.inputGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                        <Ionicons name="card-outline" size={20} color={colors.primary} />
                                        <Text style={[styles.inputLabel, { color: colors.text }]}>Bar Association ID</Text>
                                    </View>
                                    <TextInput
                                        style={[styles.input, { 
                                            backgroundColor: theme === 'dark' ? '#0F172A' : '#F8FAFC',
                                            color: colors.text,
                                            borderColor: colors.border
                                        }]}
                                        placeholder="Enter your Sanad / Bar ID"
                                        placeholderTextColor={colors.textSecondary}
                                        value={barId}
                                        onChangeText={setBarId}
                                    />
                                    <Pressable 
                                        style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                                        onPress={handleSaveBarId}
                                        disabled={saving}
                                    >
                                        {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveBtnText}>Update ID</Text>}
                                    </Pressable>
                                    <Text style={styles.hint}>This ID is used for court verification and document signing.</Text>
                                </View>
                            </View>
                        </View>

                        {/* Security Section */}
                        <View style={styles.sectionContainer}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APP SECURITY</Text>
                            <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF', borderColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                                <View style={styles.securityRow}>
                                    <View style={{ flex: 1, gap: 4 }}>
                                        <Text style={[styles.rowTitle, { color: colors.text }]}>Biometric Unlock</Text>
                                        <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                                            Use FaceID or Fingerprint to secure access to your legal matters.
                                        </Text>
                                    </View>
                                    {isBiometricAvailable ? (
                                        <Switch
                                            trackColor={{ false: "#3E3E3E", true: colors.primary }}
                                            thumbColor={"#f4f3f4"}
                                            ios_backgroundColor="#3e3e3e"
                                            onValueChange={toggleBiometrics}
                                            value={biometricsEnabled}
                                        />
                                    ) : (
                                        <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '700' }}>UNAVAILABLE</Text>
                                    )}
                                </View>

                                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                                <View style={styles.securityRow}>
                                    <View style={{ flex: 1, gap: 4 }}>
                                        <Text style={[styles.rowTitle, { color: colors.text }]}>Two-Factor Auth</Text>
                                        <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                                            Always verify identity via OTP on new device logins (Active).
                                        </Text>
                                    </View>
                                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                                </View>
                            </View>
                        </View>

                        <View style={styles.warningCard}>
                            <Ionicons name="information-circle-outline" size={20} color="#60A5FA" />
                            <Text style={styles.warningText}>
                                Biometric data is stored locally on your device and never shared with Legal-IQ servers.
                            </Text>
                        </View>
                    </>
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
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    input: {
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 15,
        fontWeight: '500',
    },
    saveBtn: {
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    saveBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    hint: {
        fontSize: 12,
        color: '#64748B',
        fontStyle: 'italic',
        marginTop: 10,
        textAlign: 'center',
    },
    securityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    rowSub: {
        fontSize: 13,
        lineHeight: 18,
    },
    divider: {
        height: 1,
        marginVertical: 12,
        opacity: 0.5,
    },
    warningCard: {
        flexDirection: 'row',
        backgroundColor: '#1E3A5F20',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    warningText: {
        flex: 1,
        color: '#60A5FA',
        fontSize: 13,
        lineHeight: 18,
    }
});
