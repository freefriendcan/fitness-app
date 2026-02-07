import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, CardHeader, CardBody, CardFooter, Button } from '@/components';
import { useWorkout } from '@/hooks/useWorkout';
import { Routes, Colors, Spacing, Typography, Layout } from '@/constants';
import { formatDate, formatTime, formatDurationMinutes, formatVolume, formatWeight, navigateToEditWorkout } from '@/utils';
import type { HomeStackParamList } from '@/navigation/types';
import type { Set } from '@/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'WorkoutDetail'>;

export const WorkoutDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { workoutId } = route.params;
  const { getWorkoutById, deleteWorkout } = useWorkout();
  const workout = getWorkoutById(workoutId);

  React.useLayoutEffect(() => {
    if (workout) {
      navigation.setOptions({
        title: workout.name,
      });
    }
  }, [navigation, workout]);

  if (!workout) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Workout not found</Text>
      </View>
    );
  }

  // Calculate workout statistics
  const totalVolume = React.useMemo(() => {
    return workout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce((exerciseTotal, set) => {
          return set.completed ? exerciseTotal + set.weight * set.reps : exerciseTotal;
        }, 0)
      );
    }, 0);
  }, [workout]);

  const completedSets = React.useMemo(() => {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.filter((set) => set.completed).length;
    }, 0);
  }, [workout]);

  const totalSets = React.useMemo(() => {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.length;
    }, 0);
  }, [workout]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteWorkout(workoutId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    // Navigate to edit workout screen
    navigateToEditWorkout(navigation, workoutId);
  };

  const renderSet = (set: Set, index: number) => (
    <View key={set.id} style={styles.setRow}>
      <Text style={styles.setNumber}>{index + 1}</Text>
      <Text style={[styles.setValue, !set.completed && styles.setIncomplete]}>
        {set.weight > 0 ? formatWeight(set.weight, 'metric') : '-'}
      </Text>
      <Text style={[styles.setValue, !set.completed && styles.setIncomplete]}>
        {set.reps}
      </Text>
      <View style={[styles.completedBadge, set.completed && styles.completedBadgeDone]}>
        <Text style={[styles.completedText, set.completed && styles.completedTextDone]}>
          {set.completed ? '✓' : '○'}
        </Text>
      </View>
    </View>
  );

  const renderExercise = (exercise: typeof workout.exercises[0], index: number) => (
    <Card key={exercise.id} variant="outlined" padding="md" style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>
          {index + 1}. {exercise.name}
        </Text>
        <Text style={styles.exerciseMeta}>{exercise.muscleGroup}</Text>
      </View>

      {exercise.sets.length > 0 ? (
        <View style={styles.setsContainer}>
          <View style={styles.setsHeader}>
            <Text style={styles.setHeader}>Set</Text>
            <Text style={styles.setHeader}>Weight</Text>
            <Text style={styles.setHeader}>Reps</Text>
            <Text style={styles.setHeader}>Done</Text>
          </View>
          {exercise.sets.map((set, setIndex) => renderSet(set, setIndex))}
        </View>
      ) : (
        <Text style={styles.noSetsText}>No sets logged</Text>
      )}

      {exercise.notes && (
        <Text style={styles.exerciseNotes}>Note: {exercise.notes}</Text>
      )}
    </Card>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Workout Header */}
      <Card>
        <CardHeader>
          <View style={styles.headerRow}>
            <View style={styles.headerInfo}>
              <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>
              <Text style={styles.workoutTime}>{formatTime(workout.date)}</Text>
            </View>
            <View style={[styles.statusBadge, workout.completed && styles.statusCompleted]}>
              <Text style={[styles.statusText, workout.completed && styles.statusTextCompleted]}>
                {workout.completed ? 'Completed' : 'In Progress'}
              </Text>
            </View>
          </View>
        </CardHeader>

        <CardBody>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDurationMinutes(workout.duration)}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatVolume(totalVolume)}</Text>
              <Text style={styles.statLabel}>Volume</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {completedSets}/{totalSets}
              </Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
          </View>
        </CardBody>

        {workout.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{workout.notes}</Text>
          </View>
        )}
      </Card>

      {/* Exercises Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercises</Text>
        {workout.exercises.length > 0 ? (
          workout.exercises.map((exercise, index) => renderExercise(exercise, index))
        ) : (
          <Card variant="outlined" padding="lg">
            <Text style={styles.emptyText}>No exercises in this workout</Text>
          </Card>
        )}
      </View>

      {/* Actions */}
      <Card style={styles.actionsCard}>
        <CardFooter>
          <Button
            onPress={handleEdit}
            variant="outline"
            style={styles.actionButton}
          >
            Edit Workout
          </Button>
          <Button
            onPress={handleDelete}
            variant="outline"
            style={styles.deleteButton}
          >
            Delete
          </Button>
        </CardFooter>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  workoutDate: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  workoutTime: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.neutral[200],
  },
  statusCompleted: {
    backgroundColor: Colors.success[100],
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.semibold,
  },
  statusTextCompleted: {
    color: Colors.success[700],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: Typography.fontSize.xl2,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border.light,
  },
  notesSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  notesLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  notesText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    lineHeight: Typography.lineHeight.relaxed,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  exerciseCard: {
    marginBottom: Spacing.md,
  },
  exerciseHeader: {
    marginBottom: Spacing.md,
  },
  exerciseName: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  exerciseMeta: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  setsContainer: {
    gap: Spacing.sm,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  setHeader: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  setNumber: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },
  setValue: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  setIncomplete: {
    color: Colors.text.tertiary,
  },
  completedBadge: {
    flex: 1,
    alignItems: 'center',
  },
  completedBadgeDone: {
    // Reserved for future styling
  },
  completedText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.tertiary,
  },
  completedTextDone: {
    color: Colors.success[500],
  },
  noSetsText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  exerciseNotes: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    padding: Spacing.lg,
  },
  actionsCard: {
    marginTop: Spacing.xl,
  },
  actionButton: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  deleteButton: {
    flex: 1,
    borderColor: Colors.danger[500],
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xl2,
  },
});
