import { View, Text, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { useState } from "react";

const caseByDate: Record<string, { name: string }> = {
  "2026-01-29": { name: "Rohit" },
  "2026-01-30": { name: "Neha" },
  "2026-02-01": { name: "Amit" },
};

export default function CalendarSection() {
  const [selectedDate, setSelectedDate] = useState("2026-01-29");

  return (
    <View style={styles.container}>
      <View style={styles.floatingCard}>
        <Text style={styles.title}>Case Calendar</Text>

        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          hideExtraDays
          enableSwipeMonths
          dayComponent={({ date }) => {
            const caseItem = caseByDate[date.dateString];
            const isSelected = date.dateString === selectedDate;

            return (
              <View style={styles.dayCell}>
                {/* FLOATING NAME (ABSOLUTE) */}
                {caseItem && (
                  <View style={styles.nameBubble}>
                    <Text style={styles.nameText}>
                      {caseItem.name}
                    </Text>
                  </View>
                )}

                {/* 3D PIN (ABSOLUTE) */}
                {caseItem && (
                  <View style={styles.pinWrapper}>
                    <View style={styles.pinHead} />
                    <View style={styles.pinStem} />
                    <View style={styles.pinShadow} />
                  </View>
                )}

                {/* DAY NUMBER (NORMAL FLOW) */}
                <View
                  style={[
                    styles.dayCircle,
                    isSelected && styles.selectedDay,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedText,
                    ]}
                  >
                    {date.day}
                  </Text>
                </View>
              </View>
            );
          }}
          theme={{
            calendarBackground: "transparent",
            todayTextColor: "#1E3A8A",
          }}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 8,
  },

  floatingCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#020617",
  },

  /* IMPORTANT: DO NOT CHANGE HEIGHT */
  dayCell: {
    width: 32,
    height: 44, // ⬅️ SAME AS DEFAULT CALENDAR CELL
    alignItems: "center",
    justifyContent: "center",
  },

  /* NAME FLOATING ABOVE (ABSOLUTE) */
  nameBubble: {
    position: "absolute",
    top: -10, // floats upward, not expanding layout
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,

    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },

  nameText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#020617",
  },

  /* PIN (ABSOLUTE) */
  pinWrapper: {
    position: "absolute",
    top: 14, // stays inside cell
    alignItems: "center",
    zIndex: 5,
  },

  pinHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DC2626",

    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  pinStem: {
    width: 2,
    height: 8,
    backgroundColor: "#DC2626",
    marginTop: -1,
  },

  pinShadow: {
    width: 8,
    height: 3,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 4,
    marginTop: 1,
  },

  /* DAY */
  dayCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedDay: {
    backgroundColor: "#EEF2FF",
  },

  dayText: {
    fontSize: 13,
    color: "#020617",
  },

  selectedText: {
    color: "#1E3A8A",
    fontWeight: "700",
  },
});
