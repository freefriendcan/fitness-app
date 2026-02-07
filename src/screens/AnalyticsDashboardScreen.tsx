/**
 * AnalyticsDashboardScreen
 * Main analytics overview with time range selector and key metrics
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, Button } from '@/components';
import { StatCard, LineChart, BarChart, PieChart } from '@/components/charts';
import { useWorkout } from '@/hooks/useWorkout';
import {
  calculateVolumeOverTime,
  calculateWorkoutFrequencyByPeriod,
  calculateMuscleGroupDistribution,
  calculateWorkoutStreaks,
  calculateTrendMetrics,
  type TimeRange,
  type VolumeDataPoint,
  type WorkoutFrequencyData,
  type MuscleGroupDistribution,
} from '@/utils/analytics';
import { formatVolume, formatDurationMinutes, navigateToExerciseProgress, navigateToStatistics, navigateToPersonalRecords } from '@/utils';
import { Colors, Spacing, Typography, Layout } from '@/constants';
import type { ProfileStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AnalyticsDashboard'>;

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: '3 Months', value: '3months' },
  { label: 'Year', value: 'year' },
  { label: 'All Time', value: 'all' },
];

const MUSCLE_GROUP_COLORS: Record<string, string> = {
  chest: Colors.primary[500],
  back: Colors.secondary[500],
  shoulders: Colors.success[500],
  biceps: Colors.warning[500],
  triceps: Colors.danger[500],
  legs: '#9C27B0',
  glutes: '#00BCD4',
  core: Colors.neutral[600],
  cardio: Colors.neutral[400],
  'full-body': Colors.primary[700],
};

export const AnalyticsDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useMemo(() => getStyles(), []);

  const { workouts } = useWorkout();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('month');

  // Calculate analytics data
  const volumeData = useMemo(() => calculateVolumeOverTime(workouts, selectedRange), [workouts, selectedRange]);
  const frequencyData = useMemo(() => calculateWorkoutFrequencyByPeriod(workouts, 'week', selectedRange), [workouts, selectedRange]);
  const muscleDistribution = useMemo(() => calculateMuscleGroupDistribution(workouts, selectedRange), [workouts, selectedRange]);
  const streaks = useMemo(() => calculateWorkoutStreaks(workouts), [workouts]);

  // Calculate trend metrics
  const workoutTrend = useMemo(() => calculateTrendMetrics(workouts, 'workouts', selectedRange), [workouts, selectedRange]);
  const volumeTrend = useMemo(() => calculateTrendMetrics(workouts, 'volume', selectedRange), [workouts, selectedRange]);
  const durationTrend = useMemo(() => calculateTrendMetrics(workouts, 'duration', selectedRange), [workouts, selectedRange]);

  // Prepare chart data
  const lineChartData = useMemo(() => {
    return volumeData.map((d) => ({
      x: d.date.getTime(),
      y: d.volume,
      value: d.volume,
      date: d.date,
    }));
  }, [volumeData]);

  const barChartData = useMemo(() => {
    return frequencyData.map((d) => ({
      label: d.label.split('-')[1] || d.label,
      value: d.count,
    }));
  }, [frequencyData]);

  const pieChartData = useMemo(() => {
    return muscleDistribution.map((d) => ({
      label: d.muscleGroup,
      value: d.count,
      color: MUSCLE_GROUP_COLORS[d.muscleGroup] || Colors.neutral[500],
    }));
  }, [muscleDistribution]);

  const hasData = workouts.length > 0;

  const handleViewExerciseProgress = () => {
    navigateToExerciseProgress(navigation);
  };

  const handleViewStatistics = () => {
    navigateToStatistics(navigation);
  };

  const handleViewPersonalRecords = () => {
    navigateToPersonalRecords(navigation);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Time Range Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time Range</Text>
        <View style={styles.timeRangeContainer}>
          {TIME_RANGES.map((range) => (
            <TouchableOpacity
              key={range.value}
              style={[
                styles.timeRangeButton,
                selectedRange === range.value && styles.timeRangeButtonActive,
              ]}
              onPress={() => setSelectedRange(range.value)}
            >
              <Text
                style={[
                  styles.timeRangeButtonText,
                  selectedRange === range.value && styles.timeRangeButtonTextActive,
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {!hasData ? (
        <Card padding="lg">
          <Text style={styles.emptyText}>
            No workout data yet. Complete some workouts to see your analytics!
          </Text>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <View style={styles.metricsGrid}>
              <StatCard
                title="Workouts"
                value={workoutTrend.value}
                subtitle="Total sessions"
                icon="💪"
                trend={{
                  value: workoutTrend.changePercentage,
                  isPositive: workoutTrend.trend === 'up',
                  label: 'vs previous',
                }}
              />
              <StatCard
                title="Volume"
                value={formatVolume(volumeTrend.value)}
                subtitle="Total lifted"
                icon="🏋️"
                trend={{
                  value: volumeTrend.changePercentage,
                  isPositive: volumeTrend.trend === 'up',
                  label: 'vs previous',
                }}
              />
              <StatCard
                title="Current Streak"
                value={`${streaks.currentStreak} days`}
                subtitle={`Best: ${streaks.longestStreak} days`}
                icon="🔥"
              />
              <StatCard
                title="Duration"
                value={formatDurationMinutes(durationTrend.value)}
                subtitle="Total time"
                icon="⏱️"
                trend={{
                  value: durationTrend.changePercentage,
                  isPositive: durationTrend.trend === 'up',
                  label: 'vs previous',
                }}
              />
            </View>
          </View>

          {/* Volume Progression */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Volume Progression</Text>
            <Card padding="md">
              <LineChart
                data={lineChartData}
                height={200}
                color={Colors.primary[500]}
                showDots={true}
                showGrid={true}
                formatYLabel={(value) => formatVolume(value)}
              />
            </Card>
          </View>

          {/* Workout Frequency */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workout Frequency</Text>
            <Card padding="md">
              <BarChart
                data={barChartData}
                height={200}
                color={Colors.secondary[500]}
                showLabels={true}
                formatXLabel={(label) => `W${label}`}
              />
            </Card>
          </View>

          {/* Muscle Group Distribution */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Muscle Group Distribution</Text>
            <Card padding="md">
              <PieChart
                data={pieChartData}
                showLabels={false}
                showLegend={true}
                centerLabel="Groups"
                centerValue={muscleDistribution.length.toString()}
              />
            </Card>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detailed Analytics</Text>
            <View style={styles.actionsContainer}>
              <Button
                onPress={handleViewExerciseProgress}
                variant="outline"
                fullWidth
              >
                Exercise Progress
              </Button>
              <Button
                onPress={handleViewStatistics}
                variant="outline"
                fullWidth
              >
                Detailed Statistics
              </Button>
              <Button
                onPress={handleViewPersonalRecords}
                variant="outline"
                fullWidth
              >
                Personal Records
              </Button>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const getStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl3,
  },
  section: {
    marginBottom: Spacing.xl2,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  timeRangeButton: {
    flex: 1,
    minWidth: '18%',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  timeRangeButtonText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  timeRangeButtonTextActive: {
    color: Colors.white,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.sm,
  },
  actionsContainer: {
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
