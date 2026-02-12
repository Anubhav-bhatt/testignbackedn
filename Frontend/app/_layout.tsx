import { Stack, usePathname } from "expo-router";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomFloatingBar from "../components/BottomFloatingBar";
import { ThemeProvider } from "./context/ThemeContext";

export default function RootLayout() {
  const pathname = usePathname();
  // Hide bottom bar on auth screens or if looking at a specific file preview if needed
  // For now assuming all non-auth screens need it. 
  // Hide bottom bar ONLY on auth screens
  const hideBarOn = ["/auth", "/cases/new", "/cases/case-details"];
  const showBottomBar = !hideBarOn.some(path => pathname === path || pathname.startsWith(path + "?"));

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
          {showBottomBar && <BottomFloatingBar />}
        </View>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
