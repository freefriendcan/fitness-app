import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useWorkout, useExercise } from '@/hooks';
import { Card, Input, Button } from '@/components';
import { Colors, Spacing, Typography, Layout } from '@/constants';
import { Routes } from '@/constants';
import { generateId } from '@/utils';
import type { WorkoutsStackParamList, Exercise } from '@/types';

type EditWorkoutScreenNavigationProp = NativeStackNavigationProp<
  WorkoutsStackParamList,
  'EditWorkout'
>;

type RouteParams = RouteProp<WorkoutsStackParamList, 'EditWorkout'>;

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  instructions?: string;
}

export const EditWorkoutScreen: React.FC = () => {
  const styles = useMemo(() => getStyles(), []);

  const navigation = useNavigation<EditWorkoutScreenNavigationProp>();
  const route = useRoute<RouteParams>();
  const { workoutId } = route.params;
  const { getWorkoutById, updateWorkout } = useWorkout();
  const { exercises: libraryExercises } = useExercise();

  const [workoutName, setWorkoutName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const workout = getWorkoutById(workoutId);

  useEffect(() => {
    if (workout) {
      setWorkoutName(workout.name);
      const workoutExercises: WorkoutExercise[] = workout.exercises.map((ex) => ({
        id: generateId(),
        exerciseId: ex.id,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        equipment: ex.equipment,
        instructions: ex.instructions,
      }));
      setSelectedExercises(workoutExercises);
      setIsLoading(false);
    }
  }, [workout]);

  const handleAddExercise = (exercise: Exercise) => {
    const workoutExercise: WorkoutExercise = {
      id: generateId(),
      exerciseId: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      instructions: exercise.instructions,
    };
    setSelectedExercises([...selectedExercises, workoutExercise]);
    setShowExerciseLibrary(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex.id !== exerciseId));
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    const newExercises = [...selectedExercises];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < selectedExercises.length) {
      const temp = newExercises[index];
      newExercises[index] = newExercises[newIndex];
      newExercises[newIndex] = temp;
      setSelectedExercises(newExercises);
    }
  };

  const handleSaveWorkout = () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    // Preserve the original sets from the workout
    const exercises: Exercise[] = selectedExercises.map((we) => {
      const originalExercise = workout?.exercises.find((ex) => ex.id === we.exerciseId);
      return {
        id: we.exerciseId,
        name: we.name,
        muscleGroup: we.muscleGroup as any,
        equipment: we.equipment as any,
        sets: originalExercise?.sets || [],
        instructions: we.instructions,
        notes: originalExercise?.notes,
      };
    });

    updateWorkout(workoutId, {
      name: workoutName.trim(),
      exercises,
    });

    Alert.alert('Success', 'Workout updated!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleDeleteWorkout = () => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // We'll need to add delete functionality to the useWorkout hook
            Alert.alert('Info', 'Delete functionality will be added to the workout store');
          },
        },
      ]
    );
  };

  const renderExerciseCard = (exercise: WorkoutExercise, index: number) => {
    const originalExercise = workout?.exercises.find((ex) => ex.id === exercise.exerciseId);
    const hasSets = originalExercise && originalExercise.sets.length > 0;

    return (
      <Card key={exercise.id} variant="outlined" style={styles.exerciseCard}>
        <View style={styles.exerciseCardHeader}>
          <View style={styles.exerciseNumber}>
            <Text style={styles.exerciseNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <View style={styles.exerciseTags}>
              <Text style={styles.exerciseTag}>{exercise.muscleGroup}</Text>
              <Text style={styles.exerciseTag}>{exercise.equipment}</Text>
            </View>
            {hasSets && (
              <Text style={styles.setsInfo}>
                {originalExercise.sets.length} set{originalExercise.sets.length !== 1 ? 's' : ''} logged
              </Text>
            )}
          </View>
        </View>
        <View style={styles.exerciseActions}>
          <View style={styles.reorderButtons}>
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={() => handleMoveExercise(index, 'up')}
              disabled={index === 0}
            >
              <Ionicons
                name="chevron-up"
                size={24}
                color={index === 0 ? Colors.neutral[300] as any : Colors.primary[500] as any}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={() => handleMoveExercise(index, 'down')}
              disabled={index === selectedExercises.length - 1}
            >
              <Ionicons
                name="chevron-down"
                size={24}
                color={index === selectedExercises.length - 1 ? Colors.neutral[300] as any : Colors.primary[500] as any}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveExercise(exercise.id)}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.danger[500]} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const renderExerciseLibrary = () => {
    if (libraryExercises.length === 0) {
      return (
        <View style={styles.emptyLibrary}>
          <Ionicons name="barbell" size={48} color={Colors.neutral[300]} />
          <Text style={styles.emptyLibraryText}>No exercises in library</Text>
          <Text style={styles.emptyLibrarySubtext}>
            Add exercises to your library first
          </Text>
        </View>
      );
    }

    // Filter out exercises that are already in the workout
    const availableExercises = libraryExercises.filter(
      (ex) => !selectedExercises.some((we) => we.exerciseId === ex.id)
    );

    if (availableExercises.length === 0) {
      return (
        <View style={styles.emptyLibrary}>
          <Ionicons name="checkmark-circle" size={48} color={Colors.success[500]} />
          <Text style={styles.emptyLibraryText}>All exercises added</Text>
          <Text style={styles.emptyLibrarySubtext}>
            You've added all available exercises
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.exerciseLibraryList}>
        {availableExercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={styles.libraryExerciseItem}
            onPress={() => handleAddExercise(exercise)}
            activeOpacity={0.7}
          >
            <View style={styles.libraryExerciseInfo}>
              <Text style={styles.libraryExerciseName}>{exercise.name}</Text>
              <View style={styles.libraryExerciseTags}>
                <Text style={styles.libraryExerciseTag}>{exercise.muscleGroup}</Text>
                <Text style={styles.libraryExerciseTag}>{exercise.equipment}</Text>
              </View>
            </View>
            <Ionicons name="add-circle" size={28} color={Colors.success[500]} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={Colors.danger[500]} />
        <Text style={styles.errorText}>Workout not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Workout Name */}
        <Card variant="outlined" style={styles.section}>
          <Text style={styles.label}>Workout Name</Text>
          <Input
            placeholder="Enter workout name..."
            value={workoutName}
            onChangeText={setWorkoutName}
          />
        </Card>

        {/* Workout Info */}
        {workout.date && (
          <Card variant="outlined" style={styles.section}>
            <Text style={styles.sectionTitle}>Workout Info</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created:</Text>
              <Text style={styles.infoValue}>
                {workout.date.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duration:</Text>
              <Text style={styles.infoValue}>{workout.duration} minutes</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text
                style={[
                  styles.infoValue,
                  workout.completed ? styles.completed : styles.inProgress,
                ]}
              >
                {workout.completed ? 'Completed' : 'In Progress'}
              </Text>
            </View>
          </Card>
        )}

        {/* Add Exercises */}
        <Card variant="outlined" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <Text style={styles.exerciseCount}>
              {selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {!showExerciseLibrary ? (
            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={() => setShowExerciseLibrary(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={24} color={Colors.primary[500]} />
              <Text style={styles.addExerciseText}>Add Exercise</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.exerciseLibrary}>
              <View style={styles.libraryHeader}>
                <Text style={styles.libraryTitle}>Select Exercise</Text>
                <TouchableOpacity onPress={() => setShowExerciseLibrary(false)}>
                  <Ionicons name="close" size={24} color={Colors.text.secondary} />
                </TouchableOpacity>
              </View>
              {renderExerciseLibrary()}
            </View>
          )}

          {selectedExercises.length > 0 && !showExerciseLibrary && (
            <View style={styles.exercisesList}>
              {selectedExercises.map((exercise, index) =>
                renderExerciseCard(exercise, index)
              )}
            </View>
          )}
        </Card>

        {/* Danger Zone */}
        <Card variant="outlined" style={styles.section}>
          <Text style={styles.sectionTitleDanger}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteWorkout}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.danger[500]} />
            <Text style={styles.deleteButtonText}>Delete Workout</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          onPress={handleSaveWorkout}
          variant="primary"
          fullWidth
          disabled={!workoutName.trim() || selectedExercises.length === 0}
        >
          Save Changes
        </Button>
      </View>
    </View>
  );
};

const getStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl2,
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xl2,
  },
  section: {
    padding: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  sectionTitleDanger: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.danger[500],
    marginBottom: Spacing.md,
  },
  exerciseCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  infoLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  completed: {
    color: Colors.success[500],
  },
  inProgress: {
    color: Colors.warning[500],
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: Layout.borderRadius.md,
    borderStyle: 'dashed',
  },
  addExerciseText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[500],
  },
  exerciseLibrary: {
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
  },
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.neutral[100],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  libraryTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  exerciseLibraryList: {
    maxHeight: 300,
  },
  libraryExerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  libraryExerciseInfo: {
    flex: 1,
  },
  libraryExerciseName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  libraryExerciseTags: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  libraryExerciseTag: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.sm,
  },
  emptyLibrary: {
    alignItems: 'center',
    paddingVertical: Spacing.xl2,
  },
  emptyLibraryText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  emptyLibrarySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  exercisesList: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  exerciseCard: {
    padding: Spacing.md,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  exerciseTags: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  exerciseTag: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.sm,
  },
  setsInfo: {
    fontSize: Typography.fontSize.xs,
    color: Colors.success[600],
    fontWeight: Typography.fontWeight.medium,
  },
  exerciseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  reorderButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  reorderButton: {
    padding: Spacing.xs,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.danger[500],
    borderRadius: Layout.borderRadius.md,
  },
  deleteButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.danger[500],
  },
  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl2,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
});
