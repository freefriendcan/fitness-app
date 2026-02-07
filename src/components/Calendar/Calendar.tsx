import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Colors, Spacing, Typography, Layout } from '@/constants';
import {
  startOfDay,
  endOfDay,
  generateCalendarDays,
  addMonths,
  startOfMonth,
} from '@/utils';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDay } from './CalendarDay';
import type { Workout } from '@/types';

interface CalendarProps {
  workouts: Workout[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  initialMonth?: Date;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Calendar: React.FC<CalendarProps> = ({
  workouts,
  onDateSelect,
  selectedDate,
  initialMonth,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    initialMonth || startOfMonth(new Date())
  );

  // Lazy style creation to avoid circular dependency with Layout
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: Colors.white,
          borderRadius: 12,
          padding: Spacing.lg,
          ...Layout.shadow.sm,
        },
        weekdayHeader: {
          flexDirection: 'row',
          marginBottom: Spacing.sm,
        },
        weekdayCell: {
          flex: 1,
          alignItems: 'center',
          paddingVertical: Spacing.sm,
        },
        weekdayText: {
          fontSize: Typography.fontSize.xs,
          fontWeight: Typography.fontWeight.semibold,
          color: Colors.text.secondary,
          textTransform: 'uppercase',
        },
        week: {
          flexDirection: 'row',
          marginBottom: Spacing.xs,
        },
        calendarScroll: {
          marginTop: Spacing.xs,
        },
      }),
    []
  );

  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  const handleTodayPress = useCallback(() => {
    const today = startOfMonth(new Date());
    setCurrentMonth(today);
    onDateSelect(new Date());
  }, [onDateSelect]);

  const handleDayPress = useCallback(
    (date: Date) => {
      onDateSelect(date);
    },
    [onDateSelect]
  );

  // Group workouts by date for quick lookup
  const workoutsByDate = useMemo(() => {
    const grouped = new Map<string, Workout[]>();
    workouts.forEach((workout) => {
      const dateKey = workout.date.toDateString();
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(workout);
    });
    return grouped;
  }, [workouts]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    return generateCalendarDays(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      selectedDate
    );
  }, [currentMonth, selectedDate]);

  const getWorkoutsForDay = (date: Date): Workout[] => {
    const dateKey = date.toDateString();
    return workoutsByDate.get(dateKey) || [];
  };

  const renderWeekdayHeader = () => {
    return (
      <View style={styles.weekdayHeader}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderWeeks = () => {
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      const weekDays = calendarDays.slice(i, i + 7);
      weeks.push(
        <View key={i} style={styles.week}>
          {weekDays.map((day, index) => (
            <CalendarDay
              key={`${day.date.toISOString()}-${index}`}
              day={day}
              workouts={getWorkoutsForDay(day.date)}
              onPress={handleDayPress}
            />
          ))}
        </View>
      );
    }
    return weeks;
  };

  return (
    <View style={styles.container}>
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onTodayPress={handleTodayPress}
      />

      {renderWeekdayHeader()}

      <ScrollView style={styles.calendarScroll} scrollEnabled={false}>
        {renderWeeks()}
      </ScrollView>
    </View>
  );
};
