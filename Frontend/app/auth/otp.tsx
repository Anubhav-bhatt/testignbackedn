import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function Otp() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();

  const [otp, setOtp] = useState("");

  const verifyOtp = () => {
    // 🔐 MOCK OTP
    if (otp === "123456") {
      router.replace("/dashboard");
    } else {
      Alert.alert("Invalid OTP", "Please enter the correct OTP");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
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

        <Pressable style={styles.button} onPress={verifyOtp}>
          <Text style={styles.buttonText}>Verify & Continue</Text>
        </Pressable>

        <Text style={styles.footer}>
          Didn’t receive OTP? Resend in 30s
        </Text>
      </View>
    </View>
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
