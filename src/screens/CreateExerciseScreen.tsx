import React, { useState } from 'react';
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
import { Colors, Spacing, Typography, Layout } from '@/constants';
import { Card, Input, Button } from '@/components';
import { useExercise } from '@/hooks/useExercise';
import type { MuscleGroup, Equipment } from '@/types';
import type { ExercisesStackParamList } from '@/types/navigation';

type NavigationProp = NativeStackNavigationProp<ExercisesStackParamList>;

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

export const CreateExerciseScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { addExercise, createExercise } = useExercise();

  // Form state
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | undefined>();
  const [equipment, setEquipment] = useState<Equipment | undefined>();
  const [instructions, setInstructions] = useState('');

  // Validation errors
  const [nameError, setNameError] = useState('');
  const [muscleGroupError, setMuscleGroupError] = useState('');
  const [equipmentError, setEquipmentError] = useState('');

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
      const newExercise = createExercise(
        name.trim(),
        muscleGroup!,
        equipment!,
        instructions.trim() || undefined
      );

      addExercise(newExercise);

      Alert.alert(
        'Success',
        'Exercise created successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create exercise. Please try again.');
      // Error is already displayed to user via Alert, no need for console log
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>Create Custom Exercise</Text>
          <Text style={styles.formSubtitle}>
            Add your own exercise to the library
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
            Create Exercise
          </Button>
          <Button
            onPress={handleCancel}
            variant="outline"
            fullWidth
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </View>

        {/* Bottom padding */}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
