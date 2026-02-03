import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import HeaderSection from "../components/HeaderSection";
import ProfileSidebar from "../components/ProfileSidebar";
import PriorityCases from "../components/PriorityCases";
import CalendarSection from "../components/CalendarSection";
import NewBookings from "../components/NewBookings";
import AllCasesButton from "../components/AllCasesButton";
import { usePriorityCases } from "./context/PriorityContext";

export default function Dashboard() {
  const { priorityCases } = usePriorityCases();
  const [showProfile, setShowProfile] = useState(false);

  const bookingRequests = [
    { id: 1, client: "Amit Kumar", caseType: "Divorce Case" },
    { id: 2, client: "Sneha Gupta", caseType: "Corporate Agreement" },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
       <HeaderSection
  lawyerName="Anubhav"
  isProfileOpen={showProfile}
  onProfilePress={() => setShowProfile((v) => !v)}
/>

        {priorityCases.length > 0 && (
          <PriorityCases cases={priorityCases} />
        )}

        <CalendarSection />
        <NewBookings requests={bookingRequests} />
        <AllCasesButton />
      </ScrollView>

      {/* 🔥 RIGHT SIDEBAR */}
      <ProfileSidebar
  visible={showProfile}
  onClose={() => setShowProfile(false)}
  onUploadImage={() => console.log("Upload image")}
  onPersonalDetails={() => console.log("Personal details")}
  onLogout={() => {
    setShowProfile(false);
    console.log("Logout");
  }}
/>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});
