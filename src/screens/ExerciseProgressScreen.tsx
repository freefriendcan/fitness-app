/**
 * ExerciseProgressScreen
 * Per-exercise progress tracking with weight/reps progression and PR highlights
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, Button } from '@/components';
import { LineChart, StatCard } from '@/components/charts';
import { useWorkout } from '@/hooks/useWorkout';
import {
  calculateExerciseProgress,
  getUniqueExercises,
  getExercisePRDate,
  calculatePersonalRecords,
  type TimeRange,
  type ExerciseProgress,
  type PersonalRecord,
} from '@/utils/analytics';
import { formatVolume, formatWeight, formatDate } from '@/utils';
import { Colors, Spacing, Typography, Layout } from '@/constants';
import type { ProfileStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ExerciseProgress'>;

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: '3 Months', value: '3months' },
  { label: 'Year', value: 'year' },
  { label: 'All Time', value: 'all' },
];

export const ExerciseProgressScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useMemo(() => getStyles(), []);

  const { workouts } = useWorkout();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('all');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique exercises
  const uniqueExercises = useMemo(() => getUniqueExercises(workouts), [workouts]);

  // Filter exercises by search
  const filteredExercises = useMemo(() => {
    if (!searchQuery) return uniqueExercises;
    return uniqueExercises.filter((exercise) =>
      exercise.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [uniqueExercises, searchQuery]);

  // Auto-select first exercise if none selected
  React.useEffect(() => {
    if (!selectedExercise && filteredExercises.length > 0) {
      setSelectedExercise(filteredExercises[0]);
    }
  }, [selectedExercise, filteredExercises]);

  // Calculate progress for selected exercise
  const exerciseProgress = useMemo(() => {
    if (!selectedExercise) return [];
    return calculateExerciseProgress(workouts, selectedExercise, selectedRange);
  }, [workouts, selectedExercise, selectedRange]);

  // Get PR date for selected exercise
  const prDate = useMemo(() => {
    if (!selectedExercise) return null;
    return getExercisePRDate(workouts, selectedExercise);
  }, [workouts, selectedExercise]);

  // Get all PRs for comparison
  const allPRs = useMemo(() => calculatePersonalRecords(workouts, selectedRange), [workouts, selectedRange]);
  const selectedExercisePR = useMemo(() => {
    if (!selectedExercise) return null;
    return allPRs.find((pr) => pr.exerciseName === selectedExercise);
  }, [allPRs, selectedExercise]);

  // Prepare chart data
  const weightChartData = useMemo(() => {
    return exerciseProgress.map((d) => ({
      x: d.date.getTime(),
      y: d.weight,
      value: d.weight,
      date: d.date,
    }));
  }, [exerciseProgress]);

  const repsChartData = useMemo(() => {
    return exerciseProgress.map((d) => ({
      x: d.date.getTime(),
      y: d.reps,
      value: d.reps,
      date: d.date,
    }));
  }, [exerciseProgress]);

  const volumeChartData = useMemo(() => {
    return exerciseProgress.map((d) => ({
      x: d.date.getTime(),
      y: d.volume,
      value: d.volume,
      date: d.date,
    }));
  }, [exerciseProgress]);

  // Calculate stats
  const currentWeight = exerciseProgress.length > 0 ? exerciseProgress[exerciseProgress.length - 1].weight : 0;
  const currentReps = exerciseProgress.length > 0 ? exerciseProgress[exerciseProgress.length - 1].reps : 0;
  const currentVolume = exerciseProgress.length > 0 ? exerciseProgress[exerciseProgress.length - 1].volume : 0;

  const initialWeight = exerciseProgress.length > 0 ? exerciseProgress[0].weight : 0;
  const weightChange = currentWeight - initialWeight;
  const weightChangePercentage = initialWeight > 0 ? (weightChange / initialWeight) * 100 : 0;

  const prCount = exerciseProgress.filter((p) => p.isPR).length;

  const hasData = workouts.length > 0 && filteredExercises.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Search and Exercise Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Exercise</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor={Colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.exerciseList}
          contentContainerStyle={styles.exerciseListContent}
        >
          {filteredExercises.map((exercise) => (
            <TouchableOpacity
              key={exercise}
              style={[
                styles.exerciseChip,
                selectedExercise === exercise && styles.exerciseChipActive,
              ]}
              onPress={() => setSelectedExercise(exercise)}
            >
              <Text
                style={[
                  styles.exerciseChipText,
                  selectedExercise === exercise && styles.exerciseChipTextActive,
                ]}
              >
                {exercise}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {!hasData ? (
        <Card padding="lg">
          <Text style={styles.emptyText}>
            No workout data yet. Complete some workouts to see exercise progress!
          </Text>
        </Card>
      ) : !selectedExercise ? (
        <Card padding="lg">
          <Text style={styles.emptyText}>Select an exercise to view progress</Text>
        </Card>
      ) : (
        <>
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

          {/* Key Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Stats</Text>
            <View style={styles.statsRow}>
              <StatCard
                title="Weight"
                value={formatWeight(currentWeight)}
                subtitle="Heaviest set"
                icon="🏋️"
                variant="compact"
                trend={
                  weightChange !== 0
                    ? {
                        value: weightChangePercentage,
                        isPositive: weightChange > 0,
                      }
                    : undefined
                }
              />
              <StatCard
                title="Reps"
                value={currentReps}
                subtitle="Best set"
                icon="🔢"
                variant="compact"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Volume"
                value={formatVolume(currentVolume)}
                subtitle="Total volume"
                icon="📊"
                variant="compact"
              />
              <StatCard
                title="PRs Hit"
                value={prCount}
                subtitle="New records"
                icon="🏆"
                variant="compact"
              />
            </View>
          </View>

          {/* Personal Record Highlight */}
          {selectedExercisePR && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Record</Text>
              <Card variant="outlined" padding="lg" style={styles.prCard}>
                <View style={styles.prHeader}>
                  <Text style={styles.prTitle}>{selectedExercisePR.exerciseName}</Text>
                  <View style={styles.prBadge}>
                    <Text style={styles.prBadgeText}>PR</Text>
                  </View>
                </View>
                <View style={styles.prStats}>
                  <View style={styles.prStat}>
                    <Text style={styles.prStatLabel}>Weight</Text>
                    <Text style={styles.prStatValue}>{formatWeight(selectedExercisePR.weight)}</Text>
                  </View>
                  <View style={styles.prStat}>
                    <Text style={styles.prStatLabel}>Reps</Text>
                    <Text style={styles.prStatValue}>{selectedExercisePR.reps}</Text>
                  </View>
                  <View style={styles.prStat}>
                    <Text style={styles.prStatLabel}>Volume</Text>
                    <Text style={styles.prStatValue}>{formatVolume(selectedExercisePR.volume)}</Text>
                  </View>
                </View>
                <Text style={styles.prDate}>Set on {formatDate(selectedExercisePR.date)}</Text>
              </Card>
            </View>
          )}

          {/* Weight Progression Chart */}
          {exerciseProgress.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weight Progression</Text>
              <Card padding="md">
                <LineChart
                  data={weightChartData}
                  height={200}
                  color={Colors.primary[500]}
                  showDots={true}
                  showGrid={true}
                  showLabels={true}
                  formatYLabel={(value) => formatWeight(value).replace(' kg', '').replace(' lbs', '')}
                />
              </Card>
            </View>
          )}

          {/* Reps Progression Chart */}
          {exerciseProgress.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reps Progression</Text>
              <Card padding="md">
                <LineChart
                  data={repsChartData}
                  height={200}
                  color={Colors.success[500]}
                  showDots={true}
                  showGrid={true}
                  showLabels={true}
                  formatYLabel={(value) => value.toString()}
                />
              </Card>
            </View>
          )}

          {/* Volume Progression Chart */}
          {exerciseProgress.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Volume Progression</Text>
              <Card padding="md">
                <LineChart
                  data={volumeChartData}
                  height={200}
                  color={Colors.secondary[500]}
                  showDots={true}
                  showGrid={true}
                  showLabels={true}
                  formatYLabel={(value) => formatVolume(value)}
                />
              </Card>
            </View>
          )}

          {/* Progress History */}
          {exerciseProgress.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Progress History</Text>
              {exerciseProgress.slice(-5).reverse().map((progress, index) => (
                <Card
                  key={index}
                  variant={progress.isPR ? 'outlined' : 'default'}
                  padding="md"
                  style={[styles.historyCard, progress.isPR && styles.prHistoryCard]}
                >
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>{formatDate(progress.date)}</Text>
                    {progress.isPR && (
                      <View style={styles.prBadgeSmall}>
                        <Text style={styles.prBadgeTextSmall}>PR</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.historyStats}>
                    <Text style={styles.historyStat}>{formatWeight(progress.weight)}</Text>
                    <Text style={styles.historyStat}>× {progress.reps}</Text>
                    <Text style={styles.historyStat}>{formatVolume(progress.volume)}</Text>
                  </View>
                </Card>
              ))}
            </View>
          )}
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
  searchInput: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: Spacing.md,
  },
  exerciseList: {
    marginHorizontal: -Spacing.sm,
  },
  exerciseListContent: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  exerciseChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  exerciseChipActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  exerciseChipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  exerciseChipTextActive: {
    color: Colors.white,
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
  prCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning[500],
  },
  prHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  prTitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  prBadge: {
    backgroundColor: Colors.warning[500],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  prBadgeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  prStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  prStat: {
    alignItems: 'center',
  },
  prStatLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  prStatValue: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  prDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  historyCard: {
    marginBottom: Spacing.sm,
  },
  prHistoryCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning[500],
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  historyDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  prBadgeSmall: {
    backgroundColor: Colors.warning[500],
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.sm,
  },
  prBadgeTextSmall: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  historyStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  historyStat: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
