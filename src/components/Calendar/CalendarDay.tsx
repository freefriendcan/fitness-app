import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors, Spacing, Typography, Layout } from '@/constants';
import { isSameDay } from '@/utils';
import type { CalendarDay as CalendarDayType } from '@/utils';
import type { Workout } from '@/types';

interface CalendarDayProps {
  day: CalendarDayType;
  workouts: Workout[];
  onPress: (date: Date) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  workouts,
  onPress,
}) => {
  const completedWorkouts = workouts.filter((w) => w.completed).length;
  const incompleteWorkouts = workouts.filter((w) => !w.completed).length;
  const hasWorkouts = workouts.length > 0;

  // Lazy style creation to avoid circular dependency with Layout
  const styles = useMemo(
    () =>
      StyleSheet.create({
        day: {
          aspectRatio: 1,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: Layout.borderRadius.md,
          marginHorizontal: 1,
          marginVertical: 1,
        },
        dayText: {
          fontSize: Typography.fontSize.sm,
          color: Colors.text.primary,
          marginBottom: Spacing.xs,
        },
        indicators: {
          flexDirection: 'row',
          gap: 2,
        },
        indicator: {
          width: 4,
          height: 4,
          borderRadius: 2,
        },
        indicatorOnly: {
          width: 6,
        },
        indicatorCompleted: {
          backgroundColor: Colors.success[500],
        },
        indicatorIncomplete: {
          backgroundColor: Colors.warning[500],
        },
      }),
    []
  );

  const handlePress = () => {
    onPress(day.date);
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.day,
    };

    if (day.isSelected) {
      baseStyle.backgroundColor = Colors.primary[500];
    } else if (day.isToday) {
      baseStyle.backgroundColor = Colors.primary[50];
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = Colors.primary[500];
    } else if (!day.isCurrentMonth) {
      baseStyle.opacity = 0.3;
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    if (day.isSelected) {
      return {
        ...styles.dayText,
        color: Colors.white,
        fontWeight: Typography.fontWeight.semibold,
      };
    }
    if (day.isToday) {
      return {
        ...styles.dayText,
        color: Colors.primary[700],
        fontWeight: Typography.fontWeight.semibold,
      };
    }
    return styles.dayText;
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={getContainerStyle()}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>{day.date.getDate()}</Text>

      {hasWorkouts && (
        <View style={styles.indicators}>
          {completedWorkouts > 0 && (
            <View
              style={[
                styles.indicator,
                styles.indicatorCompleted,
                incompleteWorkouts === 0 && styles.indicatorOnly,
              ]}
            />
          )}
          {incompleteWorkouts > 0 && (
            <View
              style={[
                styles.indicator,
                styles.indicatorIncomplete,
                completedWorkouts === 0 && styles.indicatorOnly,
              ]}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};
