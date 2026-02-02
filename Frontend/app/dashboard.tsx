import { ScrollView, StyleSheet, SafeAreaView } from "react-native";

import HeaderSection from "../components/HeaderSection";
import PriorityCases from "../components/PriorityCases";
import CalendarSection from "../components/CalendarSection";
import NewBookings from "../components/NewBookings";
import AllCasesButton from "../components/AllCasesButton";

import { usePriorityCases } from "./context/PriorityContext";

/* =====================
   DASHBOARD
===================== */
export default function Dashboard() {
  const { priorityCases } = usePriorityCases();

  /* demo booking data (unchanged) */
  const bookingRequests = [
    { id: 1, client: "Amit Kumar", caseType: "Divorce Case" },
    { id: 2, client: "Sneha Gupta", caseType: "Corporate Agreement" },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <HeaderSection lawyerName="Anubhav" />

        {/* 🔥 AUTO-POPULATED PRIORITY CASES */}
        {priorityCases.length > 0 && (
          <PriorityCases cases={priorityCases} />
        )}

        <CalendarSection />

        <NewBookings requests={bookingRequests} />

        <AllCasesButton />
      </ScrollView>
    </SafeAreaView>
  );
}

/* =====================
   STYLES
===================== */
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
