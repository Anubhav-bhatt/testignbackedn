import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { uploadDocument, sendOtp as sendOtpApi } from "../../api";

type DocumentItem = {
    id: string;
    label: string;
    file: any | null;
    uploadedId?: string; // ADD THIS
};

export default function DocumentVerification() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Initial required documents list
    const [documents, setDocuments] = useState<DocumentItem[]>([
        { id: "selfie", label: "Face Verification (Live Selfie)", file: null },
        { id: "sanad", label: "State Bar Council Enrollment Certificate (Sanad)", file: null },
        { id: "id_card", label: "Bar Council Identity Card", file: null },
        { id: "cop", label: "Certificate of Practice (issued after AIBE)", file: null },
        { id: "llb", label: "LLB Degree Certificate", file: null },
        { id: "aibe", label: "AIBE Pass Certificate (if enrolled after 2010)", file: null },
        { id: "firm", label: "Law Firm Association/Registration Documents", file: null },
        { id: "ecourts", label: "Court Attendance/Case Activity Records", file: null },
    ]);

    const [isUploading, setIsUploading] = useState(false);

    const handleTakePhoto = async () => {
        try {
            // Check for camera permissions
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            
            if (permission.status !== 'granted') {
                return Alert.alert(
                    "Permission Required", 
                    "Legal-IQ needs camera access to take your verification selfie. Please enable it in your device settings."
                );
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled) {
                const asset = result.assets[0];
                const file = {
                    uri: asset.uri,
                    name: asset.fileName || `selfie_${Date.now()}.jpg`,
                    type: asset.mimeType || 'image/jpeg',
                } as any;
                
                setIsUploading(true);
                console.log("Uploading selfie:", file.uri);
                try {
                    const uploadResult = await uploadDocument(file, "profile-temp", "selfie");
                    console.log("Selfie upload result:", uploadResult);
                    setDocuments(prev => prev.map(doc =>
                        doc.id === "selfie" ? { ...doc, file, uploadedId: uploadResult.id } : doc
                    ));
                    Alert.alert("Success", "Selfie uploaded successfully.");
                } catch (e: any) {
                    console.error("Selfie upload error details:", e);
                    const errorMsg = e.response?.data?.error || e.message || "Network Error: Could not connect to the server.";
                    Alert.alert("Upload Error", `Reason: ${errorMsg}\n\nTip: Ensure your phone is on the same WiFi as your Mac.`);
                } finally {
                    setIsUploading(false);
                }
            }
        } catch (error: any) {
            console.error("Camera Error:", error);
            // Some simulators or devices with no camera will throw an error here
            Alert.alert("Camera Error", "Could not access the camera. If you are on a simulator, please use a physical device.");
        }
    };

    const handlePickDocument = async (id: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                const file = result.assets[0];
                setIsUploading(true);
                try {
                    // Upload file instantly using "profile-temp" and passing doc id as "docType"
                    const uploadResult = await uploadDocument(file, "profile-temp", id);

                    setDocuments(prev => prev.map(doc =>
                        doc.id === id ? { ...doc, file, uploadedId: uploadResult.id } : doc
                    ));
                    Alert.alert("Success", "Document verified and uploaded.");
                } catch (e) {
                    console.error("Upload error:", e);
                    Alert.alert("Upload Failed", "Could not upload the document to the server.");
                } finally {
                    setIsUploading(false);
                }
            }
        } catch (error) {
            console.error("Error picking document:", error);
            Alert.alert("Error", "Could not select the document.");
            setIsUploading(false);
        }
    };

    const handleContinue = async () => {
        // Here we could validate that at least the mandatory docs are present
        const hasSelfie = documents.some(d => d.id === 'selfie' && !!d.uploadedId);
        const hasMainDocs = documents.some(d => (d.id === 'sanad' || d.id === 'id_card') && !!d.uploadedId);

        if (!hasSelfie) {
            return Alert.alert("Selfie Required", "Please take a live verification selfie to proceed.");
        }

        if (!hasMainDocs) {
            return Alert.alert("Required Documents", "Please upload at least your Sanad or Bar Council Identity Card to proceed with verification.");
        }

        try {
            const docIds = documents.filter(d => d.uploadedId).map(d => d.uploadedId);
            const userPhone = params.phone as string;

            const response = await sendOtpApi({ phone: userPhone });
            
            Alert.alert("TESTING OTP", `Your OTP for signup is: ${response.otp}`);

            router.push({
                pathname: "/auth/otp",
                params: { ...params, verifiying_docs: "true", uploadedDocIds: JSON.stringify(docIds), expectedOtp: response.otp },
            });
        } catch (e: any) {
            Alert.alert("Error", e.toString());
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {isUploading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Uploading Verification...</Text>
                </View>
            )}

            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.logo}>Verification</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>Submit Legal Credentials</Text>
                <Text style={styles.subtitle}>
                    Please upload the following documents and take a selfie. These will be verified before you can access the application.
                </Text>

                <View style={styles.form}>
                    {documents.map((doc) => (
                        <Pressable 
                            key={doc.id} 
                            style={styles.docRow}
                            onPress={() => doc.id === 'selfie' ? handleTakePhoto() : handlePickDocument(doc.id)}
                        >
                            <View style={styles.docInfo}>
                                <Text style={styles.docLabel}>
                                    {doc.label} {doc.id === 'selfie' && <Text style={{ color: '#F59E0B' }}>*</Text>}
                                </Text>
                                {doc.file ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        {doc.id === 'selfie' && doc.file.uri && (
                                            <Image source={{ uri: doc.file.uri }} style={{ width: 20, height: 20, borderRadius: 10 }} />
                                        )}
                                        <Text style={styles.docFileName} numberOfLines={1}>
                                            {doc.id === 'selfie' ? 'Selfie Captured' : doc.file.name}
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Ionicons 
                                            name={doc.id === 'selfie' ? "camera" : "document-text-outline"} 
                                            size={12} 
                                            color="#9CA3AF" 
                                        />
                                        <Text style={styles.docMissing}>Tap to {doc.id === 'selfie' ? 'take photo' : 'upload'}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={[styles.uploadBtn, doc.file ? styles.uploadBtnSuccess : {}]}>
                                <Ionicons
                                    name={doc.file ? "checkmark-circle" : (doc.id === 'selfie' ? "camera" : "cloud-upload-outline")}
                                    size={20}
                                    color={doc.file ? "#10B981" : "#1D4ED8"}
                                />
                                <Text style={[styles.uploadBtnText, doc.file ? { color: "#10B981" } : {}]}>
                                    {doc.file ? "Done" : "Go"}
                                </Text>
                            </View>
                        </Pressable>
                    ))}
                </View>

                <Pressable style={styles.button} onPress={handleContinue}>
                    <Text style={styles.buttonText}>Submit & Continue to OTP</Text>
                </Pressable>

                <Text style={styles.footer}>
                    Verification is required to ensure a secure platform for all legal professionals.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B1C2D",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backBtn: {
        padding: 5,
    },
    logo: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 1,
    },
    scroll: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 24,
        lineHeight: 20,
    },
    form: {
        backgroundColor: "#0F2742",
        borderRadius: 14,
        padding: 16,
        marginBottom: 24,
    },
    docRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#1E3A5F",
    },
    docInfo: {
        flex: 1,
        paddingRight: 10,
    },
    docLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    docMissing: {
        fontSize: 12,
        color: "#EF4444", // Red text for not uploaded
    },
    docFileName: {
        fontSize: 12,
        color: "#10B981", // Green text for uploaded file
    },
    uploadBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1D4ED820",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    uploadBtnSuccess: {
        backgroundColor: "#10B98120",
    },
    uploadBtnText: {
        color: "#1D4ED8",
        fontSize: 12,
        fontWeight: "700",
    },
    button: {
        backgroundColor: "#1D4ED8",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    footer: {
        marginTop: 20,
        fontSize: 12,
        color: "#9CA3AF",
        textAlign: "center",
        paddingHorizontal: 20,
        lineHeight: 18,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 12,
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
});
