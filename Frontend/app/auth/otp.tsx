import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { login, signup } from "../../api"; // Added API imports

export default function Otp() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string, name?: string, email?: string, role?: string, verifiying_docs?: string, uploadedDocIds?: string, expectedOtp?: string }>();
  const phone = params.phone || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyOtp = async () => {
    // 🔐 MOCK OTP Check first
    const inputOtp = otp.trim();
    
    // Ensure we take the first value if it's an array
    const rawExpected = params.expectedOtp;
    const correctOtp = (Array.isArray(rawExpected) ? rawExpected[0] : rawExpected) || "123456";
    
    console.log(`Verifying OTP: Input="${inputOtp}", Expected="${correctOtp}"`);

    // Master OTP for development
    if (inputOtp === "111111") {
      console.log("Master OTP used");
    } else if (inputOtp !== correctOtp) {
      return Alert.alert(
        "Invalid OTP", 
        `The OTP you entered is incorrect. \n\nDebug Info: Your device received "${correctOtp}".\nConsole Tip: Check the backend terminal log.`
      );
    }

    try {
      setLoading(true);
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
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

          {/* Debug Tool for Testing */}
          <Pressable 
            style={{ marginBottom: 16, alignSelf: 'center' }}
            onPress={() => {
              const rawExpected = params.expectedOtp;
              const correct = (Array.isArray(rawExpected) ? rawExpected[0] : rawExpected) || "123456";
              setOtp(correct);
            }}
          >
            <Text style={{ color: '#1D4ED8', fontSize: 12, fontWeight: '600' }}>
              [Debug] Fill Received OTP
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={verifyOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify & Continue"}</Text>
          </Pressable>

          <Text style={styles.footer}>
            Didn’t receive OTP? Resend in 30s
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1C2D", // Same dark blue
    paddingHorizontal: 24,
    justifyContent: "center",
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
});
