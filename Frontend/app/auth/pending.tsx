import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";

export default function PendingVerification() {
    const router = useRouter();

    const handleCheckStatus = async () => {
        // Here we could add an API call to re-verify status with the backend.
        // For demonstration, simulating an alert or log.
        // Actually, if they are verified, we would update AsyncStorage and route to dashboard.
        // But for now, we'll just show them an alert.
        alert("Your documents are still under manual review. Please check back later.");
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("userStatus");
        router.replace("/auth/login");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={64} color="#3B82F6" />
            </View>

            <Text style={styles.title}>Verification Pending</Text>

            <Text style={styles.subtitle}>
                Thank you for submitting your legal credentials. Your documents are currently under manual review by our enrollment team.
            </Text>

            <View style={styles.card}>
                <Ionicons name="information-circle" size={20} color="#60A5FA" style={{ marginTop: 2 }} />
                <Text style={styles.cardText}>
                    This process enforces platform security for legal professionals and typically takes about 1 hour. Once your permissions are granted, you will receive full access to your intelligent dashboard.
                </Text>
            </View>

            <Pressable style={styles.button} onPress={handleCheckStatus}>
                <Text style={styles.buttonText}>Check Status</Text>
            </Pressable>

            <Pressable style={styles.outlineButton} onPress={handleLogout}>
                <Text style={styles.outlineButtonText}>Sign Out & Return Later</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B1C2D",
        paddingHorizontal: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#1D4ED820",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: "#FFFFFF",
        marginBottom: 12,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: "#9CA3AF",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    card: {
        flexDirection: "row",
        backgroundColor: "#0F2742",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#1E3A5F",
        marginBottom: 30,
        gap: 12,
    },
    cardText: {
        flex: 1,
        color: "#BFDBFE",
        fontSize: 13,
        lineHeight: 20,
    },
    button: {
        backgroundColor: "#1D4ED8",
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: "100%",
        alignItems: "center",
        marginBottom: 16,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    outlineButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: "100%",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#1E3A5F",
    },
    outlineButtonText: {
        color: "#9CA3AF",
        fontSize: 15,
        fontWeight: "600",
    },
});
