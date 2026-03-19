import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { login, sendOtp as sendOtpApi, signup, verifyOtp as verifyOtpApi } from "../../api";

export default function Otp() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string, name?: string, email?: string, role?: string, verifiying_docs?: string, uploadedDocIds?: string }>();
  const phone = params.phone || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const verifyOtp = async () => {
    const inputOtp = otp.trim();
    if (inputOtp.length !== 6) {
      return Alert.alert("Invalid OTP", "Please enter the 6-digit OTP sent to your phone.");
    }

    try {
      setLoading(true);
      await verifyOtpApi({ phone, otp: inputOtp });

      const isSignupFlow = params.name && params.email && params.verifiying_docs;

      let authResult;

      if (isSignupFlow) {
        // Register User first
        const docIds = params.uploadedDocIds ? JSON.parse(params.uploadedDocIds) : [];
        authResult = await signup({
          name: params.name!,
          email: params.email!,
          phone: phone,
          role: params.role,
          uploadedDocIds: docIds,
        });
      } else {
        // Login Flow
        authResult = await login({ phone });
      }

      // If successful, save token / ID and Status
      console.log("Auth Success Result:", authResult);
      const userToken = authResult.user?.id || "mock-auth-token-123456";
      const userStatus = authResult.user?.status || "pending";
      const biometricsEnabled = authResult.user?.biometrics_enabled === true;

      await AsyncStorage.setItem("userToken", userToken);
      await AsyncStorage.setItem("userStatus", userStatus);
      await AsyncStorage.setItem("biometricsEnabled", biometricsEnabled ? "true" : "false");

      if (userStatus === 'pending') {
        router.replace("/auth/pending");
      } else {
        router.replace("/dashboard");
      }

    } catch (e: any) {
      console.error("Auth Failure:", e);
      Alert.alert("Authentication Failed", typeof e === 'string' ? e : "An error occurred during verification");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      setResending(true);
      const response = await sendOtpApi({ phone, checkExists: !(params.name && params.email && params.verifiying_docs) });
      if (response.debugOtp) {
        Alert.alert("Debug OTP", `Your new OTP is: ${response.debugOtp}`);
      } else {
        Alert.alert("OTP Sent", "A fresh OTP has been sent to your phone.");
      }
    } catch (error: any) {
      Alert.alert("Resend Failed", typeof error === 'string' ? error : "Could not resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: "#0B1C2D" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <StatusBar barStyle="light-content" />

        {/* Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => router.back()} 
          style={{ position: 'absolute', left: 0, top: 10, padding: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.logo}>LEGAL-IQ</Text>
        <Text style={styles.tagline}>
          Secure verification in progress
        </Text>
      </View>

        {/* OTP Box */}
        <View style={styles.form}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            OTP sent to +91 {phone}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit OTP"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            textAlign="center"
          />
          <Pressable
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={verifyOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify & Continue"}</Text>
          </Pressable>

          <Pressable onPress={resendOtp} disabled={resending} style={styles.resendBtn}>
            <Text style={styles.resendText}>{resending ? "Resending..." : "Didn’t receive OTP? Resend"}</Text>
          </Pressable>

          <Text style={styles.footer}>OTP is valid for 5 minutes.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0B1C2D", // Same dark blue
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  tagline: {
    marginTop: 6,
    fontSize: 13,
    color: "#9CA3AF",
  },
  form: {
    backgroundColor: "#0F2742",
    borderRadius: 14,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 18,
  },
  input: {
    backgroundColor: "#0B1C2D",
    borderRadius: 10,
    paddingVertical: 14,
    fontSize: 18,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#1E3A5F",
    letterSpacing: 6,
    marginBottom: 16,
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
    marginTop: 14,
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
  },
  resendBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  resendText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '600',
  },
});
