import { Stack } from "expo-router";
import { PriorityProvider } from "./context/PriorityContext";

export default function Layout() {
  return (
    <PriorityProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="priority-cases" />
        <Stack.Screen name="cases/index" />
        <Stack.Screen name="cases/case-details" />
        <Stack.Screen name="cases/ai" />   {/* 👈 REQUIRED */}
      </Stack>
    </PriorityProvider>
  );
}
