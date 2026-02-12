import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { createReminder, deleteReminder, getCases, getReminders } from "../api";
import CalendarSection from "../components/CalendarSection";
import { useTheme } from "./context/ThemeContext";

type Event = {
  id?: string;
  title: string;
  time: string;
  type: string;
  caseId?: string;
  client?: string;
};

export default function Calendar() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventsData, setEventsData] = useState<Record<string, Array<Event>>>({});
  const [loading, setLoading] = useState(true);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderTime, setReminderTime] = useState("09:00 AM");

  // Helper to parse "15 Feb, 2026" to "2026-02-15"
  // Helper to parse dates to "YYYY-MM-DD"
  const parseToISODate = (dateStr: string) => {
    if (!dateStr || dateStr === 'TBD') return null;

    // 1. Try if it is already YYYY-MM-DD
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (isoRegex.test(dateStr)) return dateStr;

    try {
      // 2. Try explicit DD Mon YYYY parsing (e.g. 15 Feb, 2026)
      const parts = dateStr.replace(',', '').split(' ');
      if (parts.length >= 3) {
        const day = parts[0].padStart(2, '0');
        const monthMap: Record<string, string> = {
          Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
          Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
        };
        const monthStr = parts[1].substring(0, 3);
        const year = parts[2];

        if (monthMap[monthStr] && !isNaN(Number(year)) && !isNaN(Number(day))) {
          return `${year}-${monthMap[monthStr]}-${day}`;
        }
      }

      // 3. Fallback to native Date parsing
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }

      return null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const fetchAndMapEvents = async () => {
      try {
        setLoading(true);
        const [cases, reminders] = await Promise.all([getCases(), getReminders()]);
        const mapped: Record<string, Array<Event>> = {};

        // Map cases
        cases.forEach((c: any) => {
          const isoDate = parseToISODate(c.nextHearing);
          if (isoDate) {
            if (!mapped[isoDate]) mapped[isoDate] = [];
            mapped[isoDate].push({
              id: c.id,
              title: `${c.category} Hearing: ${c.title}`,
              time: "10:00 AM",
              type: "hearing",
              caseId: c.id,
              client: c.clientName
            });
          }
        });

        // Map reminders
        reminders.forEach((r: any) => {
          if (r.date) {
            if (!mapped[r.date]) mapped[r.date] = [];
            mapped[r.date].push({
              id: r.id,
              title: r.title,
              time: r.time || "09:00 AM",
              type: "reminder",
            });
          }
        });

        setEventsData(mapped);
      } catch (err) {
        console.log("Error fetching calendar data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndMapEvents();
  }, []);

  const handleAddReminder = async () => {
    if (!reminderTitle.trim()) {
      Alert.alert("Error", "Please enter a reminder title");
      return;
    }
    try {
      await createReminder({
        title: reminderTitle,
        date: selectedDate,
        time: reminderTime
      });
      setShowReminderModal(false);
      setReminderTitle("");
      // Refresh
      const [cases, reminders] = await Promise.all([getCases(), getReminders()]);
      const mapped: Record<string, Array<Event>> = {};
      cases.forEach((c: any) => {
        const isoDate = parseToISODate(c.nextHearing);
        if (isoDate) {
          if (!mapped[isoDate]) mapped[isoDate] = [];
          mapped[isoDate].push({
            id: c.id,
            title: `${c.category} Hearing: ${c.title}`,
            time: "10:00 AM",
            type: "hearing",
            caseId: c.id,
            client: c.clientName
          });
        }
      });
      reminders.forEach((r: any) => {
        if (r.date) {
          if (!mapped[r.date]) mapped[r.date] = [];
          mapped[r.date].push({
            id: r.id,
            title: r.title,
            time: r.time || "09:00 AM",
            type: "reminder",
          });
        }
      });
      setEventsData(mapped);
    } catch (err) {
      Alert.alert("Error", "Could not create reminder");
    }
  };

  const handleLongPress = (event: Event) => {
    if (event.type === 'reminder') {
      Alert.alert(
        "Delete Reminder",
        "Are you sure you want to delete this reminder?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteReminder(event.id!);
                // Refresh
                const reminders = await getReminders();
                const cases = await getCases();
                const mapped: Record<string, Array<Event>> = {};
                cases.forEach((c: any) => {
                  const isoDate = parseToISODate(c.nextHearing);
                  if (isoDate) {
                    if (!mapped[isoDate]) mapped[isoDate] = [];
                    mapped[isoDate].push({
                      id: c.id,
                      title: `${c.category} Hearing: ${c.title}`,
                      time: "10:00 AM",
                      type: "hearing",
                      caseId: c.id,
                      client: c.clientName
                    });
                  }
                });
                reminders.forEach((r: any) => {
                  if (r.date) {
                    if (!mapped[r.date]) mapped[r.date] = [];
                    mapped[r.date].push({
                      id: r.id,
                      title: r.title,
                      time: r.time || "09:00 AM",
                      type: "reminder",
                    });
                  }
                });
                setEventsData(mapped);
              } catch (err) {
                Alert.alert("Error", "Could not delete reminder");
              }
            }
          }
        ]
      );
    }
  };

  const events = eventsData[selectedDate] || [];

  const handleEventPress = (event: Event) => {
    if (event.caseId) {
      router.push({
        pathname: "/cases/summary",
        params: { id: event.caseId }
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ backgroundColor: theme === 'dark' ? colors.surface : '#FFF' }} edges={['top']} />

      {/* FIXED HEADER */}
      <View style={[styles.header, { backgroundColor: theme === 'dark' ? colors.surface : '#FFF', marginBottom: 0 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Schedule</Text>
            <Text style={[styles.subTitle, { color: colors.textSecondary }]}>Manage your hearings & daily tasks</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowReminderModal(true)}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

        <View style={[styles.calendarWrapper, { backgroundColor: theme === 'dark' ? colors.surface : '#FFF' }]}>
          <CalendarSection
            onSelectDate={setSelectedDate}
            onDayLongPress={(date) => {
              setSelectedDate(date);
              setShowReminderModal(true);
            }}
            events={eventsData}
          />
        </View>

        <View style={styles.eventsSection}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>
            Agenda for {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>

          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : events.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name="calendar-clear-outline" size={40} color={colors.textSecondary} />
              </View>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No commitments for this day</Text>
              <TouchableOpacity
                onPress={() => setShowReminderModal(true)}
                style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primary + '15', borderRadius: 12 }}
              >
                <Text style={{ color: colors.primary, fontWeight: '700' }}>+ Add Reminder</Text>
              </TouchableOpacity>
            </View>
          ) : (
            events.map((event, index) => (
              <TouchableOpacity
                key={event.id || index}
                activeOpacity={0.7}
                onPress={() => handleEventPress(event)}
                onLongPress={() => handleLongPress(event)}
                style={[styles.card, { backgroundColor: theme === 'dark' ? colors.surface : '#FFF' }]}
              >
                <View style={[styles.indicator,
                { backgroundColor: event.type === 'hearing' ? '#EF4444' : event.type === 'meeting' ? '#3B82F6' : colors.primary }
                ]} />
                <View style={styles.cardContent}>
                  <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.eventTime, { color: colors.textSecondary }]}>{event.time}</Text>

                    <View style={[styles.badge, { backgroundColor: theme === 'dark' ? colors.background : '#F1F5F9' }]}>
                      <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{event.type.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.border} />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* REMINDER MODAL */}
        <Modal
          visible={showReminderModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowReminderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFF' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Create Reminder</Text>
                <TouchableOpacity onPress={() => setShowReminderModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>What needs to be done?</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: theme === 'dark' ? colors.background : '#F8FAFC' }]}
                  placeholder="e.g. Call client for evidence"
                  placeholderTextColor={colors.textSecondary}
                  value={reminderTitle}
                  onChangeText={setReminderTitle}
                  autoFocus
                />

                <Text style={[styles.label, { color: colors.textSecondary, marginTop: 20 }]}>Time (Optional)</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: theme === 'dark' ? colors.background : '#F8FAFC' }]}
                  placeholder="09:00 AM"
                  placeholderTextColor={colors.textSecondary}
                  value={reminderTime}
                  onChangeText={setReminderTime}
                />

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={handleAddReminder}
                >
                  <Text style={styles.saveButtonText}>Set Reminder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    zIndex: 10,
  },
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.6 },
  subTitle: { marginTop: 4, fontSize: 15, fontWeight: '500' },
  calendarWrapper: {
    marginVertical: 24,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  eventsSection: { paddingHorizontal: 24 },
  sectionHeader: { fontSize: 18, fontWeight: "800", marginBottom: 20, letterSpacing: -0.5 },
  card: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    alignItems: "center",
  },
  indicator: { width: 5, height: 44, borderRadius: 3, marginRight: 16 },
  cardContent: { flex: 1 },
  eventTitle: { fontSize: 17, fontWeight: "700", marginBottom: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  eventTime: { fontSize: 14, fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 10 },
  badgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyText: { fontSize: 15, fontWeight: "600" },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  addButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, minHeight: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalBody: {},
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  input: { height: 56, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, fontSize: 16, fontWeight: '500' },
  saveButton: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 32 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
