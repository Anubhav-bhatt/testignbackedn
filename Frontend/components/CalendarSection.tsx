import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useTheme } from "../app/context/ThemeContext";



import { DateData } from 'react-native-calendars';

export default function CalendarSection({
  onSelectDate,
  onDayLongPress,
  events = {}
}: {
  onSelectDate: (date: string) => void;
  onDayLongPress?: (date: string) => void;
  events?: Record<string, any[]>;
}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { colors, theme } = useTheme();

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    onSelectDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        hideExtraDays
        enableSwipeMonths
        key={theme} // Force re-render on theme change
        dayComponent={({ date }: { date?: DateData }) => {
          if (!date) return <View />;

          const dayEvents = events[date.dateString];
          const hasEvents = dayEvents && dayEvents.length > 0;
          const firstEvent = hasEvents ? dayEvents[0] : null;
          const isSelected = date.dateString === selectedDate;

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleDayPress(date)}
              onLongPress={() => onDayLongPress && onDayLongPress(date.dateString)}
              style={styles.dayCell}
            >
              {/* FLOATING NAME (ABSOLUTE) */}
              {firstEvent && (
                <View style={[styles.nameBubble, { backgroundColor: theme === 'dark' ? colors.surface : '#FFFFFF', shadowColor: theme === 'dark' ? "#000" : "#000" }]}>
                  <Text style={[styles.nameText, { color: colors.text }]} numberOfLines={1}>
                    {firstEvent.client || firstEvent.title.split(':')[0]}
                  </Text>
                  {/* Tooltip Caret */}
                  <View style={[
                    styles.caret,
                    { borderTopColor: theme === 'dark' ? colors.surface : '#FFFFFF' }
                  ]} />
                </View>
              )}

              {/* 3D PIN */}
              {firstEvent && (
                <View style={styles.pinWrapper}>
                  <View style={styles.pinHead} />
                  <View style={styles.pinStem} />
                  <View style={styles.pinShadow} />
                </View>
              )}

              {/* DAY NUMBER */}
              <View
                style={[
                  styles.dayCircle,
                  isSelected && { backgroundColor: theme === 'dark' ? colors.primary + '30' : '#EEF2FF' },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: colors.text },
                    isSelected && { color: colors.primary, fontWeight: '700' },
                  ]}
                >
                  {date.day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        theme={{
          calendarBackground: "transparent",
          todayTextColor: colors.primary,
          arrowColor: colors.primary,
          monthTextColor: colors.primary,
          textMonthFontWeight: "bold",
          dayTextColor: colors.text,
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    marginBottom: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
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
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,

    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },

  nameText: {
    fontSize: 8,
    fontWeight: "600",
  },
  caret: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    marginLeft: -4,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
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

  dayText: {
    fontSize: 13,
  },
});
