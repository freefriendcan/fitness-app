/**
 * Analytics utility functions for workout data analysis
 * Provides comprehensive calculations for progress tracking and insights
 */

import type { Workout, Exercise, Set, MuscleGroup } from '@/types';
import { startOfDay, endOfDay, addDays, daysBetween } from './dateHelpers';

// Time range types
export type TimeRange = 'week' | 'month' | '3months' | 'year' | 'all';

// Analytics data structures
export interface VolumeDataPoint {
  date: Date;
  volume: number;
  workouts: number;
}

export interface WorkoutFrequencyData {
  date: Date;
  count: number;
}

export interface MuscleGroupDistribution {
  muscleGroup: MuscleGroup;
  count: number;
  percentage: number;
  volume: number;
}

export interface ExerciseProgress {
  date: Date;
  weight: number;
  reps: number;
  volume: number;
  isPR: boolean;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: Date;
  volume: number;
}

export interface StrengthTrend {
  exerciseName: string;
  currentWeight: number;
  previousWeight: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface WorkoutStreak {
  currentStreak: number;
  longestStreak: number;
  streakHistory: { startDate: Date; endDate: Date; days: number }[];
}

export interface DetailedStats {
  totalWorkouts: number;
  totalVolume: number;
  totalDuration: number;
  averageWorkoutDuration: number;
  averageRestTime: number;
  averageSetsPerWorkout: number;
  mostTrainedMuscleGroup: MuscleGroup | null;
  leastTrainedMuscleGroup: MuscleGroup | null;
  personalRecords: PersonalRecord[];
}

export interface TrendMetrics {
  value: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
}

/**
 * Filter workouts by time range
 */
export const filterWorkoutsByTimeRange = (
  workouts: Workout[],
  range: TimeRange
): Workout[] => {
  const now = new Date();
  let startDate: Date;

  switch (range) {
    case 'week':
      startDate = addDays(now, -7);
      break;
    case 'month':
      startDate = addDays(now, -30);
      break;
    case '3months':
      startDate = addDays(now, -90);
      break;
    case 'year':
      startDate = addDays(now, -365);
      break;
    case 'all':
    default:
      return workouts;
  }

  return workouts.filter((w) => w.date >= startDate && w.date <= now);
};

/**
 * Calculate total volume lifted over time
 */
export const calculateVolumeOverTime = (
  workouts: Workout[],
  range: TimeRange = 'all'
): VolumeDataPoint[] => {
  const filtered = filterWorkoutsByTimeRange(workouts, range);
  const sorted = [...filtered].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by date
  const volumeMap = new Map<string, VolumeDataPoint>();

  sorted.forEach((workout) => {
    const dateKey = startOfDay(workout.date).getTime().toString();
    const volume = calculateWorkoutVolume(workout);

    const existing = volumeMap.get(dateKey);
    if (existing) {
      existing.volume += volume;
      existing.workouts += 1;
    } else {
      volumeMap.set(dateKey, {
        date: startOfDay(workout.date),
        volume,
        workouts: 1,
      });
    }
  });

  return Array.from(volumeMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Calculate workout frequency over time
 */
export const calculateWorkoutFrequency = (
  workouts: Workout[],
  range: TimeRange = 'all'
): WorkoutFrequencyData[] => {
  const filtered = filterWorkoutsByTimeRange(workouts, range);
  const sorted = [...filtered].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by date
  const frequencyMap = new Map<string, number>();

  sorted.forEach((workout) => {
    const dateKey = startOfDay(workout.date).getTime().toString();
    frequencyMap.set(dateKey, (frequencyMap.get(dateKey) || 0) + 1);
  });

  return Array.from(frequencyMap.entries())
    .map(([dateStr, count]) => ({
      date: new Date(parseInt(dateStr)),
      count,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Calculate workout frequency by week/month
 */
export const calculateWorkoutFrequencyByPeriod = (
  workouts: Workout[],
  period: 'week' | 'month',
  range: TimeRange = 'all'
): { label: string; count: number }[] => {
  const filtered = filterWorkoutsByTimeRange(workouts, range);
  const frequencyMap = new Map<string, number>();

  filtered.forEach((workout) => {
    const date = workout.date;
    let key: string;

    if (period === 'week') {
      // Get week number
      const weekNum = getWeekNumber(date);
      key = `${date.getFullYear()}-W${weekNum}`;
    } else {
      // Get month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
  });

  return Array.from(frequencyMap.entries())
    .map(([key, count]) => ({ label: key, count }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Calculate muscle group training distribution
 */
export const calculateMuscleGroupDistribution = (
  workouts: Workout[],
  range: TimeRange = 'all'
): MuscleGroupDistribution[] => {
  const filtered = filterWorkoutsByTimeRange(workouts, range);

  const muscleGroupMap = new Map<MuscleGroup, { count: number; volume: number }>();

  filtered.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const existing = muscleGroupMap.get(exercise.muscleGroup);
      const volume = calculateExerciseVolume(exercise);

      if (existing) {
        existing.count += 1;
        existing.volume += volume;
      } else {
        muscleGroupMap.set(exercise.muscleGroup, { count: 1, volume });
      }
    });
  });

  const totalExercises = Array.from(muscleGroupMap.values()).reduce((sum, v) => sum + v.count, 0);

  return Array.from(muscleGroupMap.entries())
    .map(([muscleGroup, data]) => ({
      muscleGroup,
      count: data.count,
      percentage: totalExercises > 0 ? (data.count / totalExercises) * 100 : 0,
      volume: data.volume,
    }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Calculate exercise progress over time
 */
export const calculateExerciseProgress = (
  workouts: Workout[],
  exerciseName: string,
  range: TimeRange = 'all'
): ExerciseProgress[] => {
  const filtered = filterWorkoutsByTimeRange(workouts, range);
  const exerciseData: ExerciseProgress[] = [];
  let maxWeight = 0;
  let maxVolume = 0;

  filtered.forEach((workout) => {
    const exercise = workout.exercises.find((e) => e.name === exerciseName);
    if (!exercise || exercise.sets.length === 0) return;

    const completedSets = exercise.sets.filter((s) => s.completed);
    if (completedSets.length === 0) return;

    const maxSetWeight = Math.max(...completedSets.map((s) => s.weight));
    const bestSet = completedSets.reduce((best, set) => {
      const setVolume = set.weight * set.reps;
      const bestVolume = best.weight * best.reps;
      return setVolume > bestVolume ? set : best;
    }, completedSets[0]);

    const volume = calculateExerciseVolume(exercise);

    // Check if it's a PR (heaviest weight or highest volume)
    const isWeightPR = maxSetWeight > maxWeight;
    const isVolumePR = volume > maxVolume;
    const isPR = isWeightPR || isVolumePR;

    if (maxSetWeight > maxWeight) maxWeight = maxSetWeight;
    if (volume > maxVolume) maxVolume = volume;

    exerciseData.push({
      date: workout.date,
      weight: bestSet.weight,
      reps: bestSet.reps,
      volume,
      isPR,
    });
  });

  return exerciseData.sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Calculate personal records for all exercises
 */
export const calculatePersonalRecords = (
  workouts: Workout[],
  range: TimeRange = 'all'
): PersonalRecord[] => {
  const filtered = filterWorkoutsByTimeRange(workouts, range);
  const recordsMap = new Map<string, PersonalRecord>();

  filtered.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const completedSets = exercise.sets.filter((s) => s.completed);
      if (completedSets.length === 0) return;

      const bestSet = completedSets.reduce((best, set) => {
        const setVolume = set.weight * set.reps;
        const bestVolume = best.weight * best.reps;
        return setVolume > bestVolume ? set : best;
      }, completedSets[0]);

      const volume = bestSet.weight * bestSet.reps;
      const existing = recordsMap.get(exercise.name);

      if (!existing || volume > existing.volume) {
        recordsMap.set(exercise.name, {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          weight: bestSet.weight,
          reps: bestSet.reps,
          date: workout.date,
          volume,
        });
      }
    });
  });

  return Array.from(recordsMap.values()).sort((a, b) => b.volume - a.volume);
};

/**
 * Calculate strength trends for exercises
 */
export const calculateStrengthTrends = (
  workouts: Workout[],
  range: TimeRange = 'month'
): StrengthTrend[] => {
  const filtered = filterWorkoutsByTimeRange(workouts, range);
  const exerciseProgressMap = new Map<string, ExerciseProgress[]>();

  // Group progress by exercise
  filtered.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const completedSets = exercise.sets.filter((s) => s.completed);
      if (completedSets.length === 0) return;

      const bestSet = completedSets.reduce((best, set) => {
        const setVolume = set.weight * set.reps;
        const bestVolume = best.weight * best.reps;
        return setVolume > bestVolume ? set : best;
      }, completedSets[0]);

      const progress = exerciseProgressMap.get(exercise.name) || [];
      progress.push({
        date: workout.date,
        weight: bestSet.weight,
        reps: bestSet.reps,
        volume: bestSet.weight * bestSet.reps,
        isPR: false,
      });
      exerciseProgressMap.set(exercise.name, progress);
    });
  });

  // Calculate trends
  const trends: StrengthTrend[] = [];

  exerciseProgressMap.forEach((progress, exerciseName) => {
    if (progress.length < 2) return;

    const sorted = progress.sort((a, b) => a.date.getTime() - b.date.getTime());
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const change = last.weight - first.weight;
    const changePercentage = first.weight > 0 ? (change / first.weight) * 100 : 0;

    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (change > 0.1) trend = 'up';
    else if (change < -0.1) trend = 'down';

    trends.push({
      exerciseName,
      currentWeight: last.weight,
      previousWeight: first.weight,
      change,
      changePercentage,
      trend,
    });
  });

  return trends.sort((a, b) => b.changePercentage - a.changePercentage);
};

/**
 * Calculate workout streaks
 */
export const calculateWorkoutStreaks = (workouts: Workout[]): WorkoutStreak => {
  if (workouts.length === 0) {
    return { currentStreak: 0, longestStreak: 0, streakHistory: [] };
  }

  const sorted = [...workouts].sort((a, b) => a.date.getTime() - b.date.getTime());
  const uniqueDates = Array.from(
    new Set(sorted.map((w) => startOfDay(w.date).getTime()))
  ).sort((a, b) => a - b);

  let currentStreak = 0;
  let longestStreak = 0;
  const streakHistory: { startDate: Date; endDate: Date; days: number }[] = [];

  let streakStart: Date | null = null;
  let streakEnd: Date | null = null;
  let streakDays = 0;

  for (let i = 0; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const prevDate = i > 0 ? new Date(uniqueDates[i - 1]) : null;

    if (!prevDate) {
      // First workout
      streakStart = currentDate;
      streakEnd = currentDate;
      streakDays = 1;
      currentStreak = 1;
    } else {
      const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        // Consecutive day
        streakDays++;
        streakEnd = currentDate;
        currentStreak = streakDays;
      } else if (dayDiff > 1) {
        // Streak broken
        if (streakStart && streakEnd) {
          streakHistory.push({
            startDate: streakStart,
            endDate: streakEnd,
            days: streakDays,
          });
        }

        longestStreak = Math.max(longestStreak, streakDays);

        // Check if this is the current streak
        const today = new Date();
        const daysSinceLastWorkout = daysBetween(today, streakEnd!);
        if (daysSinceLastWorkout > 1) {
          currentStreak = 0;
        }

        // Start new streak
        streakStart = currentDate;
        streakEnd = currentDate;
        streakDays = 1;
      }
    }
  }

  // Add the last streak
  if (streakStart && streakEnd) {
    streakHistory.push({
      startDate: streakStart,
      endDate: streakEnd,
      days: streakDays,
    });
  }

  // Update longest streak
  longestStreak = Math.max(longestStreak, streakDays);

  // Check if current streak is still active
  const today = new Date();
  const lastWorkout = new Date(uniqueDates[uniqueDates.length - 1]);
  const daysSinceLastWorkout = daysBetween(today, lastWorkout);
  if (daysSinceLastWorkout > 1) {
    currentStreak = 0;
  }

  return {
    currentStreak,
    longestStreak,
    streakHistory,
  };
};

/**
 * Calculate detailed statistics
 */
export const calculateDetailedStats = (
  workouts: Workout[],
  range: TimeRange = 'all'
): DetailedStats => {
  const filtered = filterWorkoutsByTimeRange(workouts, range);

  const totalWorkouts = filtered.length;
  const totalVolume = filtered.reduce((sum, w) => sum + calculateWorkoutVolume(w), 0);
  const totalDuration = filtered.reduce((sum, w) => sum + w.duration, 0);

  const averageWorkoutDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;

  // Calculate average rest time
  let totalRestTime = 0;
  let totalSets = 0;

  filtered.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      if (exercise.restTime) {
        totalRestTime += exercise.restTime * (exercise.sets.length - 1);
      }
      totalSets += exercise.sets.length;
    });
  });

  const averageRestTime = totalSets > 0 ? totalRestTime / totalSets : 0;
  const averageSetsPerWorkout = totalWorkouts > 0 ? totalSets / totalWorkouts : 0;

  // Muscle group distribution
  const distribution = calculateMuscleGroupDistribution(filtered, 'all');
  const mostTrainedMuscleGroup = distribution.length > 0 ? distribution[0].muscleGroup : null;
  const leastTrainedMuscleGroup =
    distribution.length > 0 ? distribution[distribution.length - 1].muscleGroup : null;

  // Personal records
  const personalRecords = calculatePersonalRecords(filtered, 'all');

  return {
    totalWorkouts,
    totalVolume,
    totalDuration,
    averageWorkoutDuration,
    averageRestTime,
    averageSetsPerWorkout,
    mostTrainedMuscleGroup,
    leastTrainedMuscleGroup,
    personalRecords,
  };
};

