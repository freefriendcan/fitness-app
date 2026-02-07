import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useWorkout, useExercise } from '@/hooks';
import { Card, Input, Button } from '@/components';
import { Colors, Spacing, Typography, Layout } from '@/constants';
import { Routes } from '@/constants';
import { generateId, navigateToActiveWorkout } from '@/utils';
import type { WorkoutsStackParamList, Exercise } from '@/types';

type CreateWorkoutScreenNavigationProp = NativeStackNavigationProp<
  WorkoutsStackParamList,
  'CreateWorkout'
>;

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  instructions?: string;
}

export const CreateWorkoutScreen: React.FC = () => {
  const styles = useMemo(() => getStyles(), []);

  const navigation = useNavigation<CreateWorkoutScreenNavigationProp>();
  const { createQuickWorkout, addTemplate } = useWorkout();
  const { exercises: libraryExercises } = useExercise();

  const [workoutName, setWorkoutName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [startWorkout, setStartWorkout] = useState(false);

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
      [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
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

    // Create workout from selected exercises
    const exercises: Exercise[] = selectedExercises.map((we) => ({
      id: we.exerciseId,
      name: we.name,
      muscleGroup: we.muscleGroup as any,
      equipment: we.equipment as any,
      sets: [],
      instructions: we.instructions,
    }));

    if (saveAsTemplate) {
      // Save as template
      const template = {
        id: generateId(),
        name: workoutName.trim(),
        exercises: exercises.map((ex) => ({
          id: ex.id,
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          equipment: ex.equipment,
          instructions: ex.instructions,
        })),
        createdAt: new Date(),
      };
      addTemplate(template);
      Alert.alert('Success', 'Workout template saved!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      // Create workout
      const workout = createQuickWorkout(workoutName.trim(), exercises);

      if (startWorkout) {
        // Navigate to active workout
        navigateToActiveWorkout(navigation, workout.id);
        return;
      } else {
        // Just save and go back
        Alert.alert('Success', 'Workout created!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    }
  };

  const renderExerciseCard = (exercise: WorkoutExercise, index: number) => (
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

    return (
      <ScrollView style={styles.exerciseLibraryList}>
        {libraryExercises.map((exercise) => (
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

        {/* Options */}
        <Card variant="outlined" style={styles.section}>
          <Text style={styles.sectionTitle}>Options</Text>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSaveAsTemplate(!saveAsTemplate)}
            activeOpacity={0.7}
          >
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Save as Template</Text>
              <Text style={styles.optionDescription}>
                Save this workout for future use
              </Text>
            </View>
            <View
              style={[
                styles.toggle,
                saveAsTemplate && styles.toggleActive,
              ]}
            >
              {saveAsTemplate && (
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={Colors.white as any}
                />
              )}
            </View>
          </TouchableOpacity>

          {!saveAsTemplate && (
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setStartWorkout(!startWorkout)}
              activeOpacity={0.7}
            >
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Start Workout</Text>
                <Text style={styles.optionDescription}>
                  Begin this workout after saving
                </Text>
              </View>
              <View
                style={[
                  styles.toggle,
                  startWorkout && styles.toggleActive,
                ]}
              >
                {startWorkout && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={Colors.white as any}
                  />
                )}
              </View>
            </TouchableOpacity>
          )}
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
          {saveAsTemplate ? 'Save Template' : startWorkout ? 'Save & Start' : 'Save Workout'}
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
  exerciseCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
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
  },
  exerciseTag: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.sm,
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
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: Colors.success[500],
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
