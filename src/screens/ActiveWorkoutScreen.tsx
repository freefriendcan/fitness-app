import React, { useMemo, useState, useCallback, useEffect } from 'react';
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
import { useWorkout, useTimer, useStopwatch } from '@/hooks';
import { Card, Button, Input } from '@/components';
import { Colors, Spacing, Typography, Layout, Routes } from '@/constants';
import { generateId } from '@/utils';
import type { WorkoutsStackParamList, Exercise } from '@/types';
import type { Set as WorkoutSet } from '@/types';

type ActiveWorkoutScreenNavigationProp = NativeStackNavigationProp<
  WorkoutsStackParamList,
  'ActiveWorkout'
>;

type RouteParams = RouteProp<WorkoutsStackParamList, 'ActiveWorkout'>;

interface SetInput {
  reps: string;
  weight: string;
  completed: boolean;
}

interface SetRowProps {
  exerciseId: string;
  setIndex: number;
  setData: SetInput;
  onUpdateSetData: (exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: string) => void;
  onToggleSetCompleted: (exerciseId: string, setIndex: number) => void;
  onRemoveSet: (exerciseId: string, setIndex: number) => void;
}

// Memoized SetRow component to prevent unnecessary re-renders
const SetRow = React.memo<SetRowProps>(({ exerciseId, setIndex, setData, onUpdateSetData, onToggleSetCompleted, onRemoveSet }) => (
  <View key={setIndex} style={styles.setRow}>
    <Text style={styles.setNumber}>{setIndex + 1}</Text>
    <Input
      placeholder="0"
      value={setData.weight}
      onChangeText={(value) => onUpdateSetData(exerciseId, setIndex, 'weight', value)}
      keyboardType="numeric"
      style={styles.setInput}
    />
    <Text style={styles.setLabel}>kg</Text>
    <Input
      placeholder="0"
      value={setData.reps}
      onChangeText={(value) => onUpdateSetData(exerciseId, setIndex, 'reps', value)}
      keyboardType="numeric"
      style={styles.setInput}
    />
    <Text style={styles.setLabel}>reps</Text>
    <TouchableOpacity
      style={[styles.checkbox, setData.completed && styles.checkboxChecked]}
      onPress={() => onToggleSetCompleted(exerciseId, setIndex)}
      activeOpacity={0.7}
    >
      {setData.completed && (
        <Ionicons name="checkmark" size={18} color={Colors.white} />
      )}
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.removeSetButton}
      onPress={() => onRemoveSet(exerciseId, setIndex)}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="close-circle" size={24} color={Colors.danger[500]} />
    </TouchableOpacity>
  </View>
), (prevProps, nextProps) => {
  return prevProps.setData.weight === nextProps.setData.weight &&
    prevProps.setData.reps === nextProps.setData.reps &&
    prevProps.setData.completed === nextProps.setData.completed;
});

SetRow.displayName = 'SetRow';

