import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BodyMeasurement } from '@/types';
import { Card, Colors, Spacing, Typography } from '@/constants';

interface Props {
  measurement: BodyMeasurement;
  onPress?: () => void;
  unitSystem: 'metric' | 'imperial';
  showTrend?: boolean;
  previousMeasurement?: BodyMeasurement;
}

export const MeasurementCard: React.FC<Props> = ({
  measurement,
  onPress,
  unitSystem,
  showTrend = false,
  previousMeasurement,
}) => {
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const convertWeight = (kg?: number) => {
    if (kg === undefined) return null;
    return unitSystem === 'imperial'
      ? Math.round(kg * 2.20462)
      : Math.round(kg);
  };

  const convertLength = (cm?: number) => {
    if (cm === undefined) return null;
    return unitSystem === 'imperial'
      ? (cm * 0.3937).toFixed(1)
      : cm.toFixed(1);
  };

  const getTrendIcon = (
    current: number | undefined,
    previous: number | undefined,
    inverse = false
  ) => {
    if (current === undefined || previous === undefined) return null;

    const diff = current - previous;
    const threshold = unitSystem === 'imperial' ? 1 : 0.5;

    if (Math.abs(diff) < threshold) {
      return (
        <Ionicons
          name="remove"
          size={16}
          color={Colors.neutral[500]}
        />
      );
    }

    const isUp = diff > 0;
    const color = inverse
      ? isUp
        ? Colors.danger[500]
        : Colors.success[500]
      : isUp
      ? Colors.success[500]
      : Colors.danger[500];

    return (
      <Ionicons
        name={isUp ? 'arrow-up' : 'arrow-down'}
        size={16}
        color={color}
      />
    );
  };

  const weight = convertWeight(measurement.weight);
  const previousWeight = previousMeasurement?.weight;
  const weightUnit = unitSystem === 'imperial' ? 'lbs' : 'kg';
  const lengthUnit = unitSystem === 'imperial' ? 'in' : 'cm';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={styles.container}
    >
      <Card style={styles.card}>
        {/* Header with date */}
        <View style={styles.header}>
          <Text style={styles.date}>{formatDate(measurement.date)}</Text>
          {showTrend && previousMeasurement && measurement.weight && previousWeight && (
            <View style={styles.trend}>
              {getTrendIcon(measurement.weight, previousWeight, true)}
            </View>
          )}
        </View>

        {/* Measurements Grid */}
        <View style={styles.measurementsGrid}>
          {/* Weight */}
          {weight !== null && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementValue}>
                {weight} {weightUnit}
              </Text>
              <Text style={styles.measurementLabel}>Weight</Text>
            </View>
          )}

          {/* Body Fat */}
          {measurement.bodyFat !== undefined && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementValue}>
                {measurement.bodyFat}%
              </Text>
              <Text style={styles.measurementLabel}>Body Fat</Text>
            </View>
          )}

          {/* Chest */}
          {measurement.chest !== undefined && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementValue}>
                {convertLength(measurement.chest)} {lengthUnit}
              </Text>
              <Text style={styles.measurementLabel}>Chest</Text>
            </View>
          )}

          {/* Waist */}
          {measurement.waist !== undefined && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementValue}>
                {convertLength(measurement.waist)} {lengthUnit}
              </Text>
              <Text style={styles.measurementLabel}>Waist</Text>
            </View>
          )}

          {/* Hips */}
          {measurement.hips !== undefined && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementValue}>
                {convertLength(measurement.hips)} {lengthUnit}
              </Text>
              <Text style={styles.measurementLabel}>Hips</Text>
            </View>
          )}

          {/* Arms */}
          {measurement.arms !== undefined && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementValue}>
                {convertLength(measurement.arms)} {lengthUnit}
              </Text>
              <Text style={styles.measurementLabel}>Arms</Text>
            </View>
          )}

          {/* Thighs */}
          {measurement.thighs !== undefined && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementValue}>
                {convertLength(measurement.thighs)} {lengthUnit}
              </Text>
              <Text style={styles.measurementLabel}>Thighs</Text>
            </View>
          )}

          {/* Neck */}
          {measurement.neck !== undefined && (
            <View style={styles.measurementItem}>
              <Text style={styles.measurementValue}>
                {convertLength(measurement.neck)} {lengthUnit}
              </Text>
              <Text style={styles.measurementLabel}>Neck</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {measurement.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>{measurement.notes}</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  date: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  measurementItem: {
    width: '25%',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  measurementValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[500],
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  measurementLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  notesContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  notesText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
});
