import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography, Layout } from '@/constants';
import { Card, Button, IconButton } from '@/components';
import { useExercise } from '@/hooks/useExercise';
import type { MuscleGroup, Exercise } from '@/types';
import type { ExercisesStackParamList } from '@/types/navigation';

type NavigationProp = NativeStackNavigationProp<ExercisesStackParamList>;
type RouteProps = RouteProp<ExercisesStackParamList, 'ExerciseDetail'>;

// Muscle group icons mapping
const MUSCLE_GROUP_ICONS: Record<MuscleGroup, string> = {
  chest: '💪',
  back: '🔄',
  shoulders: '🏋️',
  biceps: '💪',
  triceps: '💪',
  legs: '🦵',
  glutes: '🍑',
  core: '🎯',
  cardio: '🏃',
  'full-body': '🧍',
};

// Muscle group colors
const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  chest: Colors.primary[500],
  back: Colors.secondary[500],
  shoulders: Colors.success[500],
  biceps: Colors.warning[500],
  triceps: Colors.danger[500],
  legs: Colors.primary[600],
  glutes: Colors.secondary[600],
  core: Colors.success[600],
  cardio: Colors.warning[600],
  'full-body': Colors.neutral[700],
};

// Default exercise IDs (cannot be edited)
const DEFAULT_EXERCISE_IDS = [
  'bench-press',
  'squat',
  'deadlift',
  'overhead-press',
  'bicep-curl',
  'tricep-extension',
  'pull-up',
  'push-up',
  'lunges',
  'plank',
];

export const ExerciseDetailScreen: React.FC = () => {
  const styles = useMemo(() => getStyles(), []);

  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { getExerciseById, getExercisesByMuscleGroup } = useExercise();

  const { exerciseId } = route.params;
  const exercise = getExerciseById(exerciseId);

  // Check if exercise is a default exercise
  const isDefaultExercise = DEFAULT_EXERCISE_IDS.includes(exerciseId);

  // Get related exercises (same muscle group, excluding current)
  const relatedExercises = useMemo(() => {
    if (!exercise) return [];
    const sameGroup = getExercisesByMuscleGroup(exercise.muscleGroup);
    return sameGroup.filter((e) => e.id !== exerciseId).slice(0, 5);
  }, [exercise, exerciseId, getExercisesByMuscleGroup]);

  if (!exercise) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Exercise Not Found</Text>
          <Text style={styles.errorText}>
            The exercise you're looking for doesn't exist.
          </Text>
          <Button
            onPress={() => navigation.goBack()}
            variant="primary"
            style={styles.errorButton}
          >
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  const handleEditPress = () => {
    if (isDefaultExercise) {
      // Show warning - cannot edit default exercises
      return;
    }
    navigation.navigate('EditExercise', { exerciseId });
  };

  const handleAddToWorkout = () => {
    // TODO: Implement add to workout functionality
    // This will be implemented when workout screens are created
    // For now, show a message to the user
    Alert.alert('Coming Soon', 'Add to workout functionality will be available soon!');
  };

  const handleRelatedExercisePress = (relatedId: string) => {
    navigation.push('ExerciseDetail', { exerciseId: relatedId });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Exercise Header */}
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.exerciseIcon}>
                {MUSCLE_GROUP_ICONS[exercise.muscleGroup]}
              </Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <View style={styles.metaContainer}>
                <View
                  style={[
                    styles.muscleGroupBadge,
                    { backgroundColor: MUSCLE_GROUP_COLORS[exercise.muscleGroup] },
                  ]}
                >
                  <Text style={styles.muscleGroupText}>
                    {MUSCLE_GROUP_ICONS[exercise.muscleGroup]} {exercise.muscleGroup}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Exercise Details */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Equipment</Text>
            <Text style={styles.detailValue}>{exercise.equipment}</Text>
          </View>

          {exercise.restTime && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rest Time</Text>
              <Text style={styles.detailValue}>{exercise.restTime}s</Text>
            </View>
          )}
        </Card>

        {/* Instructions */}
        {exercise.instructions && (
          <Card style={styles.instructionsCard}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.instructionsText}>{exercise.instructions}</Text>
          </Card>
        )}

        {/* Notes */}
        {exercise.notes && (
          <Card style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{exercise.notes}</Text>
          </Card>
        )}

        {/* Related Exercises */}
        {relatedExercises.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>
              Related {exercise.muscleGroup} Exercises
            </Text>
            <View style={styles.relatedList}>
              {relatedExercises.map((related) => (
                <TouchableOpacity
                  key={related.id}
                  onPress={() => handleRelatedExercisePress(related.id)}
                  activeOpacity={0.7}
                >
                  <Card variant="outlined" style={styles.relatedCard}>
                    <View style={styles.relatedContent}>
                      <Text style={styles.relatedIcon}>
                        {MUSCLE_GROUP_ICONS[related.muscleGroup]}
                      </Text>
                      <View style={styles.relatedTextContainer}>
                        <Text style={styles.relatedName}>{related.name}</Text>
                        <Text style={styles.relatedEquipment}>{related.equipment}</Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Bottom padding */}
        <View style={{ height: Spacing.xl2 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <Button
          onPress={handleAddToWorkout}
          variant="primary"
          fullWidth
          style={styles.actionButton}
        >
          Add to Workout
        </Button>
        {!isDefaultExercise && (
          <Button
            onPress={handleEditPress}
            variant="outline"
            fullWidth
            style={styles.actionButton}
          >
            Edit Exercise
          </Button>
        )}
        {isDefaultExercise && (
          <View style={styles.defaultExerciseWarning}>
            <Text style={styles.defaultExerciseText}>
              ℹ️ This is a default exercise and cannot be edited
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const getStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  headerCard: {
    marginBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: Layout.borderRadius.lg,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  exerciseIcon: {
    fontSize: 36,
  },
  headerTextContainer: {
    flex: 1,
  },
  exerciseName: {
    fontSize: Typography.fontSize.xl2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  muscleGroupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  muscleGroupText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
    textTransform: 'capitalize',
  },
  detailsCard: {
    marginBottom: Spacing.md,
  },
  instructionsCard: {
    marginBottom: Spacing.md,
  },
  notesCard: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  detailLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  detailValue: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  instructionsText: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.relaxed,
    color: Colors.text.primary,
  },
  notesText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.relaxed,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  relatedSection: {
    marginTop: Spacing.lg,
  },
  relatedTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  relatedList: {
    gap: Spacing.sm,
  },
  relatedCard: {
    padding: Spacing.md,
  },
  relatedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relatedIcon: {
    fontSize: Typography.fontSize.xl,
    marginRight: Spacing.md,
  },
  relatedTextContainer: {
    flex: 1,
  },
  relatedName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  relatedEquipment: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  actionBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: Spacing.sm,
  },
  actionButton: {
    marginBottom: 0,
  },
  defaultExerciseWarning: {
    padding: Spacing.sm,
    backgroundColor: Colors.warning[50],
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.warning[200],
  },
  defaultExerciseText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.warning[700],
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl2,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: Typography.fontSize.xl2,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl2,
  },
  errorButton: {
    minWidth: 200,
  },
});
