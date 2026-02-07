/**
 * StatisticsScreen
 * Enhanced detailed statistics with comprehensive analytics
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, Button } from '@/components';
import { StatCard, BarChart, PieChart } from '@/components/charts';
import { useWorkout } from '@/hooks/useWorkout';
import {
  calculateDetailedStats,
  calculateWorkoutStreaks,
  calculateMuscleGroupDistribution,
  calculateWorkoutFrequencyByPeriod,
  calculatePersonalRecords,
  type TimeRange,
} from '@/utils/analytics';
import { formatDate, formatDurationMinutes, formatVolume, navigateToPersonalRecords, navigateToAnalyticsDashboard, navigateToExerciseProgress } from '@/utils';
import { Colors, Layout, Spacing, Typography } from '@/constants';
import type { ProfileStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Statistics'>;

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

export const StatisticsScreen: React.FC<Props> = ({ navigation }) => {
  const { workouts } = useWorkout();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('all');

  // Calculate detailed statistics
  const detailedStats = useMemo(
    () => calculateDetailedStats(workouts, selectedRange),
    [workouts, selectedRange]
  );

  // Calculate streaks
  const streaks = useMemo(() => calculateWorkoutStreaks(workouts), [workouts]);

  // Calculate muscle group distribution
  const muscleDistribution = useMemo(
    () => calculateMuscleGroupDistribution(workouts, selectedRange),
    [workouts, selectedRange]
  );

  // Calculate workout frequency
  const frequencyData = useMemo(
    () => calculateWorkoutFrequencyByPeriod(workouts, 'week', selectedRange),
    [workouts, selectedRange]
  );

  // Get personal records
  const personalRecords = useMemo(
    () => calculatePersonalRecords(workouts, selectedRange),
    [workouts, selectedRange]
  );

  // Prepare chart data
  const pieChartData = useMemo(
    () =>
      muscleDistribution.map((d) => ({
        label: d.muscleGroup,
        value: d.count,
        color: MUSCLE_GROUP_COLORS[d.muscleGroup] || Colors.neutral[500],
      })),
    [muscleDistribution]
  );

  const barChartData = useMemo(
    () =>
      frequencyData.map((d) => ({
        label: d.label.split('-')[1] || d.label,
        value: d.count,
      })),
    [frequencyData]
  );

  const hasData = workouts.length > 0;

  const handleViewAllPRs = () => {
    navigateToPersonalRecords(navigation);
  };

  const handleViewAnalyticsDashboard = () => {
    navigateToAnalyticsDashboard(navigation);
  };

  const handleViewExerciseProgress = () => {
    navigateToExerciseProgress(navigation);
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
            No workout data yet. Complete some workouts to see your statistics!
          </Text>
        </Card>
      ) : (
        <>
          {/* Overview Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsRow}>
              <StatCard
                title="Total Workouts"
                value={detailedStats.totalWorkouts}
                icon="💪"
                variant="compact"
              />
              <StatCard
                title="Total Volume"
                value={formatVolume(detailedStats.totalVolume)}
                icon="🏋️"
                variant="compact"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Total Time"
                value={formatDurationMinutes(detailedStats.totalDuration)}
                icon="⏱️"
                variant="compact"
              />
              <StatCard
                title="Avg Duration"
                value={Math.round(detailedStats.averageWorkoutDuration) + ' min'}
                icon="📊"
                variant="compact"
              />
            </View>
          </View>

          {/* Streaks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Streaks</Text>
            <View style={styles.statsRow}>
              <StatCard
                title="Current Streak"
                value={`${streaks.currentStreak} days`}
                subtitle="Keep it up!"
                icon="🔥"
                variant="compact"
              />
              <StatCard
                title="Longest Streak"
                value={`${streaks.longestStreak} days`}
                subtitle="Personal best"
                icon="🏆"
                variant="compact"
              />
            </View>
          </View>

          {/* Workout Frequency Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workout Frequency (Weekly)</Text>
            <Card padding="md">
              <BarChart
                data={barChartData}
                height={180}
                color={Colors.primary[500]}
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

          {/* Most/Least Trained */}
          {detailedStats.mostTrainedMuscleGroup && detailedStats.leastTrainedMuscleGroup && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Training Focus</Text>
              <View style={styles.statsRow}>
                <StatCard
                  title="Most Trained"
                  value={capitalizeFirstLetter(detailedStats.mostTrainedMuscleGroup)}
                  icon="🎯"
                  variant="compact"
                />
                <StatCard
                  title="Least Trained"
                  value={capitalizeFirstLetter(detailedStats.leastTrainedMuscleGroup)}
                  icon="💡"
                  variant="compact"
                />
              </View>
            </View>
          )}

          {/* Personal Records */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Records</Text>
              {personalRecords.length > 5 && (
                <Button
                  onPress={handleViewAllPRs}
                  variant="ghost"
                  size="sm"
                >
                  View All
                </Button>
              )}
            </View>
            <View style={styles.recordsList}>
              {personalRecords.slice(0, 5).map((pr, index) => (
                <Card key={index} variant="outlined" padding="md" style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordRank}>
                      <Text style={styles.recordRankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordName}>{pr.exerciseName}</Text>
                      <Text style={styles.recordDate}>{formatDate(pr.date)}</Text>
                    </View>
                    <View style={styles.recordStats}>
                      <Text style={styles.recordWeight}>{pr.weight}</Text>
                      <Text style={styles.recordReps}>× {pr.reps}</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
            {personalRecords.length === 0 && (
              <Card padding="lg">
                <Text style={styles.emptyText}>
                  No personal records yet. Keep training to set new PRs!
                </Text>
              </Card>
            )}
          </View>

          {/* Average Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Averages</Text>
            <Card padding="lg">
              <View style={styles.averageRow}>
                <Text style={styles.averageLabel}>Avg Workout Duration</Text>
                <Text style={styles.averageValue}>
                  {Math.round(detailedStats.averageWorkoutDuration)} min
                </Text>
              </View>
              <View style={styles.averageRow}>
                <Text style={styles.averageLabel}>Avg Sets per Workout</Text>
                <Text style={styles.averageValue}>
                  {detailedStats.averageSetsPerWorkout.toFixed(1)}
                </Text>
              </View>
              <View style={styles.averageRow}>
                <Text style={styles.averageLabel}>Avg Rest Time</Text>
                <Text style={styles.averageValue}>
                  {Math.round(detailedStats.averageRestTime)} sec
                </Text>
              </View>
            </Card>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analytics</Text>
            <View style={styles.actionsContainer}>
              <Button
                onPress={handleViewAnalyticsDashboard}
                variant="outline"
                fullWidth
              >
                Analytics Dashboard
              </Button>
              <Button
                onPress={handleViewExerciseProgress}
                variant="outline"
                fullWidth
              >
                Exercise Progress
              </Button>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const styles = StyleSheet.create({
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  recordsList: {
    gap: Spacing.sm,
  },
  recordCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning[500],
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.warning[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  recordRankText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.warning[700],
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  recordDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  recordStats: {
    alignItems: 'flex-end',
  },
  recordWeight: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  recordReps: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  averageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  averageLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  averageValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
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
