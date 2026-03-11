import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from 'expo-local-authentication';
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const [authRoute, setAuthRoute] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log("Checking Auth Status...");
      const userToken = await AsyncStorage.getItem("userToken");
      const userStatus = await AsyncStorage.getItem("userStatus");
      const biometricsEnabled = await AsyncStorage.getItem("biometricsEnabled");

      console.log("Storage state:", { hasToken: !!userToken, userStatus, biometricsEnabled });

      let targetRoute = "/auth/login";

      if (userToken) {
        if (userStatus === 'pending') {
          targetRoute = "/auth/pending";
        } else {
          targetRoute = "/dashboard";
        }

        // 🔐 Check Biometrics if enabled
        if (biometricsEnabled === "true") {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          
          console.log("Biometrics check:", { hasHardware, isEnrolled });

          if (hasHardware && isEnrolled) {
            setIsLocked(true);
            setPendingRoute(targetRoute);
            await authenticateBiometrics(targetRoute);
            return;
          } else {
            console.log("Biometrics enabled but hardware not available/enrolled. Bypassing.");
          }
        }
      }

      console.log("Navigating to:", targetRoute);
      setAuthRoute(targetRoute);
    } catch (error) {
      console.error("Critical Auth Error:", error);
      setAuthRoute("/auth/login");
    }
  };

  const authenticateBiometrics = async (target: string) => {
    try {
      console.log("Starting Biometric Auth...");
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock Legal-IQ",
        fallbackLabel: "Use Passcode",
      });

      console.log("Auth Result:", result);

      if (result.success) {
        setIsLocked(false);
        setAuthRoute(target);
      } else {
        setIsLocked(true);
      }
    } catch (e) {
      console.error("Biometric internal error:", e);
      setIsLocked(false);
      setAuthRoute(target); // Fallback to avoid lockout
    }
  };

  if (isLocked) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B1C2D", padding: 40 }}>
        <View style={{ 
          width: 80, height: 80, borderRadius: 40, backgroundColor: '#1D4ED820', 
          justifyContent: 'center', alignItems: 'center', marginBottom: 24 
        }}>
          <ActivityIndicator size="small" color="#1D4ED8" />
        </View>
        <Text style={{ color: "#FFF", fontSize: 20, fontWeight: '800', marginBottom: 8 }}>App Locked</Text>
        <Text style={{ color: "#9CA3AF", textAlign: 'center', marginBottom: 32 }}>
          Biometric authentication is required to access your legal dashboard.
        </Text>
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#1D4ED8', paddingVertical: 14, paddingHorizontal: 32, 
            borderRadius: 12, width: '100%', alignItems: 'center' 
          }}
          onPress={() => pendingRoute && authenticateBiometrics(pendingRoute)}
        >
          <Text style={{ color: '#FFF', fontWeight: '700' }}>Retry Unlock</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!authRoute) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B1C2D" }}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  return <Redirect href={authRoute as any} />;
}
