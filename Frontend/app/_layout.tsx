import { Stack } from "expo-router";
import { PriorityProvider } from "./context/PriorityContext";

export default function Layout() {
  return (
    <PriorityProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PriorityProvider>
  );
}