/**
 * Calculate trend metrics (current vs previous period)
 */
export const calculateTrendMetrics = (
  workouts: Workout[],
  metric: 'workouts' | 'volume' | 'duration',
  range: TimeRange = 'month'
): TrendMetrics => {
  const now = new Date();
  let currentPeriodStart: Date;
  let previousPeriodStart: Date;
  let previousPeriodEnd: Date;

  switch (range) {
    case 'week':
      currentPeriodStart = addDays(now, -7);
      previousPeriodStart = addDays(now, -14);
      previousPeriodEnd = currentPeriodStart;
      break;
    case 'month':
      currentPeriodStart = addDays(now, -30);
      previousPeriodStart = addDays(now, -60);
      previousPeriodEnd = currentPeriodStart;
      break;
    case '3months':
      currentPeriodStart = addDays(now, -90);
      previousPeriodStart = addDays(now, -180);
      previousPeriodEnd = currentPeriodStart;
      break;
    case 'year':
      currentPeriodStart = addDays(now, -365);
      previousPeriodStart = addDays(now, -730);
      previousPeriodEnd = currentPeriodStart;
      break;
    default:
      return { value: 0, previousValue: 0, change: 0, changePercentage: 0, trend: 'neutral' };
  }

  const currentWorkouts = workouts.filter(
    (w) => w.date >= currentPeriodStart && w.date <= now
  );
  const previousWorkouts = workouts.filter(
    (w) => w.date >= previousPeriodStart && w.date < previousPeriodEnd
  );

  let value = 0;
  let previousValue = 0;

  if (metric === 'workouts') {
    value = currentWorkouts.length;
    previousValue = previousWorkouts.length;
  } else if (metric === 'volume') {
    value = currentWorkouts.reduce((sum, w) => sum + calculateWorkoutVolume(w), 0);
    previousValue = previousWorkouts.reduce((sum, w) => sum + calculateWorkoutVolume(w), 0);
  } else if (metric === 'duration') {
    value = currentWorkouts.reduce((sum, w) => sum + w.duration, 0);
    previousValue = previousWorkouts.reduce((sum, w) => sum + w.duration, 0);
  }

  const change = value - previousValue;
  const changePercentage = previousValue > 0 ? (change / previousValue) * 100 : 0;

  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  if (change > 0) trend = 'up';
  else if (change < 0) trend = 'down';

  return {
    value,
    previousValue,
    change,
    changePercentage,
    trend,
  };
};

/**
 * Calculate workout volume
 */
export const calculateWorkoutVolume = (workout: Workout): number => {
  return workout.exercises.reduce((sum, exercise) => sum + calculateExerciseVolume(exercise), 0);
};

/**
 * Calculate exercise volume
 */
export const calculateExerciseVolume = (exercise: Exercise): number => {
  return exercise.sets
    .filter((s) => s.completed)
    .reduce((sum, set) => sum + set.weight * set.reps, 0);
};

/**
 * Get week number from date
 */
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

/**
 * Get all unique exercise names from workouts
 */
export const getUniqueExercises = (workouts: Workout[]): string[] => {
  const exerciseSet = new Set<string>();
  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exerciseSet.add(exercise.name);
    });
  });
  return Array.from(exerciseSet).sort();
};

/**
 * Get most recent PR date for an exercise
 */
export const getExercisePRDate = (workouts: Workout[], exerciseName: string): Date | null => {
  const prs = calculatePersonalRecords(workouts, 'all');
  const pr = prs.find((p) => p.exerciseName === exerciseName);
  return pr?.date || null;
};
