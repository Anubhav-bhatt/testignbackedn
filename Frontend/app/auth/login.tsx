import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  Platform,
  Modal,
} from "react-native";

import { sendOtp as sendOtpApi } from "../../api";

export default function Login() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUserNotFound, setIsUserNotFound] = useState(false);

  const sendOtp = async () => {
    if (phone.length < 10) {
      setErrorMessage("Valid phone number required");
      setIsUserNotFound(false);
      setShowErrorModal(true);
      return;
    }

    try {
      const response = await sendOtpApi({ phone, checkExists: true });
      
      router.push({
        pathname: "/auth/otp",
        params: { phone, expectedOtp: response.otp },
      });
    } catch (e: any) {
      console.log("Login error caught:", e);
      const errorMsg = typeof e === 'string' ? e : e?.message || e?.toString() || "";
      
      if (errorMsg.includes("User not found") || errorMsg.includes("sign up first")) {
        setErrorMessage("this number is not assocated with assocaition sign up first");
        setIsUserNotFound(true);
        setShowErrorModal(true);
      } else {
        setErrorMessage(errorMsg || "An error occurred");
        setIsUserNotFound(false);
        setShowErrorModal(true);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Error Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showErrorModal}
          onRequestClose={() => setShowErrorModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isUserNotFound ? "User Not Found" : "Error"}
              </Text>
              <Text style={styles.modalMessage}>{errorMessage}</Text>
              
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowErrorModal(false)}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                </Pressable>
                
                {isUserNotFound && (
                  <Pressable
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={() => {
                      setShowErrorModal(false);
                      router.push("/auth/signup");
                    }}
                  >
                    <Text style={styles.modalButtonText}>Sign Up</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </Modal>

        {/* Branding */}
        <View style={styles.header}>
          <Pressable 
            onPress={() => router.back()} 
            style={{ position: 'absolute', left: 0, top: 0, padding: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.logo}>LEGAL-IQ</Text>
          <Text style={styles.tagline}>
            Intelligent Legal Case Management
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.title}>Welcome back</Text>

          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />

          <Pressable style={styles.button} onPress={sendOtp}>
            <Text style={styles.buttonText}>Log in with OTP</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/auth/signup")} style={styles.switchContainer}>
            <Text style={styles.switchText}>
              Don't have an account? <Text style={styles.switchTextBold}>Sign up</Text>
            </Text>
          </Pressable>

          <Text style={styles.footer}>
            Secure OTP authentication • No password required
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1C2D", // Dark blue professional
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
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#0B1C2D",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#1E3A5F",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#1D4ED8", // Professional blue CTA
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  switchContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  switchText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  switchTextBold: {
    color: "#1D4ED8",
    fontWeight: "700",
  },
  footer: {
    marginTop: 24,
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#0F2742",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#1E3A5F",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#9CA3AF",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonCancel: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#1E3A5F",
  },
  modalButtonPrimary: {
    backgroundColor: "#1D4ED8",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  modalButtonTextCancel: {
    color: "#9CA3AF",
    fontSize: 15,
    fontWeight: "600",
  },
});
