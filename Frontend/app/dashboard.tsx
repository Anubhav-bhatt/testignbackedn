import { ScrollView, StyleSheet, SafeAreaView } from "react-native";

import HeaderSection from "../components/HeaderSection";
import PriorityCases, { PriorityCase } from "../components/PriorityCases";
import CalendarSection from "../components/CalendarSection";
import NewBookings, { BookingRequest } from "../components/NewBookings";
import AllCasesButton from "../components/AllCasesButton";

export default function Dashboard() {
  const priorityCases: PriorityCase[] = [
    {
      id: 1,
      title: "Property Dispute",
      client: "Rohit Sharma",
      hearingDate: "2026-01-30",
    },
    {
      id: 2,
      title: "Cheque Bounce",
      client: "Neha Verma",
      hearingDate: "2026-02-01",
    },
  ];

  const bookingRequests: BookingRequest[] = [
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
        <PriorityCases cases={priorityCases} />
        <CalendarSection />
        <NewBookings requests={bookingRequests} />
        <AllCasesButton />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ✅ STYLES — THIS WAS MISSING */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
    paddingBottom: 40, // prevents last button from being cut off
  },
});
