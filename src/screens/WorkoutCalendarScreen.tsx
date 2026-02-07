import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useWorkout } from '@/hooks';
import { Calendar, Card, Button } from '@/components';
import { Colors, Spacing, Typography, Layout } from '@/constants';
import { formatDate, isToday, startOfDay, endOfDay, navigateToActiveWorkout } from '@/utils';
import type { WorkoutsStackParamList } from '@/types';

type WorkoutCalendarScreenNavigationProp = NativeStackNavigationProp<
  WorkoutsStackParamList,
  'WorkoutHistory'
>;

interface Props {
  navigation: WorkoutCalendarScreenNavigationProp;
}

export const WorkoutCalendarScreen: React.FC<Props> = ({ navigation }) => {
  const { workouts, deleteWorkout } = useWorkout();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // Filter workouts for selected date
  const selectedDayWorkouts = useMemo(() => {
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);

    return workouts.filter((workout) => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= start && workoutDate <= end;
    });
  }, [workouts, selectedDate]);

  // Calculate stats for the selected day
  const dayStats = useMemo(() => {
    const totalWorkouts = selectedDayWorkouts.length;
    const completedWorkouts = selectedDayWorkouts.filter((w) => w.completed).length;
    const totalDuration = selectedDayWorkouts.reduce(
      (sum, w) => sum + w.duration,
      0
    );
    const totalExercises = selectedDayWorkouts.reduce(
      (sum, w) => sum + w.exercises.length,
      0
    );

    return {
      totalWorkouts,
      completedWorkouts,
      totalDuration,
      totalExercises,
    };
  }, [selectedDayWorkouts]);

  const handleWorkoutPress = useCallback(
    (workoutId: string) => {
      navigateToActiveWorkout(navigation, workoutId);
    },
    [navigation]
  );

  const handleDeleteWorkout = useCallback(
    (workoutId: string, workoutName: string) => {
      Alert.alert(
        'Delete Workout',
        `Are you sure you want to delete "${workoutName}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteWorkout(workoutId),
          },
        ]
      );
    },
    [deleteWorkout]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="calendar-outline"
        size={64}
        color={Colors.neutral[300]}
      />
      <Text style={styles.emptyTitle}>No Workouts This Day</Text>
      <Text style={styles.emptyText}>
        {isToday(selectedDate)
          ? "You haven't logged any workouts today"
          : `No workouts were logged on ${formatDate(selectedDate)}`}
      </Text>
    </View>
  );

  const renderWorkoutCard = (workout: any) => {
    const exerciseCount = workout.exercises.length;
    const completedSets = workout.exercises.reduce(
      (sum: number, exercise: any) =>
        sum + exercise.sets.filter((set: any) => set.completed).length,
      0
    );
    const totalSets = workout.exercises.reduce(
      (sum: number, exercise: any) => sum + exercise.sets.length,
      0
    );

    return (
      <TouchableOpacity
        key={workout.id}
        onPress={() => handleWorkoutPress(workout.id)}
        activeOpacity={0.7}
      >
        <Card variant="outlined" style={styles.workoutCard}>
          <View style={styles.workoutCardHeader}>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutTime}>
                <Ionicons name="time-outline" size={14} />
                {' '}
                {workout.duration} min
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                workout.completed
                  ? styles.statusCompleted
                  : styles.statusInProgress,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  workout.completed
                    ? styles.statusTextCompleted
                    : styles.statusTextInProgress,
                ]}
              >
                {workout.completed ? 'Done' : 'Active'}
              </Text>
            </View>
          </View>

          <View style={styles.workoutStats}>
            <View style={styles.stat}>
              <Ionicons
                name="fitness"
                size={16}
                color={Colors.text.secondary}
              />
              <Text style={styles.statText}>
                {exerciseCount} {exerciseCount === 1 ? 'Exercise' : 'Exercises'}
              </Text>
            </View>
            {totalSets > 0 && (
              <View style={styles.stat}>
                <Ionicons
                  name="barbell"
                  size={16}
                  color={Colors.text.secondary}
                />
                <Text style={styles.statText}>{completedSets}/{totalSets} sets</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteWorkout(workout.id, workout.name)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.danger[500]} />
          </TouchableOpacity>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar */}
        <Calendar
          workouts={workouts}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />

        {/* Selected Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateTitle}>
            {isToday(selectedDate) ? 'Today' : formatDate(selectedDate)}
          </Text>
        </View>

        {/* Day Stats */}
        {dayStats.totalWorkouts > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{dayStats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{dayStats.completedWorkouts}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{dayStats.totalDuration}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{dayStats.totalExercises}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
          </View>
        )}

        {/* Workout List */}
        <View style={styles.workoutList}>
          {selectedDayWorkouts.length > 0 ? (
            selectedDayWorkouts.map(renderWorkoutCard)
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  dateHeader: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  dateTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Layout.shadow.sm,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  workoutList: {
    gap: Spacing.md,
  },
  workoutCard: {
    position: 'relative',
  },
  workoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  workoutInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  workoutName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  workoutTime: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  statusCompleted: {
    backgroundColor: Colors.success[50],
  },
  statusInProgress: {
    backgroundColor: Colors.warning[50],
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  statusTextCompleted: {
    color: Colors.success[700],
  },
  statusTextInProgress: {
    color: Colors.warning[700],
  },
  workoutStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  deleteButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl3,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
