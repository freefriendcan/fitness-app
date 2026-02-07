import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Routes } from '@/constants';
import { Button, Card, Input } from '@/components';
import { Colors, Layout, Spacing, Typography } from '@/constants';
import { useUserStore } from '@/store';
import { validateName, validateWeight, validateHeight } from '@/utils';
import type { ProfileStackParamList } from '@/navigation/types';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'EditProfile'
>;

interface Props {
  navigation: EditProfileScreenNavigationProp;
}

type FitnessGoalOption = {
  label: string;
  value: string;
};

const FITNESS_GOALS: FitnessGoalOption[] = [
  { label: 'Lose Weight', value: 'lose-weight' },
  { label: 'Build Muscle', value: 'build-muscle' },
  { label: 'Increase Endurance', value: 'increase-endurance' },
  { label: 'Improve Flexibility', value: 'improve-flexibility' },
  { label: 'General Fitness', value: 'general-fitness' },
];

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateProfile, getUnits } = useUserStore();
  const unitSystem = getUnits();

  const [firstName, setFirstName] = useState(user?.profile.firstName || '');
  const [lastName, setLastName] = useState(user?.profile.lastName || '');
  const [bio, setBio] = useState(user?.profile.bio || '');
  const [weight, setWeight] = useState(user?.profile.weight?.toString() || '');
  const [height, setHeight] = useState(user?.profile.height?.toString() || '');
  const [fitnessGoal, setFitnessGoal] = useState(user?.profile.fitnessGoal || 'general-fitness');
  const [dateOfBirth, setDateOfBirth] = useState<string | undefined>(
    user?.profile.dateOfBirth?.toISOString().split('T')[0]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const weightUnit = unitSystem === 'imperial' ? 'lbs' : 'kg';
  const heightUnit = unitSystem === 'imperial' ? 'inches' : 'cm';

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (firstName && !validateName(firstName)) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (lastName && !validateName(lastName)) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (weight && !validateWeight(parseFloat(weight))) {
      newErrors.weight = `Weight must be between 0 and 500 ${weightUnit}`;
    }

    if (height && !validateHeight(parseFloat(height))) {
      newErrors.height = `Height must be between 0 and 300 ${heightUnit}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      updateProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        bio: bio.trim() || undefined,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        fitnessGoal,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      });

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const getGoalLabel = (value: string): string => {
    return FITNESS_GOALS.find((goal) => goal.value === value)?.label || value;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <Input
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            error={errors.firstName}
            autoCapitalize="words"
          />

          <Input
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            error={errors.lastName}
            autoCapitalize="words"
          />

          <Input
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={3}
            style={styles.bioInput}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Physical Stats</Text>

          <View style={styles.unitInfo}>
            <Text style={styles.unitText}>
              Using {unitSystem === 'metric' ? 'Metric' : 'Imperial'} units
            </Text>
            <Text style={styles.unitSubtext}>
              Change in Settings if needed
            </Text>
          </View>

          <Input
            label={`Weight (${weightUnit})`}
            value={weight}
            onChangeText={setWeight}
            placeholder={`Enter weight in ${weightUnit}`}
            error={errors.weight}
            keyboardType="decimal-pad"
          />

          <Input
            label={`Height (${heightUnit})`}
            value={height}
            onChangeText={setHeight}
            placeholder={`Enter height in ${heightUnit}`}
            error={errors.height}
            keyboardType="decimal-pad"
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Fitness Goals</Text>

          <Text style={styles.label}>Fitness Goal</Text>
          <Button
            onPress={() => setShowGoalPicker(!showGoalPicker)}
            variant="outline"
            fullWidth
            style={styles.dropdownButton}
          >
            {getGoalLabel(fitnessGoal)}
          </Button>

          {showGoalPicker && (
            <View style={styles.optionsContainer}>
              {FITNESS_GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.value}
                  style={[
                    styles.optionItem,
                    fitnessGoal === goal.value && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    setFitnessGoal(goal.value as any);
                    setShowGoalPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      fitnessGoal === goal.value && styles.optionTextSelected,
                    ]}
                  >
                    {goal.label}
                  </Text>
                  {fitnessGoal === goal.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Date of Birth</Text>
          <Input
            value={dateOfBirth || ''}
            onChangeText={setDateOfBirth}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
          />
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleCancel}
            variant="outline"
            fullWidth
            style={styles.button}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSave}
            loading={isSaving}
            fullWidth
            style={styles.button}
          >
            Save
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  unitInfo: {
    backgroundColor: Colors.primary[50],
    padding: Spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Spacing.md,
  },
  unitText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary[700],
  },
  unitSubtext: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary[600],
    marginTop: Spacing.xs,
  },
  dropdownButton: {
    marginBottom: Spacing.sm,
  },
  optionsContainer: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.white,
    maxHeight: 200,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  optionItemSelected: {
    backgroundColor: Colors.primary[50],
  },
  optionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  optionTextSelected: {
    color: Colors.primary[700],
    fontWeight: Typography.fontWeight.semibold,
  },
  checkmark: {
    fontSize: Typography.fontSize.lg,
    color: Colors.primary[500],
    fontWeight: Typography.fontWeight.bold,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl2,
  },
  button: {
    flex: 1,
  },
});