export const ActiveWorkoutScreen: React.FC = () => {
  const styles = useMemo(() => getStyles(), []);

  const navigation = useNavigation<ActiveWorkoutScreenNavigationProp>();
  const route = useRoute<RouteParams>();
  const { workoutId } = route.params;
  const { getWorkoutById, updateActiveSession, endWorkoutSession } = useWorkout();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set(['0']));
  const [setsData, setSetsData] = useState<Record<string, SetInput[]>>({});
  const [isResting, setIsResting] = useState(false);

  // Timer for rest periods
  const restTimer = useTimer(90); // 90 seconds default rest

  // Stopwatch for overall workout duration
  const workoutTimer = useStopwatch();

  // Get workout data
  const workout = getWorkoutById(workoutId);

  useEffect(() => {
    // Start workout timer when screen mounts
    workoutTimer.start();

    return () => {
      workoutTimer.pause();
    };
  }, []);

  useEffect(() => {
    if (workout) {
      // Initialize sets data
      const initialSetsData: Record<string, SetInput[]> = {};
      workout.exercises.forEach((exercise) => {
        initialSetsData[exercise.id] = exercise.sets.map((set) => ({
          reps: set.reps.toString(),
          weight: set.weight.toString(),
          completed: set.completed,
        }));
      });
      setSetsData(initialSetsData);
    }
  }, [workout]);

  if (!workout) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Workout not found</Text>
      </View>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];
  const totalExercises = workout.exercises.length;

  const toggleExerciseExpanded = (exerciseId: string) => {
    setExpandedExercises((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const updateSetData = (exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: string) => {
    setSetsData((prev) => {
      const exerciseSets = [...(prev[exerciseId] || [])];
      exerciseSets[setIndex] = {
        ...exerciseSets[setIndex],
        [field]: value,
      };
      return {
        ...prev,
        [exerciseId]: exerciseSets,
      };
    });
  };

  const toggleSetCompleted = (exerciseId: string, setIndex: number) => {
    setSetsData((prev) => {
      const exerciseSets = [...(prev[exerciseId] || [])];
      const wasCompleted = exerciseSets[setIndex].completed;
      exerciseSets[setIndex] = {
        ...exerciseSets[setIndex],
        completed: !wasCompleted,
      };
      return {
        ...prev,
        [exerciseId]: exerciseSets,
      };
    });

    // Start rest timer when completing a set
    if (!setsData[exerciseId]?.[setIndex]?.completed) {
      startRestTimer();
    }
  };

  const startRestTimer = () => {
    restTimer.reset(90);
    restTimer.start();
    setIsResting(true);
  };

  const skipRestTimer = () => {
    restTimer.pause();
    setIsResting(false);
  };

  const addSet = (exerciseId: string) => {
    const exerciseSets = setsData[exerciseId] || [];
    const newSet: SetInput = {
      reps: '',
      weight: exerciseSets.length > 0 ? exerciseSets[exerciseSets.length - 1].weight : '',
      completed: false,
    };
    setSetsData((prev) => ({
      ...prev,
      [exerciseId]: [...exerciseSets, newSet],
    }));
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setSetsData((prev) => {
      const exerciseSets = [...(prev[exerciseId] || [])];
      exerciseSets.splice(setIndex, 1);
      return {
        ...prev,
        [exerciseId]: exerciseSets,
      };
    });
  };

  const goToPreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const goToNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handleCompleteWorkout = () => {
    // Calculate completion status
    const allExerciseSetsComplete = workout.exercises.every((exercise) => {
      const exerciseSets = setsData[exercise.id] || [];
      return exerciseSets.length > 0 && exerciseSets.every((set) => set.completed);
    });

    Alert.alert(
      'Complete Workout',
      allExerciseSetsComplete
        ? 'Great job! All exercises completed. Finish this workout?'
        : 'Some exercises are not complete. Finish this workout anyway?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: () => {
            // Update workout with current sets data
            const updatedExercises = workout.exercises.map((exercise) => {
              const exerciseSets = setsData[exercise.id] || [];
              return {
                ...exercise,
                sets: exerciseSets.map((set, index) => ({
                  id: generateId(),
                  reps: parseInt(set.reps) || 0,
                  weight: parseFloat(set.weight) || 0,
                  completed: set.completed,
                })),
              };
            });

            const updatedWorkout = {
              ...workout,
              exercises: updatedExercises,
              duration: Math.floor(workoutTimer.seconds / 60),
            };
            updateActiveSession({
              workout: updatedWorkout as any,
            });

            endWorkoutSession();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderSetRow = (exerciseId: string, setIndex: number, setData: SetInput) => (
    <SetRow
      key={setIndex}
      exerciseId={exerciseId}
      setIndex={setIndex}
      setData={setData}
      onUpdateSetData={updateSetData}
      onToggleSetCompleted={toggleSetCompleted}
      onRemoveSet={removeSet}
    />
  );

  const renderExercise = (exercise: Exercise, index: number) => {
    const isCurrent = index === currentExerciseIndex;
    const isExpanded = expandedExercises.has(exercise.id);
    const exerciseSets = setsData[exercise.id] || [];
    const completedSets = exerciseSets.filter((set) => set.completed).length;

    return (
      <Card
        key={exercise.id}
        variant={isCurrent ? 'elevated' : 'outlined'}
        style={isCurrent ? styles.currentExerciseCard : styles.exerciseCard}
      >
        <TouchableOpacity
          onPress={() => toggleExerciseExpanded(exercise.id)}
          activeOpacity={0.7}
        >
          <View style={styles.exerciseHeader}>
            <View style={styles.exerciseInfo}>
              <View style={styles.exerciseNumber}>
                <Text style={styles.exerciseNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.exerciseDetails}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseProgress}>
                  {completedSets}/{exerciseSets.length} sets completed
                </Text>
              </View>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={Colors.text.secondary as any}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.setsContainer}>
            <View style={styles.setsHeader}>
              <Text style={styles.setsHeaderText}>Set</Text>
              <Text style={styles.setsHeaderText}>Weight</Text>
              <Text style={styles.setsHeaderText}>Reps</Text>
              <Text style={styles.setsHeaderText}>Done</Text>
              <Text style={styles.setsHeaderText}></Text>
            </View>
            {exerciseSets.map((setData, setIndex) =>
              renderSetRow(exercise.id, setIndex, setData)
            )}
            <TouchableOpacity
              style={styles.addSetButton}
              onPress={() => addSet(exercise.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={20} color={Colors.primary[500]} />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with workout timer */}
      <View style={styles.header}>
        <Text style={styles.workoutTitle}>{workout.name}</Text>
        <View style={styles.timerContainer}>
          <Ionicons name="time" size={20} color={Colors.primary[500]} />
          <Text style={styles.timerText}>{workoutTimer.formattedTime}</Text>
        </View>
      </View>

      {/* Rest Timer */}
      {isResting && (
        <View style={styles.restTimerContainer}>
          <View style={styles.restTimerContent}>
            <Text style={styles.restTimerLabel}>Rest Time</Text>
            <Text style={styles.restTimerText}>{restTimer.formattedTime}</Text>
            <View style={styles.restTimerButtons}>
              <TouchableOpacity
                style={styles.restTimerButton}
                onPress={() => restTimer.addTime(30)}
              >
                <Text style={styles.restTimerButtonText}>+30s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.restTimerButton, styles.restTimerButtonSkip]}
                onPress={skipRestTimer}
              >
                <Text style={styles.restTimerButtonText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Exercise {currentExerciseIndex + 1} of {totalExercises}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentExerciseIndex + 1) / totalExercises) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Exercise list */}
      <ScrollView
        style={styles.exerciseList}
        contentContainerStyle={styles.exerciseListContent}
        showsVerticalScrollIndicator={false}
      >
        {workout.exercises.map((exercise, index) => renderExercise(exercise, index))}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navigationContainer}>
        <View style={styles.navigationButtons}>
          <Button
            onPress={goToPreviousExercise}
            variant="outline"
            disabled={currentExerciseIndex === 0}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.primary[500]} />
            Previous
          </Button>
          <Button
            onPress={goToNextExercise}
            variant="outline"
            disabled={currentExerciseIndex === totalExercises - 1}
            style={styles.navButton}
          >
            Next
            <Ionicons name="chevron-forward" size={20} color={Colors.primary[500]} />
          </Button>
        </View>
        <Button
          onPress={handleCompleteWorkout}
          variant="primary"
          fullWidth
          style={styles.completeButton}
        >
          <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
          Complete Workout
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
  errorText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xl2,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  timerText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[500],
  },
  restTimerContainer: {
    backgroundColor: Colors.secondary[50],
    padding: Spacing.lg,
  },
  restTimerContent: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  restTimerLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  restTimerText: {
    fontSize: 36,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondary[500],
    marginBottom: Spacing.md,
  },
  restTimerButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  restTimerButton: {
    backgroundColor: Colors.secondary[500],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  restTimerButtonSkip: {
    backgroundColor: Colors.neutral[300],
  },
  restTimerButtonText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.semibold,
  },
  progressContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[500],
  },
  exerciseList: {
    flex: 1,
  },
  exerciseListContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  exerciseCard: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currentExerciseCard: {
    borderColor: Colors.primary[500],
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  exerciseNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  exerciseProgress: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  setsContainer: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  setsHeaderText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  setNumber: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    width: 24,
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    marginBottom: 0,
    height: 40,
  },
  setLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    width: 30,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.success[500],
    borderColor: Colors.success[500],
  },
  removeSetButton: {
    marginLeft: Spacing.xs,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: Layout.borderRadius.md,
    borderStyle: 'dashed',
  },
  addSetText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[500],
    fontWeight: Typography.fontWeight.semibold,
  },
  navigationContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl2,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: Spacing.md,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  navButton: {
    flex: 1,
  },
  completeButton: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
