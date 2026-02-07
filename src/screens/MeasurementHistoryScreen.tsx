import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components';
import { Colors, Spacing, Typography } from '@/constants';
import { Routes } from '@/constants';
import { useBodyTrackingStore, useUserStore } from '@/store';
import { MeasurementChart } from '@/components/MeasurementChart/MeasurementChart';
import { MeasurementCard } from '@/components/MeasurementCard/MeasurementCard';
import type { ProfileStackParamList } from '@/navigation/types';

type MeasurementHistoryScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'MeasurementHistory'
>;

type MeasurementHistoryScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'MeasurementHistory'
>;

interface Props {
  navigation: MeasurementHistoryScreenNavigationProp;
  route: MeasurementHistoryScreenRouteProp;
}

type ChartField = 'weight' | 'bodyFat' | 'waist' | 'chest' | 'hips';

export const MeasurementHistoryScreen: React.FC<Props> = ({
  navigation,
}) => {
  const styles = useMemo(() => getStyles(), []);

  const { measurements } = useBodyTrackingStore();
  const { getUnits } = useUserStore();
  const unitSystem = getUnits();

  const [selectedChartField, setSelectedChartField] = useState<ChartField>('weight');

  const latestMeasurement = measurements.length > 0 ? measurements[0] : undefined;
  const previousMeasurement =
    measurements.length > 1 ? measurements[1] : undefined;

  const chartFields: { key: ChartField; label: string; color: string }[] = [
    { key: 'weight', label: 'Weight', color: Colors.primary[500] },
    { key: 'bodyFat', label: 'Body Fat', color: Colors.secondary[500] },
    { key: 'chest', label: 'Chest', color: Colors.success[500] },
    { key: 'waist', label: 'Waist', color: Colors.danger[500] },
    { key: 'hips', label: 'Hips', color: Colors.warning[500] },
  ];

  const getUnit = (field: ChartField): string => {
    if (field === 'bodyFat') return '%';
    if (field === 'weight') return unitSystem === 'imperial' ? 'lbs' : 'kg';
    return unitSystem === 'imperial' ? 'in' : 'cm';
  };

  const getTrendIcon = (field: keyof typeof latestMeasurement) => {
    if (!latestMeasurement || !previousMeasurement) return null;

    const current = latestMeasurement[field];
    const previous = previousMeasurement[field];

    if (current === undefined || previous === undefined) return null;
    if (typeof current !== 'number' || typeof previous !== 'number') return null;

    const diff = current - previous;
    const threshold = field === 'weight' ? 0.5 : 0.5;

    if (Math.abs(diff) < threshold) {
      return (
        <View style={styles.trendContainer}>
          <Ionicons name="remove" size={20} color={Colors.neutral[500]} />
          <Text style={styles.trendText}>Stable</Text>
        </View>
      );
    }

    const isUp = diff > 0;
    const inverse = field === 'weight' || field === 'bodyFat' || field === 'waist';
    const color = inverse
      ? isUp
        ? Colors.danger[500]
        : Colors.success[500]
      : isUp
      ? Colors.success[500]
      : Colors.danger[500];

    return (
      <View style={styles.trendContainer}>
        <Ionicons
          name={isUp ? 'arrow-up' : 'arrow-down'}
          size={20}
          color={color}
        />
        <Text style={[styles.trendText, { color }]}>
          {isUp ? 'Increased' : 'Decreased'}
        </Text>
      </View>
    );
  };

  const formatValue = (value: number | undefined, field: ChartField): string => {
    if (value === undefined) return '--';

    let convertedValue = value;
    if (field === 'weight' && unitSystem === 'imperial') {
      convertedValue = value * 2.20462;
    } else if (field !== 'weight' && field !== 'bodyFat' && unitSystem === 'imperial') {
      convertedValue = value * 0.3937;
    }

    if (field === 'bodyFat') return convertedValue.toFixed(1) + '%';
    if (field === 'weight') return Math.round(convertedValue).toString();
    return convertedValue.toFixed(1);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Summary Cards */}
      {latestMeasurement && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Current Measurements</Text>

          {/* Weight Trend */}
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                <Text style={styles.summaryLabel}>Weight</Text>
                <Text style={styles.summaryValue}>
                  {formatValue(latestMeasurement.weight, 'weight')}{' '}
                  {getUnit('weight')}
                </Text>
              </View>
              {getTrendIcon('weight')}
            </View>
          </Card>

          {/* Body Fat Trend */}
          {latestMeasurement.bodyFat !== undefined && (
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.summaryLabel}>Body Fat</Text>
                  <Text style={styles.summaryValue}>
                    {formatValue(latestMeasurement.bodyFat, 'bodyFat')}
                  </Text>
                </View>
                {getTrendIcon('bodyFat')}
              </View>
            </Card>
          )}

          {/* Waist Trend */}
          {latestMeasurement.waist !== undefined && (
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.summaryLabel}>Waist</Text>
                  <Text style={styles.summaryValue}>
                    {formatValue(latestMeasurement.waist, 'waist')} {getUnit('waist')}
                  </Text>
                </View>
                {getTrendIcon('waist')}
              </View>
            </Card>
          )}
        </View>
      )}

      {/* Chart Section */}
      {measurements.length >= 2 && (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Progress Chart</Text>

          {/* Chart Field Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chartFieldSelector}
          >
            {chartFields.map((field) => (
              <TouchableOpacity
                key={field.key}
                style={[
                  styles.chartFieldButton,
                  selectedChartField === field.key &&
                    styles.chartFieldButtonActive,
                ]}
                onPress={() => setSelectedChartField(field.key)}
              >
                <Text
                  style={[
                    styles.chartFieldButtonText,
                    selectedChartField === field.key &&
                      styles.chartFieldButtonTextActive,
                  ]}
                >
                  {field.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Chart */}
          <Card style={styles.chartCard}>
            <MeasurementChart
              measurements={measurements}
              field={selectedChartField}
              color={
                chartFields.find((f) => f.key === selectedChartField)?.color
              }
              unitSystem={unitSystem}
              days={30}
            />
          </Card>
        </View>
      )}

      {/* History List */}
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>History</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(Routes.LOG_MEASUREMENT as never)}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        </View>

        {measurements.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No measurements logged yet. Tap the + button to add your first
              measurement.
            </Text>
            <Button
              onPress={() => navigation.navigate(Routes.LOG_MEASUREMENT as never)}
              variant="outline"
              style={styles.emptyButton}
            >
              Log First Measurement
            </Button>
          </Card>
        ) : (
          measurements.map((measurement, index) => (
            <MeasurementCard
              key={measurement.id}
              measurement={measurement}
              previousMeasurement={measurements[index + 1]}
              unitSystem={unitSystem}
              showTrend={index === 0}
              onPress={() => {
                // Could navigate to detail screen in future
              }}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const getStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  content: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  summarySection: {
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLeft: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  trendText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  chartSection: {
    marginBottom: Spacing.lg,
  },
  chartFieldSelector: {
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  chartFieldButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  chartFieldButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  chartFieldButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  chartFieldButtonTextActive: {
    color: Colors.white,
  },
  chartCard: {
    padding: Spacing.md,
  },
  historySection: {
    marginBottom: Spacing.lg,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
});
