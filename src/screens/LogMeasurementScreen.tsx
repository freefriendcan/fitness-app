import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Input, Button } from '@/components';
import { Colors, Spacing, Typography } from '@/constants';
import { useBodyTrackingStore, useUserStore } from '@/store';
import type { ProfileStackParamList } from '@/navigation/types';

type LogMeasurementScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'LogMeasurement'
>;

type LogMeasurementScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'LogMeasurement'
>;

interface Props {
  navigation: LogMeasurementScreenNavigationProp;
  route: LogMeasurementScreenRouteProp;
}

export const LogMeasurementScreen: React.FC<Props> = ({
  navigation,
}) => {
  const styles = useMemo(() => getStyles(), []);

  const { getUnits } = useUserStore();
  const { addMeasurement } = useBodyTrackingStore();
  const unitSystem = getUnits();

  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [thighs, setThighs] = useState('');
  const [arms, setArms] = useState('');
  const [neck, setNeck] = useState('');
  const [shoulders, setShoulders] = useState('');
  const [calves, setCalves] = useState('');
  const [forearms, setForearms] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);

  const weightUnit = unitSystem === 'imperial' ? 'lbs' : 'kg';
  const lengthUnit = unitSystem === 'imperial' ? 'in' : 'cm';

  // Convert imperial to metric for storage
  const convertToMetric = (
    value: string,
    type: 'weight' | 'length'
  ): number | undefined => {
    if (!value) return undefined;
    const num = parseFloat(value);
    if (isNaN(num)) return undefined;

    if (type === 'weight' && unitSystem === 'imperial') {
      return num / 2.20462; // lbs to kg
    }
    if (type === 'length' && unitSystem === 'imperial') {
      return num / 0.3937; // in to cm
    }
    return num;
  };

  const validateInput = (value: string, type: 'weight' | 'length'): boolean => {
    if (!value) return true; // Empty is valid (optional field)

    const num = parseFloat(value);
    if (isNaN(num)) return false;

    // Reasonable ranges
    if (type === 'weight') {
      return num >= 20 && num <= 300; // kg or lbs
    }
    return num > 0 && num <= 200; // cm or in
  };

  const handleSave = () => {
    // Validate all inputs
    if (
      !validateInput(weight, 'weight') ||
      !validateInput(bodyFat, 'length') ||
      !validateInput(chest, 'length') ||
      !validateInput(waist, 'length') ||
      !validateInput(hips, 'length') ||
      !validateInput(thighs, 'length') ||
      !validateInput(arms, 'length') ||
      !validateInput(neck, 'length') ||
      !validateInput(shoulders, 'length') ||
      !validateInput(calves, 'length') ||
      !validateInput(forearms, 'length')
    ) {
      Alert.alert('Invalid Input', 'Please enter valid measurements within reasonable ranges.');
      return;
    }

    // Validate body fat percentage
    if (bodyFat) {
      const bf = parseFloat(bodyFat);
      if (bf < 0 || bf > 100) {
        Alert.alert('Invalid Input', 'Body fat percentage must be between 0 and 100.');
        return;
      }
    }

    setLoading(true);

    try {
      addMeasurement({
        date: new Date(),
        weight: convertToMetric(weight, 'weight'),
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        chest: convertToMetric(chest, 'length'),
        waist: convertToMetric(waist, 'length'),
        hips: convertToMetric(hips, 'length'),
        thighs: convertToMetric(thighs, 'length'),
        arms: convertToMetric(arms, 'length'),
        neck: convertToMetric(neck, 'length'),
        shoulders: convertToMetric(shoulders, 'length'),
        calves: convertToMetric(calves, 'length'),
        forearms: convertToMetric(forearms, 'length'),
        notes: notes.trim() || undefined,
      });

      Alert.alert('Success', 'Measurements logged successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save measurements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Log Body Measurements</Text>
        <Text style={styles.subtitle}>
          Track your progress over time. Leave fields empty if not measured.
        </Text>

        {/* Primary Measurements */}
        <Text style={styles.sectionTitle}>Primary Measurements</Text>

        <Input
          label={`Weight (${weightUnit})`}
          value={weight}
          onChangeText={setWeight}
          placeholder="e.g., 70"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <Input
          label="Body Fat (%)"
          value={bodyFat}
          onChangeText={setBodyFat}
          placeholder="e.g., 15"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        {/* Body Circumference */}
        <Text style={styles.sectionTitle}>Body Circumference ({lengthUnit})</Text>

        <Input
          label={`Chest (${lengthUnit})`}
          value={chest}
          onChangeText={setChest}
          placeholder="e.g., 100"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <Input
          label={`Waist (${lengthUnit})`}
          value={waist}
          onChangeText={setWaist}
          placeholder="e.g., 80"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <Input
          label={`Hips (${lengthUnit})`}
          value={hips}
          onChangeText={setHips}
          placeholder="e.g., 95"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <Input
          label={`Neck (${lengthUnit})`}
          value={neck}
          onChangeText={setNeck}
          placeholder="e.g., 35"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        {/* Limb Measurements */}
        <Text style={styles.sectionTitle}>Limb Measurements ({lengthUnit})</Text>

        <Input
          label={`Shoulders (${lengthUnit})`}
          value={shoulders}
          onChangeText={setShoulders}
          placeholder="e.g., 110"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <Input
          label={`Arms (${lengthUnit})`}
          value={arms}
          onChangeText={setArms}
          placeholder="e.g., 35"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <Input
          label={`Thighs (${lengthUnit})`}
          value={thighs}
          onChangeText={setThighs}
          placeholder="e.g., 55"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <Input
          label={`Calves (${lengthUnit})`}
          value={calves}
          onChangeText={setCalves}
          placeholder="e.g., 38"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <Input
          label={`Forearms (${lengthUnit})`}
          value={forearms}
          onChangeText={setForearms}
          placeholder="e.g., 28"
          keyboardType="decimal-pad"
          style={styles.input}
        />

        {/* Notes */}
        <Text style={styles.sectionTitle}>Notes (Optional)</Text>

        <Input
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional notes..."
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSave}
            loading={loading}
            disabled={!weight && !chest && !waist && !hips}
            fullWidth
            style={styles.saveButton}
          >
            Save Measurements
          </Button>

          <Button
            onPress={() => navigation.goBack()}
            variant="outline"
            fullWidth
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl3,
  },
  title: {
    fontSize: Typography.fontSize.xl2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  input: {
    marginBottom: Spacing.md,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
  saveButton: {
    marginBottom: Spacing.md,
  },
});
