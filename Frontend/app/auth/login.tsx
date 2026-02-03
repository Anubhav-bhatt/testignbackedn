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
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const sendOtp = () => {
    if (!name.trim()) return Alert.alert("Validation", "Name is required");
    if (!email.includes("@"))
      return Alert.alert("Validation", "Valid email required");
    if (phone.length < 10)
      return Alert.alert("Validation", "Valid phone number required");

    router.push({
      pathname: "/auth/otp",
      params: { name, email, phone },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Branding */}
      <View style={styles.header}>
        <Text style={styles.logo}>LEGAL-IQ</Text>
        <Text style={styles.tagline}>
          Intelligent Legal Case Management
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.title}>Sign in</Text>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Email Address"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

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
          <Text style={styles.buttonText}>Send OTP</Text>
        </Pressable>

        <Text style={styles.footer}>
          Secure OTP authentication • No password required
        </Text>
      </View>
    </View>
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
  footer: {
    marginTop: 14,
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
