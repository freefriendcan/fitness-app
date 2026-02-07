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
import { Colors, Spacing, Typography, Layout } from '@/constants';
import { Card, Input, Button } from '@/components';
import { useExercise } from '@/hooks/useExercise';
import type { MuscleGroup, Equipment } from '@/types';
import type { ExercisesStackParamList } from '@/types/navigation';

type NavigationProp = NativeStackNavigationProp<ExercisesStackParamList>;
type RouteProps = RouteProp<ExercisesStackParamList, 'EditExercise'>;

const MUSCLE_GROUP_OPTIONS: MuscleGroup[] = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'glutes',
  'core',
  'cardio',
  'full-body',
];

const EQUIPMENT_OPTIONS: Equipment[] = [
  'barbell',
  'dumbbells',
  'cable',
  'machine',
  'bodyweight',
  'kettlebell',
  'resistance-band',
  'other',
];

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

export const EditExerciseScreen: React.FC = () => {
  const styles = useMemo(() => getStyles(), []);

  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { getExerciseById, updateExercise } = useExercise();

  const { exerciseId } = route.params;
  const exercise = getExerciseById(exerciseId);

  // Check if exercise is a default exercise
  const isDefaultExercise = DEFAULT_EXERCISE_IDS.includes(exerciseId);

  // Form state
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | undefined>();
  const [equipment, setEquipment] = useState<Equipment | undefined>();
  const [instructions, setInstructions] = useState('');

  // Validation errors
  const [nameError, setNameError] = useState('');
  const [muscleGroupError, setMuscleGroupError] = useState('');
  const [equipmentError, setEquipmentError] = useState('');

  // Load exercise data
  useEffect(() => {
    if (exercise) {
      setName(exercise.name);
      setMuscleGroup(exercise.muscleGroup);
      setEquipment(exercise.equipment);
      setInstructions(exercise.instructions || '');
    }
  }, [exercise]);

  // Redirect if trying to edit a default exercise
  useEffect(() => {
    if (isDefaultExercise) {
      Alert.alert(
        'Cannot Edit Default Exercise',
        'Default exercises cannot be modified. You can create a custom exercise instead.',
        [
          {
            text: 'Go Back',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Create Custom',
            onPress: () => {
              navigation.replace('CreateExercise');
            },
          },
        ]
      );
    }
  }, [isDefaultExercise, navigation]);

  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setNameError('');
    setMuscleGroupError('');
    setEquipmentError('');

    // Validate name
    if (!name.trim()) {
      setNameError('Exercise name is required');
      isValid = false;
    } else if (name.trim().length < 3) {
      setNameError('Exercise name must be at least 3 characters');
      isValid = false;
    }

    // Validate muscle group
    if (!muscleGroup) {
      setMuscleGroupError('Muscle group is required');
      isValid = false;
    }

    // Validate equipment
    if (!equipment) {
      setEquipmentError('Equipment is required');
      isValid = false;
    }

    return isValid;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    try {
      updateExercise(exerciseId, {
        name: name.trim(),
        muscleGroup: muscleGroup!,
        equipment: equipment!,
        instructions: instructions.trim() || undefined,
      });

      Alert.alert(
        'Success',
        'Exercise updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update exercise. Please try again.');
      // Error is already displayed to user via Alert, no need for console log
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this exercise? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete functionality
            // Currently useExercise hook doesn't expose deleteExercise
            Alert.alert('Info', 'Delete functionality will be implemented soon');
          },
        },
      ]
    );
  };

  // Show loading or error state if exercise not found
  if (!exercise) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Exercise Not Found</Text>
          <Text style={styles.errorTextMessage}>
            The exercise you're trying to edit doesn't exist.
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

  // Show warning for default exercises
  if (isDefaultExercise) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.warningCard}>
            <Text style={styles.warningIcon}>🔒</Text>
            <Text style={styles.warningTitle}>Default Exercise</Text>
            <Text style={styles.warningText}>
              This is a default exercise that comes with the app. Default exercises cannot be modified to ensure consistency.
            </Text>
            <Text style={styles.warningSubtext}>
              If you want a similar exercise with different parameters, you can create a custom exercise instead.
            </Text>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              onPress={() => navigation.goBack()}
              variant="outline"
              fullWidth
            >
              Go Back
            </Button>
            <Button
              onPress={() => navigation.replace('CreateExercise')}
              variant="primary"
              fullWidth
              style={styles.createButton}
            >
              Create Custom Exercise
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>Edit Exercise</Text>
          <Text style={styles.formSubtitle}>
            Modify the exercise details
          </Text>

          {/* Exercise Name */}
          <Input
            label="Exercise Name *"
            placeholder="e.g., Incline Dumbbell Press"
            value={name}
            onChangeText={setName}
            error={nameError}
            autoCapitalize="words"
            returnKeyType="next"
          />

          {/* Muscle Group */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Muscle Group *
            </Text>
            <View style={styles.optionsContainer}>
              {MUSCLE_GROUP_OPTIONS.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.optionChip,
                    muscleGroup === group && styles.optionChipSelected,
                  ]}
                  onPress={() => setMuscleGroup(group)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      muscleGroup === group && styles.optionChipTextSelected,
                    ]}
                  >
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {muscleGroupError ? (
              <Text style={styles.errorText}>{muscleGroupError}</Text>
            ) : null}
          </View>

          {/* Equipment */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Equipment *
            </Text>
            <View style={styles.optionsContainer}>
              {EQUIPMENT_OPTIONS.map((eq) => (
                <TouchableOpacity
                  key={eq}
                  style={[
                    styles.optionChip,
                    equipment === eq && styles.optionChipSelected,
                  ]}
                  onPress={() => setEquipment(eq)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      equipment === eq && styles.optionChipTextSelected,
                    ]}
                  >
                    {eq}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {equipmentError ? (
              <Text style={styles.errorText}>{equipmentError}</Text>
            ) : null}
          </View>

          {/* Instructions */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Instructions</Text>
            <View style={styles.textareaContainer}>
              <Input
                placeholder="Describe how to perform this exercise..."
                value={instructions}
                onChangeText={setInstructions}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={styles.textarea}
              />
            </View>
            <Text style={styles.helperText}>
              Optional: Add step-by-step instructions
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSave}
            variant="primary"
            fullWidth
          >
            Save Changes
          </Button>
          <Button
            onPress={handleCancel}
            variant="outline"
            fullWidth
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            onPress={handleDelete}
            variant="ghost"
            fullWidth
            textStyle={styles.deleteButtonText}
          >
            Delete Exercise
          </Button>
        </View>

        {/* Bottom padding */}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
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
  formCard: {
    marginBottom: Spacing.lg,
  },
  formTitle: {
    fontSize: Typography.fontSize.xl2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  formSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl2,
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  optionChipSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  optionChipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  optionChipTextSelected: {
    color: Colors.white,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.danger[500],
    marginTop: Spacing.xs,
  },
  helperText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  textareaContainer: {
    height: 120,
  },
  textarea: {
    flex: 1,
    height: undefined,
  },
  buttonContainer: {
    gap: Spacing.sm,
  },
  cancelButton: {
    marginTop: 0,
  },
  deleteButtonText: {
    color: Colors.danger[500],
  },
  createButton: {
    marginTop: 0,
  },
  warningCard: {
    padding: Spacing.xl2,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  warningIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  warningTitle: {
    fontSize: Typography.fontSize.xl2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  warningText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeight.relaxed,
  },
  warningSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed,
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
  errorTextMessage: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl2,
  },
  errorButton: {
    minWidth: 200,
  },
});
